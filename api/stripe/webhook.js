import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  // Vercel's Node.js runtime provides req.rawBody (a Buffer) for webhook verification.
  // If unavailable (older runtimes), we reconstruct from the parsed body as a fallback.
  const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = makeSupabase();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sub = await stripe.subscriptions.retrieve(String(session.subscription));
      const email = session.customer_details?.email || session.customer_email;
      const { error } = await db.from('subscribers').upsert({
        email,
        stripe_customer_id: String(session.customer),
        stripe_subscription_id: String(session.subscription),
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'stripe_customer_id' });
      if (error) throw error;
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const customer = await stripe.customers.retrieve(String(sub.customer));
      const { error } = await db.from('subscribers').upsert({
        email: customer.email,
        stripe_customer_id: String(sub.customer),
        stripe_subscription_id: sub.id,
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'stripe_customer_id' });
      if (error) throw error;
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: err.message });
  }
}
