// /api/webhook-paystack.js
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers['x-paystack-signature'];
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const { reference, amount, status } = event.data;

    const { error } = await supabase.from('donations').insert({
      reference,
      amount: amount / 100,
      provider: 'paystack',
      status,
    });

    if (error && !error.message.includes('duplicate')) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to record donation' });
    }
  }

  res.status(200).json({ received: true });
}
