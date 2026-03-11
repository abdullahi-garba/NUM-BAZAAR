<template>
  <div class="container py-5 mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h2 class="fw-black mb-0" style="color: #082b59;"><i class="bi bi-shop-window me-2"></i>Seller Hub</h2>
      
      <span v-if="isSubActive" class="badge bg-success-subtle text-success border border-success rounded-pill px-3 py-2 fs-6">
        <i class="bi bi-patch-check-fill me-1"></i> Verified Seller
      </span>
      <span v-else-if="userProfile?.is_subscribed && !isSubActive" class="badge bg-warning-subtle text-danger border border-danger rounded-pill px-3 py-2 fs-6">
        <i class="bi bi-exclamation-triangle-fill me-1"></i> Subscription Expired
      </span>
      <span v-else class="badge bg-danger-subtle text-danger border border-danger rounded-pill px-3 py-2 fs-6">
        <i class="bi bi-x-circle-fill me-1"></i> Unverified
      </span>
    </div>

    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div></div>

    <div v-else class="row g-4">
      <div class="col-lg-3">
        <div class="card shadow-sm border-0 rounded-4 p-3 bg-white sticky-top" style="top: 100px;">
          <div class="nav flex-column nav-pills" role="tablist">
            <button class="nav-link text-start fw-bold mb-2 active" data-bs-toggle="pill" data-bs-target="#wallet" type="button" style="border-radius: 12px;"><i class="bi bi-wallet2 me-2"></i> Digital Wallet</button>
            <button class="nav-link text-start fw-bold mb-2" data-bs-toggle="pill" data-bs-target="#orders" type="button" style="border-radius: 12px;"><i class="bi bi-box-seam me-2"></i> Active Orders</button>
            <button class="nav-link text-start fw-bold mb-2" data-bs-toggle="pill" data-bs-target="#inventory" type="button" style="border-radius: 12px;"><i class="bi bi-grid me-2"></i> Inventory Manager</button>
            <button class="nav-link text-start fw-bold" data-bs-toggle="pill" data-bs-target="#subscription" type="button" style="border-radius: 12px;"><i class="bi bi-star-fill me-2"></i> Subscription Plan</button>
          </div>
        </div>
      </div>

      <div class="col-lg-9">
        <div class="tab-content">
          <div class="tab-pane fade show active" id="wallet" role="tabpanel">
            <div class="row g-4 mb-4">
              <div class="col-md-6">
                <div class="card shadow-lg border-0 rounded-4 overflow-hidden text-white h-100" style="background: linear-gradient(135deg, #082b59 0%, #1a1a1a 100%);">
                  <div class="card-body p-4 position-relative">
                    <i class="bi bi-cash-stack position-absolute opacity-25" style="font-size: 8rem; right: -20px; top: -20px;"></i>
                    <h6 class="fw-bold opacity-75 mb-1">Available Balance</h6>
                    <h1 class="fw-black display-5 mb-4">₦{{ Number(userProfile?.wallet_balance || 0).toLocaleString() }}</h1>
                    <button class="btn btn-light fw-bold rounded-pill shadow-sm px-4 text-primary" @click="showWithdrawForm = !showWithdrawForm">Withdraw to Bank</button>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card shadow-sm border-0 rounded-4 overflow-hidden bg-white h-100">
                  <div class="card-body p-4 d-flex flex-column justify-content-center">
                    <div class="d-flex justify-content-between align-items-center mb-2"><h6 class="fw-bold text-muted mb-0">Locked in Escrow</h6><i class="bi bi-shield-lock-fill text-warning fs-4"></i></div>
                    <h2 class="fw-black mb-2" style="color: #800000;">₦{{ Number(userProfile?.escrow_balance || 0).toLocaleString() }}</h2>
                    <p class="small text-muted mb-0">Funds automatically move to Available Balance once buyers confirm delivery.</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="showWithdrawForm" class="card shadow-sm border border-primary rounded-4 bg-primary-subtle p-4 mb-4">
               <h5 class="fw-bold text-primary mb-3">Initiate Bank Withdrawal</h5>
               <form @submit.prevent="processWithdrawal" class="row g-3">
                 <div class="col-md-4"><label class="fw-bold small">Bank Name</label><input type="text" class="form-control" v-model="withdrawData.bank" required placeholder="e.g. GTBank"></div>
                 <div class="col-md-4"><label class="fw-bold small">Account Number</label><input type="text" class="form-control" v-model="withdrawData.account" required placeholder="0123456789"></div>
                 <div class="col-md-4"><label class="fw-bold small">Amount (₦)</label><input type="number" class="form-control" v-model="withdrawData.amount" required placeholder="0"></div>
                 <div class="col-12 text-end">
                   <button type="button" @click="showWithdrawForm = false" class="btn btn-secondary fw-bold rounded-pill px-4 me-2">Cancel</button>
                   <button type="submit" class="btn btn-primary fw-bold rounded-pill px-4" style="background-color: #082b59; border: none;">Confirm Transfer</button>
                 </div>
               </form>
            </div>

            <div class="card shadow-sm border-0 rounded-4 bg-white">
              <div class="card-header bg-white border-bottom p-4"><h5 class="fw-bold mb-0">Transaction Ledger</h5></div>
              <div v-if="transactions.length === 0" class="p-5 text-center text-muted"><i class="bi bi-receipt fs-1 mb-2 d-block"></i><p>No transactions yet.</p></div>
              
              <ul v-else class="list-group list-group-flush">
                <li v-for="txn in transactions" :key="txn.id" class="list-group-item p-4 d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    
                    <div v-if="txn.description.includes('[ESCROW CLEARED]')" class="bg-success-subtle text-success rounded-circle p-3 me-3"><i class="bi bi-check-circle-fill fs-5"></i></div>
                    <div v-else-if="txn.type === 'debit'" class="bg-danger-subtle text-danger rounded-circle p-3 me-3"><i class="bi bi-arrow-up-right fs-5"></i></div>
                    <div v-else class="bg-warning-subtle text-warning rounded-circle p-3 me-3"><i class="bi bi-shield-lock-fill fs-5"></i></div>
                    
                    <div>
                      <h6 class="fw-bold mb-0 text-dark">{{ txn.description }}</h6>
                      <small class="text-muted">{{ new Date(txn.created_at).toLocaleString() }}</small>
                    </div>
                  </div>
                  
                  <h6 class="fw-black mb-0" :class="txn.type === 'debit' ? 'text-danger' : (txn.description.includes('[ESCROW CLEARED]') ? 'text-success' : 'text-warning')">
                    {{ txn.type === 'debit' ? '-' : '+' }} ₦{{ Number(txn.amount).toLocaleString() }}
                  </h6>
                </li>
              </ul>

            </div>
          </div>

          <div class="tab-pane fade" id="orders" role="tabpanel">
            <div class="card shadow-sm border-0 rounded-4 bg-white">
              <div class="card-header bg-white border-bottom p-4"><h5 class="fw-bold mb-0">Orders to Fulfill</h5></div>
              <div v-if="sellerOrders.length === 0" class="card-body p-5 text-center text-muted"><i class="bi bi-box2 fs-1 d-block mb-3"></i><h6>You have no pending orders to ship right now.</h6></div>
              <ul v-else class="list-group list-group-flush">
                <li v-for="order in sellerOrders" :key="order.id" class="list-group-item p-4">
                  <div class="d-flex align-items-center"><img :src="order.product_image" class="rounded-3 me-3 shadow-sm" style="width: 60px; height: 60px; object-fit: cover;"><div class="flex-grow-1"><h6 class="fw-bold mb-0">{{ order.product_name }}</h6><span class="badge bg-warning-subtle text-dark border border-warning mt-1"><i class="bi bi-shield-lock-fill me-1"></i> Funds Locked</span></div><div class="text-end"><h6 class="fw-black mb-1 text-danger">₦{{ Number(order.product_price).toLocaleString() }}</h6></div></div>
                </li>
              </ul>
            </div>
          </div>
          <div class="tab-pane fade" id="inventory" role="tabpanel">
            <div class="card shadow-sm border-0 rounded-4 bg-white p-5 text-center"><h5 class="fw-bold mb-3">Manage Your Products</h5><p class="text-muted">You can edit prices, stock, and descriptions directly from your Universal Profile.</p><router-link :to="`/profile/${currentUser?.id}`" class="btn btn-primary fw-bold rounded-pill px-4 mx-auto" style="background-color: #082b59; border: none; width: fit-content;">Go to Profile</router-link></div>
          </div>

          <div class="tab-pane fade" id="subscription" role="tabpanel">
             <div class="card shadow-sm border-0 rounded-4 bg-white p-5 text-center">
                
                <div v-if="isSubActive">
                  <i class="bi bi-patch-check-fill text-success" style="font-size: 5rem;"></i>
                  <h3 class="fw-black mt-3 text-dark">Subscription Active</h3>
                  <p class="text-muted mb-4">Your storefront is live. Keep selling!</p>
                  
                  <div class="bg-light p-3 rounded-4 d-inline-block border">
                    <span class="d-block text-muted small fw-bold text-uppercase mb-1">Time Remaining</span>
                    <h4 class="fw-black text-primary mb-0">{{ daysLeft }} Days</h4>
                  </div>
                </div>
                
                <div v-else>
                  <i class="bi bi-clock-history text-danger" style="font-size: 5rem;" v-if="userProfile?.is_subscribed"></i>
                  <i class="bi bi-lock-fill text-danger" style="font-size: 5rem;" v-else></i>
                  
                  <h3 class="fw-black mt-3 text-dark">{{ userProfile?.is_subscribed ? 'Subscription Expired' : 'Unlock Seller Access' }}</h3>
                  <p class="text-muted mb-4">{{ userProfile?.is_subscribed ? 'Your 30-day access has ended. Renew now to continue selling.' : 'Pay the one-time ₦2,000 fee to unlock your 30-day storefront access.' }}</p>
                  
                  <button @click="paySubscription" class="btn btn-primary btn-lg fw-bold rounded-pill px-5 shadow" :disabled="isProcessing" style="background-color: #082b59; border: none;">
                     {{ isProcessing ? 'Loading...' : 'Pay ₦2,000 for 30 Days' }}
                  </button>
                </div>

             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const isLoading = ref(true); const currentUser = ref(null); const userProfile = ref(null)
const transactions = ref([]); const sellerOrders = ref([]); const isProcessing = ref(false)
const showWithdrawForm = ref(false); const withdrawData = ref({ bank: '', account: '', amount: '' })

// THE SUBSCRIPTION MATH
const isSubActive = computed(() => {
  if (!userProfile.value?.is_subscribed || !userProfile.value?.subscription_expires_at) return false;
  return new Date(userProfile.value.subscription_expires_at) > new Date();
});

const daysLeft = computed(() => {
  if (!isSubActive.value) return 0;
  const diffTime = Math.abs(new Date(userProfile.value.subscription_expires_at) - new Date());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const fetchData = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session) {
    currentUser.value = sessionData.session.user
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.value.id).single()
    userProfile.value = profile
    const { data: txns } = await supabase.from('transactions').select('*').eq('profile_id', currentUser.value.id).order('created_at', { ascending: false })
    transactions.value = txns || []
    const { data: orders } = await supabase.from('orders').select('*').eq('seller_id', currentUser.value.id).eq('status', 'Paid (In Escrow)').order('created_at', { ascending: false })
    sellerOrders.value = orders || []
  }
  isLoading.value = false
}

const processWithdrawal = async () => {
  const amt = Number(withdrawData.value.amount);
  if (amt <= 0) return alert("Enter a valid amount.");
  if (amt > Number(userProfile.value.wallet_balance)) return alert("Insufficient available balance!");
  try {
    const newBalance = Number(userProfile.value.wallet_balance) - amt;
    await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', currentUser.value.id);
    await supabase.from('transactions').insert([{ profile_id: currentUser.value.id, amount: amt, type: 'debit', description: `Bank Transfer to ${withdrawData.value.bank} (${withdrawData.value.account})` }]);
    alert("Withdrawal Processed Successfully!");
    showWithdrawForm.value = false; withdrawData.value = { bank: '', account: '', amount: '' };
    await fetchData(); 
  } catch (err) { alert("Error processing withdrawal."); }
}

const paySubscription = () => {
  if (!window.PaystackPop) return alert("Payment system is loading.");
  isProcessing.value = true;
  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, email: currentUser.value.email, amount: 2000 * 100, currency: 'NGN', ref: 'SUB_' + Math.floor(Math.random() * 1000000000),
    callback: function(response) {
      // CALCULATE 30 DAYS FROM RIGHT NOW
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      supabase.from('profiles').update({ 
        is_subscribed: true,
        subscription_expires_at: expiryDate.toISOString()
      }).eq('id', currentUser.value.id)
        .then(() => {
          alert("Verification successful! You have 30 days of access.");
          fetchData();
          isProcessing.value = false;
        })
        .catch(err => { alert("Error upgrading account."); isProcessing.value = false; });
    },
    onClose: function() { isProcessing.value = false; alert('Payment cancelled.'); }
  });
  handler.openIframe();
}

onMounted(() => fetchData())
</script>

<style scoped>.nav-pills .nav-link.active { background-color: #082b59; color: white; } .nav-pills .nav-link { color: #495057; padding: 12px 20px; }</style>