<template>
  <div class="container profile-container pb-5 mt-4">
    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    
    <div v-else class="row g-4 justify-content-center">
      <div class="col-lg-10">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden mb-4" style="background-color: #082b59; color: white;">
          <div class="position-relative" style="height: 200px; background-color: #1a1a1a;">
            <img v-if="userProfile?.cover_image" :src="userProfile.cover_image" class="w-100 h-100" style="object-fit: cover; opacity: 0.6;">
          </div>
          <div class="card-body p-4 position-relative" style="margin-top: -60px;">
            <div class="d-flex align-items-end mb-3">
              <img v-if="userProfile?.profile_image" :src="userProfile.profile_image" class="rounded-circle border border-4 border-white shadow bg-white me-4" style="width: 120px; height: 120px; object-fit: cover;">
              <div v-else class="bg-light text-primary rounded-circle d-flex justify-content-center align-items-center me-4 shadow border border-4 border-white" style="width: 120px; height: 120px; font-size: 3rem; font-weight: bold;">
                {{ userProfile?.first_name ? userProfile.first_name.charAt(0) : 'U' }}
              </div>
              <div class="pb-2">
                <h2 class="fw-bold mb-0 text-white shadow-sm">{{ userProfile?.first_name }} {{ userProfile?.last_name }} 
                  <span class="fs-5 fw-normal text-warning ms-2">@{{ userProfile?.username }}</span>
                </h2>
                <span class="badge bg-light text-dark mt-2 px-3 py-1 rounded-pill">{{ userProfile?.role.toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>

        <ul class="nav nav-tabs fw-bold mb-4 border-bottom-0" role="tablist">
          <li class="nav-item"><button class="nav-link active px-4 py-3 border-0 rounded-top-4" data-bs-toggle="tab" data-bs-target="#purchases" type="button" style="background-color: #e9ecef; color: #082b59;"><i class="bi bi-bag-check-fill me-2"></i> My Purchases</button></li>
          <li class="nav-item"><button class="nav-link px-4 py-3 border-0 rounded-top-4 ms-2" data-bs-toggle="tab" data-bs-target="#settings" type="button" style="background-color: #e9ecef; color: #6c757d;"><i class="bi bi-gear-fill me-2"></i> Profile Settings</button></li>
        </ul>

        <div class="tab-content">
          <div class="tab-pane fade show active" id="purchases" role="tabpanel">
            
            <div class="card shadow-sm border-0 rounded-4 p-4 bg-white mb-4">
              <h5 class="fw-bold mb-4 border-bottom pb-3 text-dark"><i class="bi bi-shield-lock text-warning me-2"></i> Action Required (Active Escrow)</h5>
              
              <div v-if="activeOrders.length === 0" class="text-center text-muted py-4">
                <i class="bi bi-check-circle fs-1 d-block mb-2 text-success"></i><p>All clear! No pending items to confirm.</p>
              </div>
              
              <div v-for="order in activeOrders" :key="order.id" class="card border border-warning shadow-sm rounded-4 mb-3 overflow-hidden">
                <div class="card-header fw-bold border-0 py-3 bg-warning-subtle text-dark">
                  <i class="bi bi-shield-lock-fill text-warning me-2"></i> Paid (Funds Locked in Escrow)
                </div>
                <div class="card-body p-4 d-flex flex-column flex-md-row align-items-center justify-content-between">
                  <div class="d-flex align-items-center mb-3 mb-md-0">
                    <img :src="order.product_image" class="bg-light rounded-3 me-3" style="width: 80px; height: 80px; object-fit: cover;">
                    <div>
                      <h5 class="fw-bold mb-1">{{ order.product_name }}</h5>
                      <h6 class="text-danger fw-black mb-1">₦{{ Number(order.product_price).toLocaleString() }}</h6>
                      <small class="text-muted">Purchased: {{ new Date(order.created_at).toLocaleDateString() }}</small>
                    </div>
                  </div>
                  <div class="text-center text-md-end">
                    <p class="small text-muted mb-2">Did you receive this item?</p>
                    <button class="btn btn-success fw-bold rounded-pill px-4 shadow-sm" @click="confirmReceipt(order)" :disabled="isProcessing">
                      <i class="bi bi-check-circle-fill me-2"></i> Confirm & Release Funds
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="card shadow-sm border-0 rounded-4 p-4 bg-white">
              <h5 class="fw-bold mb-4 border-bottom pb-3 text-dark"><i class="bi bi-bag-check text-success me-2"></i> Successful Purchases</h5>
              
              <div v-if="completedOrders.length === 0" class="text-center text-muted py-4"><p>Your completed orders will appear here.</p></div>
              
              <div v-for="order in completedOrders" :key="order.id" class="card border border-success shadow-sm rounded-4 mb-3 overflow-hidden opacity-75">
                <div class="card-body p-4 d-flex flex-column flex-md-row align-items-center justify-content-between">
                  <div class="d-flex align-items-center mb-3 mb-md-0">
                    <img :src="order.product_image" class="bg-light rounded-3 me-3" style="width: 60px; height: 60px; object-fit: cover; filter: grayscale(50%);">
                    <div>
                      <h6 class="fw-bold mb-1 text-success"><i class="bi bi-check-all"></i> Escrow Cleared</h6>
                      <h6 class="fw-bold mb-1">{{ order.product_name }}</h6>
                    </div>
                  </div>
                  <div class="w-100 mt-3 mt-md-0 ms-md-4">
                    <div v-if="activeReviewOrderId !== order.id" class="text-end">
                      <button @click="activeReviewOrderId = order.id" class="btn btn-outline-dark btn-sm fw-bold rounded-pill px-4">Leave a Review</button>
                    </div>
                    <div v-else class="bg-light p-3 rounded-4 mt-2">
                       <h6 class="fw-bold mb-2">Rate this product</h6>
                       <select v-model="reviewForm.rating" class="form-select mb-2">
                         <option value="5">⭐⭐⭐⭐⭐ (5/5) Excellent</option>
                         <option value="4">⭐⭐⭐⭐ (4/5) Good</option>
                         <option value="3">⭐⭐⭐ (3/5) Average</option>
                         <option value="2">⭐⭐ (2/5) Poor</option>
                         <option value="1">⭐ (1/5) Terrible</option>
                       </select>
                       <textarea v-model="reviewForm.comment" class="form-control mb-2" placeholder="Tell others about your experience..." rows="2"></textarea>
                       <div class="d-flex justify-content-end gap-2">
                         <button @click="activeReviewOrderId = null" class="btn btn-sm btn-secondary fw-bold rounded-pill px-3">Cancel</button>
                         <button @click="submitReview(order)" class="btn btn-sm btn-primary fw-bold rounded-pill px-4" style="background-color: #082b59; border: none;">Submit Review</button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div class="tab-pane fade" id="settings" role="tabpanel">
            <div class="card shadow-sm border-0 rounded-4 p-4 bg-white">
              <form @submit.prevent="saveProfile">
                <h5 class="fw-bold mb-3 border-bottom pb-2 text-dark">Personal Identity</h5>
                <div class="row g-4 mb-4">
                  <div class="col-md-6"><label class="form-label fw-bold text-muted small text-uppercase">Legal Name 🔒</label><input type="text" class="form-control bg-light" :value="userProfile?.first_name + ' ' + userProfile?.last_name" disabled></div>
                  <div class="col-md-6"><label class="form-label fw-bold text-muted small text-uppercase">Date of Birth 🔒</label><input type="date" class="form-control bg-light" :value="userProfile?.dob" disabled></div>
                  <div class="col-md-6"><label class="form-label fw-bold text-muted small text-uppercase">WhatsApp (2FA Ready)</label><input type="text" class="form-control" v-model="editForm.phone_number"></div>
                  <div class="col-md-6"><label class="form-label fw-bold text-muted small text-uppercase">Campus Status</label><select class="form-select" v-model="editForm.campus_affiliation"><option>Student</option><option>Staff</option><option>External</option></select></div>
                  <div class="col-md-6"><label class="form-label fw-bold text-muted small text-uppercase">Change Profile Picture</label><input type="file" class="form-control" @change="e => newProfilePic = e.target.files[0]" accept="image/*"></div>
                </div>

                <div v-if="userProfile?.role === 'seller' || userProfile?.role === 'admin'">
                  <h5 class="fw-bold mb-3 border-bottom pb-2 text-primary mt-4">Storefront Details</h5>
                  <div class="row g-4 mb-4">
                    <div class="col-md-6"><label class="form-label fw-bold text-muted small text-uppercase">Business Name</label><input type="text" class="form-control" v-model="editForm.business_name"></div>
                    <div class="col-md-6"><label class="form-label fw-bold text-muted small text-uppercase">Sector</label><select class="form-select" v-model="editForm.business_sector"><option value="Food & Beverages">Food & Beverages</option><option value="IT & Tech">IT & Tech</option><option value="Fashion & Clothing">Fashion & Clothing</option><option value="Other">Other</option></select></div>
                    <div class="col-12"><label class="form-label fw-bold text-muted small text-uppercase">Business Description</label><textarea class="form-control" v-model="editForm.business_desc" rows="3"></textarea></div>
                    <div class="col-md-6"><label class="form-label fw-bold text-muted small text-uppercase">Change Store Cover Photo</label><input type="file" class="form-control" @change="e => newCoverPic = e.target.files[0]" accept="image/*"></div>
                  </div>
                </div>

                <div class="col-12 text-end mt-4 pt-3 border-top">
                  <button type="submit" class="btn btn-primary fw-bold rounded-pill px-5 py-2" :disabled="isSaving" style="background-color: #082b59; border: none;">
                    {{ isSaving ? 'Saving Changes...' : 'Save Profile Changes' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute(); const profileId = route.params.id
const userProfile = ref(null); const buyerOrders = ref([]); const isLoading = ref(true)
const isProcessing = ref(false); const isSaving = ref(false)

// Separating Active vs Completed
const activeOrders = computed(() => buyerOrders.value.filter(o => o.status === 'Paid (In Escrow)'))
const completedOrders = computed(() => buyerOrders.value.filter(o => o.status === 'Completed (Funds Released)'))

// Edit Form State
const editForm = ref({ phone_number: '', campus_affiliation: '', business_name: '', business_sector: '', business_desc: '' })
const newProfilePic = ref(null); const newCoverPic = ref(null)

// Review State
const activeReviewOrderId = ref(null); const reviewForm = ref({ rating: 5, comment: '' });

const fetchProfileData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single()
  
  if (data) {
    userProfile.value = data
    editForm.value = { 
      phone_number: data.phone_number || '', campus_affiliation: data.campus_affiliation || 'Student',
      business_name: data.business_name || '', business_sector: data.business_sector || 'Other', business_desc: data.business_desc || ''
    }
    
    if (sessionData.session?.user.id === profileId) {
      const { data: orders } = await supabase.from('orders').select('*').eq('buyer_id', profileId).order('created_at', { ascending: false })
      buyerOrders.value = orders || []
    }
  }
  isLoading.value = false
}

const saveProfile = async () => { 
  isSaving.value = true
  let updates = { ...editForm.value }
  try {
    if (newProfilePic.value) {
      const pName = `prof_${profileId}_${Date.now()}`
      await supabase.storage.from('user-profiles').upload(pName, newProfilePic.value)
      updates.profile_image = supabase.storage.from('user-profiles').getPublicUrl(pName).data.publicUrl
    }
    if (newCoverPic.value) {
      const cName = `cov_${profileId}_${Date.now()}`
      await supabase.storage.from('user-profiles').upload(cName, newCoverPic.value)
      updates.cover_image = supabase.storage.from('user-profiles').getPublicUrl(cName).data.publicUrl
    }
    await supabase.from('profiles').update(updates).eq('id', profileId)
    alert('Profile Updated Successfully!')
    newProfilePic.value = null; newCoverPic.value = null;
    await fetchProfileData()
  } catch (err) { alert("Error saving profile details."); console.error(err); } 
  finally { isSaving.value = false }
}

// THE BULLETPROOF ESCROW MATH & LEDGER INSERT
const confirmReceipt = async (order) => {
  if(!confirm("Release funds to the seller's wallet? This cannot be undone.")) return;
  isProcessing.value = true;
  
  try {
    // 1. Mark Order as Complete
    await supabase.from('orders').update({ status: 'Completed (Funds Released)' }).eq('id', order.id);

    // 2. Fetch Seller's precise current balances
    const { data: seller } = await supabase.from('profiles').select('escrow_balance, wallet_balance').eq('id', order.seller_id).single();
    
    // 3. The Math: Deduct from Escrow (preventing negative numbers), Add to Wallet
    const newEscrow = Math.max(0, Number(seller.escrow_balance) - Number(order.product_price));
    const newWallet = Number(seller.wallet_balance) + Number(order.product_price);

    // 4. Save Balances
    await supabase.from('profiles').update({ escrow_balance: newEscrow, wallet_balance: newWallet }).eq('id', order.seller_id);

    // 5. Create a detailed Ledger Receipt for the Seller
    await supabase.from('transactions').insert([{ 
      profile_id: order.seller_id, 
      amount: order.product_price, 
      type: 'credit', 
      description: `[ESCROW CLEARED] Funds moved to Available Wallet - ${order.product_name}` 
    }]);

    alert("Success! The item is cleared and funds were released.");
    await fetchProfileData(); // Refresh UI to move item to Completed list
  } catch (err) { 
    alert("Error communicating with Escrow Database."); 
    console.error(err); 
  } finally {
    isProcessing.value = false;
  }
}

const submitReview = async (order) => {
  if(!reviewForm.value.comment) return alert("Please leave a comment!");
  try {
    await supabase.from('reviews').insert([{ product_id: order.product_id, reviewer_id: userProfile.value.id, rating: Number(reviewForm.value.rating), comment: reviewForm.value.comment }]);
    alert("Review submitted successfully!");
    activeReviewOrderId.value = null; 
    reviewForm.value = { rating: 5, comment: '' }; 
  } catch (err) { alert("Error submitting review."); }
}

onMounted(() => fetchProfileData())
</script>

<style scoped>
.nav-tabs .nav-link.active { background-color: white !important; color: #082b59 !important; border-bottom: 3px solid #082b59 !important; }
</style>