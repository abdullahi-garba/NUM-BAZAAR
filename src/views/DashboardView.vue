<template>
  <div class="bg-light min-vh-100 pb-5">
    
    <div style="background-color: #082b59; color: white; padding: 60px 0 40px 0;">
      <div class="container px-lg-5">
        <h2 class="fw-black mb-1">Vendor Dashboard</h2>
        <p class="text-white-50 fw-medium mb-0">Manage your storefront, track escrow sales, and withdraw your earnings.</p>
      </div>
    </div>

    <div class="container px-lg-5" style="margin-top: -30px;">
      
      <div v-if="isLoading" class="text-center py-5 bg-white shadow-sm rounded-4"><div class="spinner-border" style="color: #b22b1d;"></div></div>
      
      <div v-else-if="profile">

        <div v-if="!profile.is_subscribed" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
          <div class="rounded-circle d-inline-flex justify-content-center align-items-center mb-4" style="width: 80px; height: 80px; background-color: #fef2f2; color: #b22b1d;">
            <i class="bi bi-lock-fill fs-1"></i>
          </div>
          <h3 class="fw-bold text-dark">Unlock Your Storefront</h3>
          <p class="text-secondary fw-medium mx-auto mb-4" style="max-width: 500px;">
            To start selling to the Newgate University campus, you need to activate your vendor account. This includes access to the secure Escrow system and instant bank payouts.
          </p>
          
          <div class="bg-light p-4 rounded-4 mx-auto mb-4" style="max-width: 400px; border: 1px solid rgba(0,0,0,0.05);">
            <h5 class="fw-bold text-dark mb-1">One-Time Activation</h5>
            <h2 class="fw-black mb-0" style="color: #082b59;">₦2,000</h2>
          </div>

          <button @click="processSubscription" class="btn fw-bold py-3 px-5 rounded-pill shadow-sm d-inline-flex align-items-center gap-2" style="background-color: #082b59; color: white; font-size: 1.1rem;" :disabled="isProcessing">
            <span v-if="isProcessing" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-credit-card-fill"></i>
            {{ isProcessing ? 'Loading Secure Payment...' : 'Pay with Paystack' }}
          </button>
        </div>

        <div v-else class="row g-4">
          
          <div class="col-md-6">
            <div class="bg-white p-4 shadow-sm h-100 position-relative overflow-hidden" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
              <div class="position-absolute top-0 end-0 p-3 opacity-25"><i class="bi bi-wallet2" style="font-size: 4rem; color: #10b981;"></i></div>
              <h6 class="fw-bold text-secondary text-uppercase small mb-2" style="letter-spacing: 0.05em;">Available Wallet Balance</h6>
              <h1 class="fw-black mb-1" style="color: #10b981; font-size: 2.5rem;">₦{{ Number(profile.wallet_balance || 0).toLocaleString() }}</h1>
              <p class="small text-secondary fw-medium mb-0">Funds ready for instant bank withdrawal.</p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="bg-white p-4 shadow-sm h-100 position-relative overflow-hidden" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
              <div class="position-absolute top-0 end-0 p-3 opacity-25"><i class="bi bi-shield-lock" style="font-size: 4rem; color: #f59e0b;"></i></div>
              <h6 class="fw-bold text-secondary text-uppercase small mb-2" style="letter-spacing: 0.05em;">Pending in Escrow</h6>
              <h1 class="fw-black mb-1" style="color: #f59e0b; font-size: 2.5rem;">₦{{ Number(profile.escrow_balance || 0).toLocaleString() }}</h1>
              <p class="small text-secondary fw-medium mb-0">Funds locked until buyers confirm delivery.</p>
            </div>
          </div>

          <div class="col-lg-8">
            <div class="bg-white p-4 shadow-sm mb-4" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
              <h5 class="fw-bold text-dark mb-4 border-bottom pb-3"><i class="bi bi-bank2 me-2" style="color: #082b59;"></i> Withdraw to Bank Account</h5>
              
              <form @submit.prevent="requestWithdrawal">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-dark">Amount (₦)</label>
                    <input type="number" v-model="withdrawForm.amount" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;" :max="profile.wallet_balance" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-dark">Select Bank</label>
                    <select v-model="withdrawForm.bankCode" class="form-select" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;" required>
                      <option value="" disabled>Choose...</option>
                      <option value="044">Access Bank</option>
                      <option value="058">GTBank</option>
                      <option value="033">UBA</option>
                      <option value="057">Zenith Bank</option>
                      <option value="011">First Bank</option>
                      <option value="50515">Moniepoint</option>
                      <option value="090267">Kuda Bank</option>
                      <option value="100004">Opay</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-dark">Account Number</label>
                    <input type="text" v-model="withdrawForm.accountNumber" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;" maxlength="10" required>
                  </div>
                </div>
                
                <div class="mt-4 text-end">
                  <button type="submit" class="btn fw-bold px-5 py-2 rounded-pill shadow-sm" style="background-color: #10b981; color: white;" :disabled="isWithdrawing || profile.wallet_balance <= 0">
                    <span v-if="isWithdrawing" class="spinner-border spinner-border-sm me-2"></span> 
                    {{ isWithdrawing ? 'Processing Transfer...' : 'Withdraw Funds' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="bg-white p-4 shadow-sm d-flex flex-column justify-content-center align-items-center text-center h-100" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
              <i class="bi bi-box-seam mb-3" style="font-size: 3rem; color: #b22b1d;"></i>
              <h5 class="fw-bold text-dark mb-2">Manage Storefront</h5>
              <p class="text-secondary small fw-medium mb-4">Post new items, track pending sales, and view your public profile.</p>
              <button @click="router.push(`/profile/${currentUser.id}`)" class="btn w-100 fw-bold py-2 rounded-pill" style="background-color: #f3f4f6; color: #111827; border: 1px solid #e5e7eb;">
                Go to My Profile <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)
const profile = ref(null)

const isLoading = ref(true)
const isProcessing = ref(false)
const isWithdrawing = ref(false)

const withdrawForm = ref({ amount: '', bankCode: '', accountNumber: '' })

onMounted(async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (sessionData.session) {
    currentUser.value = sessionData.session.user
    
    // Fetch profile to check subscription & balances
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.value.id)
      .single()
      
    profile.value = userProfile
  } else {
    router.push('/auth')
  }
  isLoading.value = false
})

// ==========================================
// 1. PAYSTACK SUBSCRIPTION LOGIC
// ==========================================
const processSubscription = () => {
  if (window.PaystackPop) {
    launchPaystack();
    return;
  }

  // Inject Paystack script dynamically
  const script = document.createElement('script');
  script.src = "https://js.paystack.co/v1/inline.js";
  script.async = true;
  script.onload = () => launchPaystack();
  script.onerror = () => alert("Failed to load secure payment gateway. Please check your internet connection.");
  document.body.appendChild(script);
};

const launchPaystack = () => {
  const handler = window.PaystackPop.setup({
    key: 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY', // <-- REPLACE WITH YOUR KEY
    email: currentUser.value.email,
    amount: 2000 * 100, // ₦2,000 in kobo
    currency: 'NGN',
    callback: async function(response) {
      alert('Subscription Successful! Ref: ' + response.reference);
      try {
        await supabase.from('profiles').update({ is_subscribed: true }).eq('id', currentUser.value.id);
        window.location.reload();
      } catch(err) {
        console.error("Database update failed:", err);
      }
    },
    onClose: function(){
      alert('Transaction window was closed.');
    }
  });
  handler.openIframe();
};

// ==========================================
// 2. SUPABASE EDGE FUNCTION WITHDRAWAL LOGIC
// ==========================================
const requestWithdrawal = async () => {
  if (withdrawForm.value.amount > profile.value.wallet_balance) {
    return alert("You cannot withdraw more than your available balance.");
  }
  if (withdrawForm.value.amount < 100) {
    return alert("Minimum withdrawal amount is ₦100.");
  }

  isWithdrawing.value = true;
  
  try {
    // This calls the Supabase Edge Function: supabase/functions/paystack-payout/index.ts
    const { data, error } = await supabase.functions.invoke('paystack-payout', {
      body: withdrawForm.value
    });

    if (error) throw new Error(error.message);
    if (data.error) throw new Error(data.error);

    alert("Withdrawal successful! The funds are on their way to your bank account.");
    
    // Instantly update the UI balance
    profile.value.wallet_balance -= withdrawForm.value.amount;
    
    // Reset form
    withdrawForm.value = { amount: '', bankCode: '', accountNumber: '' };

  } catch (error) {
    console.error("Payout Error:", error);
    alert("Withdrawal failed: " + error.message);
  } finally {
    isWithdrawing.value = false;
  }
};
</script>

<style scoped>
input, select { font-size: 16px !important; }
</style>