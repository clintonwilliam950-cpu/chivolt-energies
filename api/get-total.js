// /api/get-total.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'success');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch total' });
  }

  const total = data.reduce((sum, row) => sum + Number(row.amount), 0);

  res.status(200).json({ total });
}
