<template>
  <div class="bg-light min-vh-100 pb-5">
    
    <div style="height: 200px; background-color: #082b59; position: relative; background-size: cover; background-position: center;" :style="profile?.cover_image ? `background-image: url('${profile.cover_image}');` : ''">
      <div class="position-absolute w-100 h-100" style="background: linear-gradient(to bottom, rgba(8,43,89,0.5), rgba(8,43,89,1));"></div>
    </div>

    <div class="container px-lg-5" style="margin-top: -80px; position: relative; z-index: 10;">
      
      <div v-if="isLoading" class="text-center py-5"><div class="spinner-border" style="color: #b22b1d;"></div></div>
      
      <div v-else-if="profile" class="row g-4">
        
        <div class="col-lg-4">
          <div class="bg-white p-4 shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
            
            <div class="text-center mb-4">
              <img :src="profile.profile_image || `https://ui-avatars.com/api/?name=${profile.first_name || 'User'}&background=e9ecef&color=082b59&size=120`" class="rounded-circle border border-4 border-white shadow-sm mb-3 object-fit-cover" style="width: 120px; height: 120px; background-color: white;">
              
              <h4 class="fw-bold text-dark mb-0">{{ profile.business_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User' }}</h4>
              <p class="text-secondary fw-medium mb-2">@{{ profile.username }}</p>
              
              <div class="d-flex flex-wrap justify-content-center gap-2 mb-2 mt-2">
                <span class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" :style="isVendor ? 'background-color: #082b59; color: white;' : 'background-color: #e9ecef; color: #6b7280;'">
                  {{ isVendor ? 'Vendor' : profile.role === 'admin' ? 'Admin' : 'Buyer' }}
                </span>
                <span class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" style="background-color: #f3f4f6; color: #111827; border: 1px solid #e5e7eb;">
                  {{ profile.campus_affiliation || 'Student' }}
                </span>
                <span v-if="profile.business_sector" class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" style="background-color: #ffe8d6; color: #b22b1d; border: 1px solid #b22b1d;">
                  {{ profile.business_sector }}
                </span>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold text-dark text-uppercase small" style="letter-spacing: 0.05em;">Business Description / Bio</h6>
              <p class="text-secondary small fw-medium" style="line-height: 1.6;">
                {{ profile.business_desc || 'No description provided yet.' }}
              </p>
            </div>

            <div class="d-flex flex-column gap-3 mb-4 border-top pt-4">
              <div class="d-flex align-items-center text-secondary small fw-medium">
                <i class="bi bi-envelope-fill me-3 fs-5" style="color: #082b59;"></i> {{ profile.email || 'Hidden' }}
              </div>
              <div class="d-flex align-items-center text-secondary small fw-medium">
                <i class="bi bi-telephone-fill me-3 fs-5" style="color: #082b59;"></i> {{ profile.phone_number || 'Not provided' }}
              </div>
              <div class="d-flex align-items-center text-secondary small fw-medium" v-if="profile.dob">
                <i class="bi bi-gift-fill me-3 fs-5" style="color: #082b59;"></i> {{ new Date(profile.dob).toLocaleDateString() }}
              </div>
              <div class="d-flex align-items-center text-secondary small fw-medium">
                <i class="bi bi-calendar-check-fill me-3 fs-5" style="color: #082b59;"></i> Joined {{ new Date(profile.created_at || Date.now()).toLocaleDateString() }}
              </div>
            </div>

            <button v-if="isOwnProfile && !isEditing" @click="isEditing = true" class="btn w-100 rounded-pill fw-bold py-2" style="background-color: #f3f4f6; color: #111827; border: 1px solid #e5e7eb; transition: all 0.2s;">
              <i class="bi bi-pencil-square me-2"></i> Edit Profile
            </button>
          </div>
        </div>

        <div class="col-lg-8">
          
          <div v-if="isEditing" class="bg-white p-4 shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
            <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <h5 class="fw-bold text-dark mb-0">Update Profile Details</h5>
              <button @click="isEditing = false" class="btn-close"></button>
            </div>

            <form @submit.prevent="saveProfile">
              <div class="row g-3 mb-4">
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Display Picture</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFileUpload(e, 'avatar')" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 10px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Cover Banner Image</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFileUpload(e, 'cover')" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 10px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">First Name</label>
                  <input type="text" v-model="editForm.first_name" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Middle Name</label>
                  <input type="text" v-model="editForm.middle_name" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Last Name</label>
                  <input type="text" v-model="editForm.last_name" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Account Type</label>
                  <select v-model="editForm.role" class="form-select" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Vendor (Seller)</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Campus Affiliation</label>
                  <select v-model="editForm.campus_affiliation" class="form-select" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="External">External</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Business Name</label>
                  <input type="text" v-model="editForm.business_name" class="form-control" placeholder="Optional" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Business Sector</label>
                  <input type="text" v-model="editForm.business_sector" class="form-control" placeholder="e.g. Tech, Food" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Phone Number</label>
                  <input type="tel" v-model="editForm.phone_number" class="form-control" placeholder="080..." style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Date of Birth</label>
                  <input type="date" v-model="editForm.dob" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Business Description / Bio</label>
                  <textarea v-model="editForm.business_desc" class="form-control" rows="4" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;"></textarea>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-3 pt-3 border-top">
                <button type="button" @click="isEditing = false" class="btn fw-bold rounded-pill px-4" style="background-color: white; color: #6b7280; border: 1px solid #e9ecef;">Cancel</button>
                <button type="submit" class="btn fw-bold rounded-pill px-5" style="background-color: #b22b1d; color: white; border: none;" :disabled="isProcessing">
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span> Save Changes
                </button>
              </div>
            </form>
          </div>

          <div v-else>
            
            <div class="d-flex border-bottom mb-4 gap-4" style="overflow-x: auto; white-space: nowrap;">
              <button v-if="isVendor || listings.length > 0" @click="activeTab = 'listings'" class="btn p-0 pb-2 fw-bold rounded-0" :class="activeTab === 'listings' ? 'text-dark border-bottom border-dark border-3' : 'text-secondary border-0'">Active Storefront</button>
              <button v-if="isVendor || publicTransactions.length > 0" @click="activeTab = 'transactions'" class="btn p-0 pb-2 fw-bold rounded-0" :class="activeTab === 'transactions' ? 'text-dark border-bottom border-dark border-3' : 'text-secondary border-0'">Public History</button>
              
              <button v-if="isOwnProfile && isVendor" @click="activeTab = 'sales'" class="btn p-0 pb-2 fw-bold rounded-0 d-flex align-items-center gap-2" :class="activeTab === 'sales' ? 'text-dark border-bottom border-dark border-3' : 'text-secondary border-0'">
                Manage Sales
                <span v-if="pendingSalesCount > 0" class="badge rounded-pill bg-danger" style="font-size: 0.65rem;">{{ pendingSalesCount }}</span>
              </button>

              <button v-if="isOwnProfile" @click="activeTab = 'purchases'" class="btn p-0 pb-2 fw-bold rounded-0" :class="activeTab === 'purchases' ? 'text-dark border-bottom border-dark border-3' : 'text-secondary border-0'">My Purchases</button>
            </div>

            <div v-if="activeTab === 'listings'">
              <div v-if="listings.length === 0" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
                <i class="bi bi-shop fs-1 text-secondary mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">Storefront Empty</h5>
                <p class="text-secondary fw-medium">This vendor currently has no active listings.</p>
              </div>
              
              <div v-else class="row g-4">
                <div v-for="product in listings" :key="product.id" class="col-md-6 col-xl-4">
                  <div class="h-100 d-flex flex-column overflow-hidden bg-white" @click="$router.push(`/product/${product.id}`)" style="cursor: pointer; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: transform 0.2s ease;">
                    <div class="position-relative bg-light">
                      <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/400'" class="w-100 object-fit-cover" style="height: 180px;" alt="Item">
                      <span v-if="product.stock <= 0" class="badge bg-dark position-absolute top-0 end-0 m-2">SOLD OUT</span>
                    </div>
                    <div class="p-3 d-flex flex-column flex-grow-1">
                      <h6 class="fw-bold text-dark text-truncate mb-1">{{ product.title }}</h6>
                      <h5 class="fw-bold mt-auto mb-0" style="color: #b22b1d;">₦{{ Number(product.price).toLocaleString() }}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'transactions'">
              <div v-if="publicTransactions.length === 0" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
                <i class="bi bi-receipt fs-1 text-secondary mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No transaction history</h5>
                <p class="text-secondary fw-medium">This seller hasn't completed any fully verified sales yet.</p>
              </div>

              <div v-else class="d-flex flex-column gap-3">
                <div v-for="tx in publicTransactions" :key="tx.id" class="bg-white p-3 shadow-sm d-flex justify-content-between align-items-center" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
                  <div>
                    <h6 class="fw-bold text-dark mb-1 text-truncate" style="max-width: 200px;">{{ tx.product_name }}</h6>
                    <span class="small text-secondary fw-medium"><i class="bi bi-calendar-check me-1"></i> {{ new Date(tx.created_at).toLocaleDateString() }}</span>
                  </div>
                  <div class="text-end">
                    <h6 class="fw-bold mb-1" style="color: #10b981;">+₦{{ Number(tx.product_price).toLocaleString() }}</h6>
                    <span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle-fill me-1"></i> Delivered</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'sales'">
              <div v-if="allSales.length === 0" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
                <i class="bi bi-box-seam fs-1 text-secondary mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No orders yet</h5>
                <p class="text-secondary fw-medium">When a buyer purchases your items, they will appear here.</p>
              </div>

              <div v-else class="d-flex flex-column gap-3">
                <div v-for="order in allSales" :key="order.id" class="bg-white p-3 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); border-left: 4px solid" :style="order.status.includes('Completed') ? 'border-left-color: #10b981;' : 'border-left-color: #f59e0b;'">
                  <div class="d-flex align-items-center gap-3">
                    <img :src="order.product_image || 'https://via.placeholder.com/60'" class="rounded object-fit-cover shadow-sm" style="width: 60px; height: 60px;">
                    <div>
                      <h6 class="fw-bold text-dark mb-1">{{ order.product_name }}</h6>
                      <span class="badge" :class="order.status.includes('Completed') ? 'bg-success' : 'bg-warning text-dark border border-warning'">
                        <i class="bi" :class="order.status.includes('Completed') ? 'bi-check-circle-fill' : 'bi-hourglass-split'"></i> 
                        {{ order.status }}
                      </span>
                    </div>
                  </div>
                  <div class="d-flex flex-column align-items-md-end">
                    <h5 class="fw-bold mb-2" style="color: #b22b1d;">₦{{ Number(order.product_price).toLocaleString() }}</h5>
                    <p v-if="!order.status.includes('Completed')" class="small text-secondary fw-bold mb-0">Awaiting Buyer Confirmation</p>
                    <p v-else class="small text-success fw-bold mb-0">Funds added to wallet</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'purchases'">
              <div v-if="purchases.length === 0" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
                <i class="bi bi-shield-lock fs-1 text-secondary mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No active purchases</h5>
                <p class="text-secondary fw-medium">Items you buy through Escrow will appear here.</p>
              </div>

              <div v-else class="d-flex flex-column gap-3">
                <div v-for="order in purchases" :key="order.id" class="bg-white p-3 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
                  <div class="d-flex align-items-center gap-3">
                    <img :src="order.product_image || 'https://via.placeholder.com/60'" class="rounded object-fit-cover shadow-sm" style="width: 60px; height: 60px;">
                    <div>
                      <h6 class="fw-bold text-dark mb-1">{{ order.product_name }}</h6>
                      
                      <span class="badge" :class="{'bg-success': order.status.includes('Completed'), 'bg-danger': order.status.includes('Disputed'), 'bg-warning text-dark border border-warning': !order.status.includes('Completed') && !order.status.includes('Disputed')}">
                        <i class="bi" :class="{'bi-check-circle-fill': order.status.includes('Completed'), 'bi-shield-lock-fill': order.status.includes('Disputed'), 'bi-lock-fill': !order.status.includes('Completed') && !order.status.includes('Disputed')}"></i> 
                        {{ order.status }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="d-flex flex-column align-items-md-end">
                    <h5 class="fw-bold mb-2" style="color: #b22b1d;">₦{{ Number(order.product_price).toLocaleString() }}</h5>
                    
                    <div v-if="!order.status.includes('Completed') && !order.status.includes('Disputed')" class="d-flex gap-2">
                      <button @click="confirmDelivery(order)" class="btn btn-sm fw-bold rounded-pill px-3 shadow-sm" style="background-color: #10b981; color: white;" :disabled="isProcessing">
                        <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span>
                        <i v-else class="bi bi-box-seam me-1"></i> Confirm Received
                      </button>
                      
                      <button @click="reportIssue(order)" class="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3 shadow-sm" :disabled="isProcessing">
                        <i class="bi bi-flag-fill me-1"></i> Report Issue
                      </button>
                    </div>

                    <span v-else-if="order.status.includes('Disputed')" class="text-danger small fw-bold"><i class="bi bi-exclamation-triangle-fill"></i> Transaction Frozen</span>
                    <span v-else class="text-success small fw-bold"><i class="bi bi-check2-all"></i> Funds Released</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!isVendor && !isOwnProfile" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
               <i class="bi bi-person-badge fs-1 text-secondary mb-3 d-block"></i>
               <h5 class="fw-bold text-dark">Student Buyer</h5>
               <p class="text-secondary fw-medium">This user does not maintain a public storefront.</p>
            </div>

          </div>

        </div>
      </div>
      
      <div v-else class="text-center py-5">
        <h3 class="fw-bold text-dark mb-3">Setting up profile...</h3>
        <p class="text-secondary mb-4">If this screen doesn't update automatically, please refresh the page.</p>
        <button @click="forceRefresh" class="btn fw-bold rounded-pill px-4" style="background-color: #082b59; color: white;">Refresh Page</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const isLoading = ref(true)
const isProcessing = ref(false)

const profile = ref(null)
const listings = ref([])
const allSales = ref([])
const purchases = ref([])

const isOwnProfile = ref(false)
const isEditing = ref(false)
const activeTab = ref('listings')

const editForm = ref({})
const displayPictureFile = ref(null)
const coverPictureFile = ref(null)

// Computed Helpers for robust checking
const isVendor = computed(() => {
  if (!profile.value?.role) return false;
  return ['seller', 'external'].includes(profile.value.role.toLowerCase());
})

const publicTransactions = computed(() => {
  return allSales.value.filter(tx => tx.status.includes('Completed'));
})

const pendingSalesCount = computed(() => {
  return allSales.value.filter(tx => !tx.status.includes('Completed')).length;
})

const handleFileUpload = (event, type) => {
  if (type === 'avatar') displayPictureFile.value = event.target.files[0]
  if (type === 'cover') coverPictureFile.value = event.target.files[0]
}

const forceRefresh = () => window.location.reload()

onMounted(async () => {
  isLoading.value = true
  const profileId = route.params.id

  try {
    // 1. Fetch Profile
    const { data: userProfile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', profileId).single()
    
    if (!profileErr) {
      profile.value = userProfile

      // 2. Fetch All Products (Always fetch, just in case)
      const { data: products } = await supabase.from('products').select('*').eq('seller_id', profileId).order('created_at', { ascending: false })
      listings.value = products || []

      // 3. Fetch All Sales (Orders where this profile is the seller)
      const { data: sales } = await supabase.from('orders').select('*').eq('seller_id', profileId).order('created_at', { ascending: false })
      allSales.value = sales || []

      // 4. Session Checking
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session && sessionData.session.user.id === profileId) {
        isOwnProfile.value = true
        
        // Fetch Purchases (Orders where this profile is the buyer)
        const { data: buyerOrders } = await supabase.from('orders').select('*').eq('buyer_id', profileId).order('created_at', { ascending: false })
        purchases.value = buyerOrders || []

        // Decide initial tab
        if (isVendor.value) {
            activeTab.value = 'sales' // Land them on their management hub
        } else {
            activeTab.value = 'purchases'
        }

        // Hydrate Edit Form
        editForm.value = {
          first_name: profile.value.first_name || '',
          last_name: profile.value.last_name || '',
          middle_name: profile.value.middle_name || '',
          business_name: profile.value.business_name || '',
          business_sector: profile.value.business_sector || '',
          business_desc: profile.value.business_desc || '',
          phone_number: profile.value.phone_number || '',
          role: profile.value.role || 'buyer',
          campus_affiliation: profile.value.campus_affiliation || 'Student',
          dob: profile.value.dob || '',
          profile_image: profile.value.profile_image || '',
          cover_image: profile.value.cover_image || ''
        }
      } else {
         activeTab.value = 'listings' // Default to storefront for visitors
      }
    }
  } catch (error) {
    console.error("Error loading profile data:", error)
  } finally {
    isLoading.value = false
  }
})

const confirmDelivery = async (order) => {
  if (!confirm(`Are you sure you have physically received "${order.product_name}"? \n\nClicking OK will instantly release the funds to the seller's wallet.`)) return;
  
  isProcessing.value = true;
  try {
    const { error: orderError } = await supabase.from('orders').update({ status: 'Completed (Funds Released)' }).eq('id', order.id);
    if (orderError) throw orderError;

    const { data: seller, error: sellerError } = await supabase.from('profiles').select('wallet_balance').eq('id', order.seller_id).single();
    if (sellerError) throw sellerError;

    const newBalance = Number(seller.wallet_balance || 0) + Number(order.product_price);
    const { error: walletError } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', order.seller_id);
    if (walletError) throw walletError;

    await supabase.from('transactions').insert([{
      profile_id: order.seller_id,
      amount: order.product_price,
      type: 'credit',
      description: `Escrow Released: Payment for ${order.product_name}`
    }]);

    alert("Success! The funds have been released to the seller.");
    order.status = 'Completed (Funds Released)';
    
  } catch (error) {
    alert("Error releasing funds: " + error.message);
  } finally {
    isProcessing.value = false;
  }
};

// ==========================================
// NEW: REPORT ISSUE / FREEZE TRANSACTION
// ==========================================
const reportIssue = async (order) => {
  const reason = prompt("Please describe the issue (e.g., Seller didn't show up, Item was broken). This will freeze the funds and notify the Admin.");
  if (!reason || reason.trim() === '') return; 

  isProcessing.value = true;

  try {
    // 1. Change the order status to 'Disputed'
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'Disputed' })
      .eq('id', order.id);

    if (orderError) throw orderError;

    // 2. Automatically create a Support Ticket
    const { error: ticketError } = await supabase
      .from('support_tickets')
      .insert([{
        user_id: profile.value.id,
        subject: `URGENT ESCROW DISPUTE: Order #${String(order.id).substring(0,8)}`,
        message: `Buyer reported an issue and froze the transaction. Reason: "${reason}". Please contact both parties to resolve.`,
        status: 'Open'
      }]);

    if (ticketError) throw ticketError;

    alert("Transaction frozen! The Escrow funds are locked and an Admin has been notified.");
    order.status = 'Disputed'; // Update UI instantly

  } catch (error) {
    console.error("Dispute Error:", error);
    alert("Could not report issue: " + error.message);
  } finally {
    isProcessing.value = false;
  }
};

const saveProfile = async () => {
  isProcessing.value = true
  try {
    if (displayPictureFile.value) {
      const fileExt = displayPictureFile.value.name.split('.').pop()
      const fileName = `avatar_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('user-profiles').upload(fileName, displayPictureFile.value)
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('user-profiles').getPublicUrl(fileName)
        editForm.value.profile_image = publicUrlData.publicUrl
      }
    }

    if (coverPictureFile.value) {
      const fileExt = coverPictureFile.value.name.split('.').pop()
      const fileName = `cover_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('user-profiles').upload(fileName, coverPictureFile.value)
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('user-profiles').getPublicUrl(fileName)
        editForm.value.cover_image = publicUrlData.publicUrl
      }
    }

    const { error } = await supabase.from('profiles').update({
      first_name: editForm.value.first_name,
      last_name: editForm.value.last_name,
      middle_name: editForm.value.middle_name,
      business_name: editForm.value.business_name,
      business_sector: editForm.value.business_sector,
      business_desc: editForm.value.business_desc,
      phone_number: editForm.value.phone_number,
      role: editForm.value.role,
      campus_affiliation: editForm.value.campus_affiliation,
      dob: editForm.value.dob || null,
      profile_image: editForm.value.profile_image,
      cover_image: editForm.value.cover_image
    }).eq('id', profile.value.id)

    if (error) throw error

    profile.value = { ...profile.value, ...editForm.value }
    isEditing.value = false
    displayPictureFile.value = null
    coverPictureFile.value = null
    
  } catch (error) {
    alert("Error updating profile: " + error.message)
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
input, textarea, select { font-size: 16px !important; }
.h-100:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 25px rgba(0,0,0,0.05) !important; }

div[style*="overflow-x: auto"]::-webkit-scrollbar { height: 4px; }
div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb { background: #e9ecef; border-radius: 4px; }
</style>