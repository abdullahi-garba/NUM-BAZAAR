import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Bypasses RLS to forcefully secure the ledger
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // Verify the signature comes from Paystack
  const secret = process.env.sk_test_687b05763fe9a86150da106b7bf387b0eed6336f;
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Unauthorized Signature');
  }

  const event = req.body;

  // Handle successful transactions
  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    
    if (reference.startsWith('NUM_')) {
      // Escrow Checkout Fallback
      await supabase.from('orders').update({ status: 'Paid (In Escrow)' }).eq('paystack_reference', reference);
      
    } else if (reference.startsWith('SUB_')) {
      // Subscription Verification Fallback
      const email = event.data.customer.email;
      const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single();
      
      if (user) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await supabase.from('profiles').update({ is_subscribed: true, subscription_expires_at: expiryDate.toISOString() }).eq('id', user.id);
      }
    }
  }

  res.status(200).send('Webhook Received');
}