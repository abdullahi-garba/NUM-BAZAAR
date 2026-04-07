import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Setup CORS headers so your Vue.js frontend is allowed to talk to this backend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight request from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Initialize Supabase client securely using the user's Auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 3. Get the user who clicked the "Withdraw" button
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Unauthorized request. Please log in.")

    // 4. Parse the data sent from the Vue frontend
    const { amount, accountNumber, bankCode } = await req.json()
    const withdrawalAmount = Number(amount)

    if (withdrawalAmount < 100) throw new Error("Minimum withdrawal is ₦100")

    // 5. SECURITY CHECK: Verify they actually have the money in their wallet
    const { data: profile, error: profileErr } = await supabaseClient
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) throw new Error("Could not verify wallet balance.")
    if (Number(profile.wallet_balance) < withdrawalAmount) {
      throw new Error("Insufficient funds in your wallet.")
    }

    // 6. Get the Paystack Secret Key from the secure vault
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!PAYSTACK_SECRET_KEY) throw new Error("Payment gateway configuration error.")

    // --- PAYSTACK API PHASE ---

    // 7. Create a Transfer Recipient in Paystack
    const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: "nuban",
        name: "NUM BAZAAR Vendor Payout",
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN"
      })
    })
    
    const recipientData = await recipientRes.json()
    if (!recipientData.status) throw new Error("Invalid bank account details provided.")

    const recipientCode = recipientData.data.recipient_code

    // 8. Initiate the actual money transfer
    const transferRes = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: "balance",
        amount: withdrawalAmount * 100, // Paystack requires the amount in Kobo
        recipient: recipientCode,
        reason: "NUM BAZAAR Storefront Payout"
      })
    })

    const transferData = await transferRes.json()
    if (!transferData.status) throw new Error("Paystack transfer failed: " + transferData.message)

    // --- DATABASE UPDATE PHASE ---

    // 9. Deduct the money from their Supabase Wallet
    const newBalance = Number(profile.wallet_balance) - withdrawalAmount
    const { error: updateErr } = await supabaseClient
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', user.id)
    
    if (updateErr) throw new Error("Money sent, but failed to update wallet. Contact Admin.")

    // 10. Record the transaction receipt
    await supabaseClient.from('transactions').insert([{
      profile_id: user.id,
      amount: withdrawalAmount,
      type: 'debit',
      status: 'Completed',
      description: `Withdrawal to Bank (${accountNumber.slice(-4)})`
    }])

    // 11. Send Success Response back to Vue
    return new Response(
      JSON.stringify({ success: true, message: "Funds are on the way!" }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // Catch any errors and send them back to the frontend to show the user
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})