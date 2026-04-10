import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Environment Variable securely injected by Supabase
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = "admin@numbazaar.com" 

// Helper function to dispatch Email via Resend
async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable.");
    return;
  }
  
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${RESEND_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        from: 'NUM BAZAAR Alerts <noreply@numbazaar.com>', // Ensure this domain is verified in Resend
        to: to,
        subject: subject,
        html: html
      })
    });
  } catch (error) {
    console.error("Error sending email via Resend:", error);
  }
}

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const table = payload.table;
    const type = payload.type;
    const record = payload.record; 
    const oldRecord = payload.old_record || {};

    // --- 1. ORDERS TABLE (Purchases) ---
    if (table === 'orders' && type === 'INSERT') {
      // Notify Vendor
      await sendEmail("vendor@example.com", `🎉 New Order on NUM BAZAAR: ${record.product_name}`, `
        <h2>You have a new sale!</h2>
        <p>Funds (₦${record.product_price}) are locked in Escrow for: <strong>${record.product_name}</strong>.</p>
        <p>Coordinate delivery with the buyer to release your funds.</p>
      `);

      // Notify Buyer (Receipt)
      await sendEmail("buyer@example.com", `Receipt: Escrow Payment Secured`, `
        <h2>Payment Successful</h2>
        <p>Your payment of ₦${record.total_amount} is securely locked. Do not confirm delivery until you physically inspect the item.</p>
      `);
    }

    // --- 2. TRANSACTIONS TABLE (Payouts & Escrow Releases) ---
    else if (table === 'transactions' && type === 'INSERT') {
      if (record.type === 'debit' && record.status === 'Pending') {
        // Vendor requested payout -> Notify Admin
        await sendEmail(ADMIN_EMAIL, `Action Required: New Payout Request`, `
          <p>A vendor has requested a withdrawal of ₦${record.amount}.</p>
          <p>Bank Details: ${record.description}</p>
          <p>Please log in to the Command Center to process.</p>
        `);
      } else if (record.type === 'credit' && record.description.includes('Escrow Released')) {
        // Buyer clicked Confirm Delivery -> Notify Vendor
        await sendEmail("vendor@example.com", `💰 Funds Released to Wallet!`, `
          <h2>Delivery Confirmed</h2>
          <p>₦${record.amount} has been moved from Escrow to your Available Wallet. You can now request a bank payout.</p>
        `);
      }
    }

    // --- 3. PROFILES TABLE (KYC, Subscriptions, Registration) ---
    else if (table === 'profiles') {
      if (type === 'INSERT') {
        // New User -> Notify Admin
        await sendEmail(ADMIN_EMAIL, `New User Registration`, `<p>New account created: @${record.username} (${record.role})</p>`);
      } 
      else if (type === 'UPDATE') {
        // KYC Uploaded
        if (record.id_card_url && oldRecord.id_card_url !== record.id_card_url) {
          await sendEmail(ADMIN_EMAIL, `Action Required: KYC Submission`, `<p>@${record.username} uploaded a ${record.kyc_doc_type || 'document'}. Review required.</p>`);
        }
        // New Subscription Purchased
        if (record.subscription_ends_at && oldRecord.subscription_ends_at !== record.subscription_ends_at) {
          await sendEmail(ADMIN_EMAIL, `New Storefront Subscription`, `<p>@${record.username} successfully paid for a 30-day Vendor pass.</p>`);
        }
      }
    }

    // --- 4. PRODUCTS TABLE (Approvals) ---
    else if (table === 'products' && type === 'UPDATE' && record.is_approved && !oldRecord.is_approved) {
      await sendEmail("vendor@example.com", `✅ Product Approved`, `<p>Your item <strong>${record.title}</strong> is now live on the campus feed.</p>`);
    }

    // --- 5. TICKETS TABLE (Support/Disputes) ---
    else if (table === 'tickets' && type === 'INSERT') {
      await sendEmail(ADMIN_EMAIL, `URGENT: New Support Ticket`, `<p><strong>Subject:</strong> ${record.subject}</p><p>Review immediately in the Admin Command Center.</p>`);
    }
    
    // --- 6. EMAIL QUEUE (Admin Broadcasts) ---
    else if (table === 'email_queue' && type === 'INSERT') {
      await sendEmail(record.email_address, record.subject, record.html_body);
    }

    return new Response(JSON.stringify({ message: "Email routings evaluated." }), { status: 200 });

  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})