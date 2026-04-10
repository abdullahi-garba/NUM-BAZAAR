<template>
  <div class="bg-light min-vh-100 pb-5">
    
    <div class="no-print" style="height: 200px; background-color: #082b59; position: relative; background-size: cover; background-position: center;" :style="profile?.cover_image ? `background-image: url('${profile.cover_image}');` : ''">
      <div class="position-absolute w-100 h-100" style="background: linear-gradient(to bottom, rgba(8,43,89,0.5), rgba(8,43,89,1));"></div>
    </div>

    <div class="container px-lg-5 printable-container" style="margin-top: -80px; position: relative; z-index: 10;">
      
      <div v-if="isLoading" class="text-center py-5 no-print"><div class="spinner-border" style="color: #b22b1d;"></div></div>
      
      <div v-else-if="profile" class="row g-4">
        
        <div class="d-none print-only-header text-center mb-4 col-12">
          <h3 class="fw-black text-dark">NUM BAZAAR</h3>
          <h4>Official User Record</h4>
          <p><strong>Account:</strong> {{ profile.business_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() }} (@{{ profile.username }})</p>
          <p><strong>Generated on:</strong> {{ new Date().toLocaleString() }}</p>
          <hr>
        </div>

        <div class="col-lg-4 no-print">
          <div class="bg-white p-4 shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
            <div class="text-center mb-4">
              <div class="position-relative d-inline-block">
                <img :src="profile.profile_image || `https://ui-avatars.com/api/?name=${profile.first_name || 'User'}&background=e9ecef&color=082b59&size=120`" class="rounded-circle border border-4 border-white shadow-sm mb-3 object-fit-cover" style="width: 120px; height: 120px; background-color: white;">
                <span v-if="profile.is_verified" class="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-1 mb-3 shadow-sm border border-2 border-white" title="Verified Account">
                  <i class="bi bi-patch-check-fill fs-5"></i>
                </span>
              </div>
              <h4 class="fw-bold text-dark mb-0">{{ profile.business_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User' }}</h4>
              <p class="text-secondary fw-medium mb-2">@{{ profile.username }}</p>
              <div class="d-flex flex-wrap justify-content-center gap-2 mb-2 mt-2">
                <span class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" :style="isVendor ? 'background-color: #082b59; color: white;' : 'background-color: #e9ecef; color: #6b7280;'">{{ isVendor ? 'Vendor' : profile.role === 'admin' ? 'Admin' : 'Buyer' }}</span>
                <span class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" style="background-color: #f3f4f6; color: #111827; border: 1px solid #e5e7eb;">{{ profile.campus_affiliation || 'Student' }}</span>
                <span v-if="profile.business_sector" class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" style="background-color: #ffe8d6; color: #b22b1d; border: 1px solid #b22b1d;">{{ profile.business_sector }}</span>
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

            <button v-if="isOwnProfile && !isEditing" @click="isEditing = true" class="btn w-100 rounded-pill fw-bold py-2" style="background-color: #f3f4f6; color: #111827; border: 1px solid #e5e7eb; transition: all 0.2s;"><i class="bi bi-pencil-square me-2"></i> Edit Profile</button>
          </div>
        </div>

        <div class="col-lg-8 printable-content">
          
          <div v-if="isOwnProfile && !profile.is_verified && profile.role !== 'admin'" class="mb-4 no-print">
            <div v-if="profile.id_card_url" class="bg-warning-subtle p-4 rounded-4 border border-warning d-flex align-items-start gap-3 shadow-sm">
              <i class="bi bi-hourglass-split fs-1 text-warning"></i>
              <div><h5 class="fw-bold text-dark mb-1">Identity Verification Pending</h5><p class="text-secondary fw-medium mb-0 small">Your document is currently being reviewed by the Admin Command Center.</p></div>
            </div>
            <div v-else class="bg-danger-subtle p-4 rounded-4 border border-danger shadow-sm">
              <div class="d-flex align-items-start gap-3 mb-3"><i class="bi bi-shield-exclamation fs-1 text-danger"></i><div><h5 class="fw-bold text-dark mb-1">Action Required: Upload ID Card</h5></div></div>
              <form @submit.prevent="submitKYC" class="d-flex flex-column gap-3 bg-white p-3 rounded-3 border">
                <div class="row g-2">
                  <div class="col-md-5"><select v-model="kycDocType" class="form-select bg-light border-0 fw-bold text-dark" required><option value="" disabled>Select Document Type...</option><option value="Student ID Card">Student ID Card</option><option value="Staff ID Card">Staff ID Card</option><option value="School Fees Receipt">School Fees Receipt (No ID)</option></select></div>
                  <div class="col-md-7"><input type="file" class="form-control border-0 bg-light" accept="image/*" @change="e => idCardFile = e.target.files[0]" required></div>
                </div>
                <div class="text-end"><button type="submit" class="btn fw-bold px-4 text-nowrap rounded-pill shadow-sm" style="background-color: #b22b1d; color: white;" :disabled="isUploadingKYC">{{ isUploadingKYC ? 'Uploading...' : 'Submit for Review' }}</button></div>
              </form>
            </div>
          </div>

          <div v-if="isEditing" class="bg-white p-4 shadow-sm no-print" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
            <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3"><h5 class="fw-bold text-dark mb-0">Update Profile Details</h5><button @click="isEditing = false" class="btn-close"></button></div>
            <form @submit.prevent="saveProfile">
              <div class="row g-3 mb-4">
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-bold text-uppercase text-dark">Display Picture</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFileUpload(e, 'avatar')" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 10px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-bold text-uppercase text-dark">Cover Banner Image</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFileUpload(e, 'cover')" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 10px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-6 mb-2"><label class="form-label small fw-bold text-uppercase text-dark">First Name</label><input type="text" v-model="editForm.first_name" class="form-control bg-light border-0 rounded-3"></div>
                <div class="col-md-6 mb-2"><label class="form-label small fw-bold text-uppercase text-dark">Business Name</label><input type="text" v-model="editForm.business_name" class="form-control bg-light border-0 rounded-3"></div>
                <div class="col-12"><label class="form-label small fw-bold text-uppercase text-dark">Business Description / Bio</label><textarea v-model="editForm.business_desc" class="form-control bg-light border-0 rounded-3" rows="4"></textarea></div>
              </div>
              <div class="d-flex justify-content-end gap-3 pt-3 border-top">
                <button type="button" @click="isEditing = false" class="btn fw-bold rounded-pill px-4" style="background-color: white; color: #6b7280; border: 1px solid #e9ecef;">Cancel</button>
                <button type="submit" class="btn fw-bold rounded-pill px-5" style="background-color: #b22b1d; color: white; border: none;" :disabled="isProcessing">Save Changes</button>
              </div>
            </form>
          </div>

          <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-4 no-print">
              <div class="d-flex gap-4 border-bottom" style="overflow-x: auto; white-space: nowrap;">
                <button v-if="isVendor || listings.length > 0" @click="activeTab = 'listings'" class="btn p-0 pb-2 fw-bold rounded-0" :class="activeTab === 'listings' ? 'text-dark border-bottom border-dark border-3' : 'text-secondary border-0'">Active Storefront</button>
                <button v-if="isVendor || publicTransactions.length > 0" @click="activeTab = 'transactions'" class="btn p-0 pb-2 fw-bold rounded-0" :class="activeTab === 'transactions' ? 'text-dark border-bottom border-dark border-3' : 'text-secondary border-0'">Public History</button>
                <button v-if="isOwnProfile && isVendor" @click="activeTab = 'sales'" class="btn p-0 pb-2 fw-bold rounded-0 d-flex align-items-center gap-2" :class="activeTab === 'sales' ? 'text-dark border-bottom border-dark border-3' : 'text-secondary border-0'">Manage Sales <span v-if="pendingSalesCount > 0" class="badge rounded-pill bg-danger">{{ pendingSalesCount }}</span></button>
                <button v-if="isOwnProfile" @click="activeTab = 'purchases'" class="btn p-0 pb-2 fw-bold rounded-0" :class="activeTab === 'purchases' ? 'text-dark border-bottom border-dark border-3' : 'text-secondary border-0'">My Purchases</button>
              </div>
              <button v-if="isOwnProfile && ['sales', 'purchases', 'transactions'].includes(activeTab)" @click="printHistory" class="btn btn-outline-dark btn-sm fw-bold rounded-pill shadow-sm"><i class="bi bi-printer-fill me-1"></i> Print PDF</button>
            </div>

            <div v-if="activeTab === 'listings'" class="no-print">
              <div v-if="listings.length === 0" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);"><h5 class="fw-bold text-dark">Storefront Empty</h5></div>
              <div v-else class="row g-4">
                <div v-for="product in listings" :key="product.id" class="col-md-6 col-xl-4">
                  <div class="h-100 d-flex flex-column overflow-hidden bg-white" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: transform 0.2s ease;">
                    <div class="position-relative bg-light" @click="$router.push(`/product/${product.id}`)" style="cursor: pointer;">
                      <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/400'" class="w-100 object-fit-cover" style="height: 180px;" :style="!product.is_active ? 'filter: grayscale(100%); opacity: 0.5;' : ''">
                      <span class="badge bg-dark position-absolute top-0 end-0 m-2 shadow-sm">STOCK: {{ product.stock }}</span>
                      <span v-if="!product.is_active" class="badge bg-danger position-absolute top-50 start-50 translate-middle shadow px-3 py-2 fs-6">DE-LISTED</span>
                    </div>
                    <div class="p-3 d-flex flex-column flex-grow-1" :style="!product.is_active ? 'opacity: 0.6;' : ''">
                      <h6 class="fw-bold text-dark text-truncate mb-1">{{ product.title }}</h6>
                      <h5 class="fw-bold mt-auto mb-0" style="color: #b22b1d;">₦{{ Number(product.price).toLocaleString() }}</h5>
                      
                      <div v-if="isOwnProfile" class="mt-3 d-flex flex-column gap-2">
                        <button @click.stop="openProductEdit(product)" class="btn btn-sm btn-outline-dark w-100 fw-bold rounded-pill"><i class="bi bi-pencil-square me-1"></i> Edit Images & Info</button>
                        <div class="d-flex gap-2">
                          <button @click.stop="updateStock(product)" class="btn btn-sm btn-outline-primary flex-grow-1 fw-bold rounded-pill"><i class="bi bi-box-seam me-1"></i> Stock</button>
                          <button @click.stop="toggleProductStatus(product)" class="btn btn-sm flex-grow-1 fw-bold rounded-pill" :class="product.is_active ? 'btn-outline-danger' : 'btn-outline-success'">
                            <i class="bi" :class="product.is_active ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i> {{ product.is_active ? 'De-list' : 'Re-list' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'transactions'">
              <div v-if="publicTransactions.length === 0" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px;"><h5 class="fw-bold text-dark">No transaction history</h5></div>
              <div v-else class="d-flex flex-column gap-3">
                <div v-for="tx in publicTransactions" :key="tx.id" class="bg-white p-3 shadow-sm d-flex justify-content-between align-items-center print-row" style="border-radius: 16px;">
                  <div>
                    <h6 class="fw-bold text-dark mb-1 text-truncate" style="max-width: 200px;">{{ tx.product_name }}</h6>
                    <span class="small text-secondary fw-medium"><i class="bi bi-calendar-check me-1 no-print"></i> {{ new Date(tx.created_at).toLocaleString() }}</span>
                  </div>
                  <div class="text-end">
                    <h6 class="fw-bold mb-1" style="color: #10b981;">+₦{{ Number(tx.product_price).toLocaleString() }}</h6>
                    <span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle-fill me-1 no-print"></i> Delivered</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'sales'">
              <div v-if="allSales.length === 0" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px;"><h5 class="fw-bold text-dark">No orders yet</h5></div>
              <div v-else class="d-flex flex-column gap-3">
                <div v-for="order in allSales" :key="order.id" class="bg-white p-3 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 print-row" style="border-radius: 16px; border-left: 4px solid" :style="order.status.includes('Completed') ? 'border-left-color: #10b981;' : 'border-left-color: #f59e0b;'">
                  <div class="d-flex align-items-center gap-3">
                    <img :src="order.product_image || 'https://via.placeholder.com/60'" class="rounded object-fit-cover shadow-sm no-print" style="width: 60px; height: 60px;">
                    <div>
                      <h6 class="fw-bold text-dark mb-1">{{ order.product_name }}</h6>
                      <small class="d-none print-only-text d-block mb-1">{{ new Date(order.created_at).toLocaleString() }}</small>
                      <span class="badge" :class="order.status.includes('Completed') ? 'bg-success' : 'bg-warning text-dark border border-warning'">{{ order.status }}</span>
                    </div>
                  </div>
                  <div class="d-flex flex-column align-items-md-end">
                    <h5 class="fw-bold mb-2" style="color: #b22b1d;">₦{{ Number(order.product_price).toLocaleString() }}</h5>
                    <p v-if="!order.status.includes('Completed')" class="small text-secondary fw-bold mb-0 no-print">Awaiting Buyer Confirmation</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'purchases'">
              <div v-if="purchases.length === 0" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px;"><h5 class="fw-bold text-dark">No active purchases</h5></div>
              <div v-else class="d-flex flex-column gap-3">
                <div v-for="order in purchases" :key="order.id" class="bg-white p-3 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 print-row" style="border-radius: 16px;">
                  <div class="d-flex align-items-center gap-3">
                    <img :src="order.product_image || 'https://via.placeholder.com/60'" class="rounded object-fit-cover shadow-sm no-print" style="width: 60px; height: 60px;">
                    <div>
                      <h6 class="fw-bold text-dark mb-1">{{ order.product_name }}</h6>
                      <span class="badge" :class="{'bg-success': order.status.includes('Completed'), 'bg-danger': order.status.includes('Disputed'), 'bg-warning text-dark border border-warning': !order.status.includes('Completed') && !order.status.includes('Disputed')}">{{ order.status }}</span>
                    </div>
                  </div>
                  <div class="d-flex flex-column align-items-md-end">
                    <h5 class="fw-bold mb-2" style="color: #b22b1d;">₦{{ Number(order.product_price).toLocaleString() }}</h5>
                    <div v-if="!order.status.includes('Completed') && !order.status.includes('Disputed')" class="d-flex gap-2 no-print">
                      <button @click="confirmDelivery(order)" class="btn btn-sm fw-bold rounded-pill px-3 shadow-sm" style="background-color: #10b981; color: white;" :disabled="isProcessing">Confirm Received</button>
                      <button @click="reportIssue(order)" class="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3 shadow-sm" :disabled="isProcessing">Report Issue</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div v-if="editingProduct" class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1060; display: flex; justify-content: center; align-items: center; overflow-y: auto;">
      <div class="bg-white p-4 rounded-4 shadow-lg w-100 my-4" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h5 class="fw-bold mb-0 text-dark">Edit Product Details</h5>
          <button @click="editingProduct = null" class="btn-close"></button>
        </div>
        
        <form @submit.prevent="saveProductEdit">
          <div class="mb-3">
            <label class="form-label small fw-bold text-dark">Title</label>
            <input type="text" v-model="editingProduct.title" class="form-control bg-light border-0 fw-bold" required>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label class="form-label small fw-bold text-dark">Price (₦)</label>
              <input type="number" v-model="editingProduct.price" class="form-control bg-light border-0 fw-bold" required>
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold text-dark">Stock Count</label>
              <input type="number" v-model="editingProduct.stock" class="form-control bg-light border-0 fw-bold" required>
            </div>
          </div>
          <div class="mb-4">
            <label class="form-label small fw-bold text-dark">Product Images Carousel (Max 5)</label>
            <div class="d-flex flex-wrap gap-2 mb-3">
              <div v-for="(img, idx) in editingProduct.image_urls" :key="idx" class="position-relative">
                <img :src="img" class="rounded-3 object-fit-cover border" style="width: 80px; height: 80px;">
                <button type="button" @click.prevent="editingProduct.image_urls.splice(idx, 1)" class="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle rounded-circle p-0 d-flex justify-content-center align-items-center" style="width: 22px; height: 22px;"><i class="bi bi-x"></i></button>
                <span v-if="idx === 0 && productNewFiles.length === 0" class="position-absolute bottom-0 start-50 translate-middle-x badge bg-dark w-100" style="font-size: 0.5rem; border-radius: 0 0 8px 8px;">COVER</span>
              </div>
              <div v-for="(img, idx) in productNewPreviews" :key="'new'+idx" class="position-relative">
                <img :src="img" class="rounded-3 object-fit-cover border border-success" style="width: 80px; height: 80px;">
                <button type="button" @click.prevent="removeNewProductImage(idx)" class="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle rounded-circle p-0 d-flex justify-content-center align-items-center" style="width: 22px; height: 22px;"><i class="bi bi-x"></i></button>
                <span class="position-absolute bottom-0 start-50 translate-middle-x badge bg-success w-100" style="font-size: 0.5rem; border-radius: 0 0 8px 8px;">NEW</span>
              </div>
            </div>
            <div v-if="(editingProduct.image_urls.length + productNewFiles.length) < 5" class="p-3 bg-light rounded-4 border text-center position-relative" style="border-style: dashed !important;">
              <i class="bi bi-images fs-4 text-secondary mb-1 d-block"></i><span class="small fw-bold text-dark">Add more images</span>
              <input type="file" multiple accept="image/*" @change="handleProductEditFiles" class="position-absolute top-0 start-0 w-100 h-100 opacity-0" style="cursor: pointer;">
            </div>
            <div v-else class="text-danger small fw-bold"><i class="bi bi-exclamation-circle me-1"></i> Maximum 5 images reached. Remove one to add another.</div>
          </div>
          <button type="submit" class="btn w-100 fw-bold py-3 rounded-pill shadow-sm" style="background-color: #082b59; color: white;" :disabled="isProcessing">
            <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span> Save Changes
          </button>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const ADMIN_WA_NUMBER = '2348133874904' // Global Admin WhatsApp
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
const idCardFile = ref(null)
const kycDocType = ref('')
const isUploadingKYC = ref(false)

// Edit Product Modal State
const editingProduct = ref(null)
const productNewFiles = ref([])
const productNewPreviews = ref([])

const isVendor = computed(() => {
  if (!profile.value?.role) return false;
  return ['seller', 'external'].includes(profile.value.role.toLowerCase());
})

const publicTransactions = computed(() => {
  return allSales.value.filter(tx => tx.status && tx.status.includes('Completed'));
})

const pendingSalesCount = computed(() => {
  return allSales.value.filter(tx => tx.status && !tx.status.includes('Completed')).length;
})

const handleFileUpload = (event, type) => {
  if (type === 'avatar') displayPictureFile.value = event.target.files[0]
  if (type === 'cover') coverPictureFile.value = event.target.files[0]
}

const printHistory = () => { window.print(); }

onMounted(async () => {
  isLoading.value = true
  const profileId = route.params.id

  try {
    const { data: userProfile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', profileId).single()
    if (!profileErr) {
      profile.value = userProfile

      const { data: products } = await supabase.from('products').select('*').eq('seller_id', profileId).order('created_at', { ascending: false })
      listings.value = products || []

      const { data: sales } = await supabase.from('orders').select('*').eq('seller_id', profileId).order('created_at', { ascending: false })
      allSales.value = sales || []

      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session && sessionData.session.user.id === profileId) {
        isOwnProfile.value = true
        
        const { data: buyerOrders } = await supabase.from('orders').select('*').eq('buyer_id', profileId).order('created_at', { ascending: false })
        purchases.value = buyerOrders || []

        if (isVendor.value) {
            activeTab.value = 'sales' 
        } else {
            activeTab.value = 'purchases'
        }

        editForm.value = {
          first_name: profile.value.first_name || '',
          business_name: profile.value.business_name || '',
          business_desc: profile.value.business_desc || ''
        }
      } else {
         activeTab.value = 'listings' 
      }
    }
  } catch (error) {
    console.error("Error loading profile data:", error)
  } finally {
    isLoading.value = false
  }
})

// === VENDOR PRODUCT CONTROLS ===
const toggleProductStatus = async (product) => {
  const newStatus = !product.is_active;
  if (!confirm(`Are you sure you want to ${newStatus ? 're-list' : 'de-list'} "${product.title}"?`)) return;
  try {
    await supabase.from('products').update({ is_active: newStatus }).eq('id', product.id);
    product.is_active = newStatus; 
  } catch (error) { alert(error.message); }
}

const updateStock = async (product) => {
  const newStock = prompt(`Update stock count for "${product.title}":`, product.stock);
  if (newStock === null || isNaN(newStock) || newStock < 0) return;
  try {
    await supabase.from('products').update({ stock: parseInt(newStock) }).eq('id', product.id);
    product.stock = parseInt(newStock);
  } catch (error) { alert(error.message); }
}

// === EDIT PRODUCT MODAL ===
const openProductEdit = (prod) => {
  editingProduct.value = JSON.parse(JSON.stringify(prod)); // Deep clone
  productNewFiles.value = [];
  productNewPreviews.value = [];
}

const handleProductEditFiles = (event) => {
  const files = Array.from(event.target.files)
  if (editingProduct.value.image_urls.length + productNewFiles.value.length + files.length > 5) {
    return alert("You can only have a maximum of 5 images per product.")
  }
  files.forEach(file => {
    productNewFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (e) => productNewPreviews.value.push(e.target.result)
    reader.readAsDataURL(file)
  })
}

const removeNewProductImage = (index) => {
  productNewFiles.value.splice(index, 1)
  productNewPreviews.value.splice(index, 1)
}

const saveProductEdit = async () => {
  if (editingProduct.value.image_urls.length === 0 && productNewFiles.value.length === 0) {
    return alert("A product must have at least one image.");
  }
  
  isProcessing.value = true;
  try {
    let finalImageUrls = [...editingProduct.value.image_urls];

    for (const file of productNewFiles.value) {
      const fileExt = file.name.split('.').pop()
      const fileName = `product_${profile.value.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
      finalImageUrls.push(publicUrlData.publicUrl)
    }

    const { error: dbError } = await supabase.from('products').update({
      title: editingProduct.value.title,
      price: editingProduct.value.price,
      stock: editingProduct.value.stock,
      image_urls: finalImageUrls
    }).eq('id', editingProduct.value.id);

    if (dbError) throw dbError;

    const index = listings.value.findIndex(p => p.id === editingProduct.value.id);
    if (index !== -1) {
      listings.value[index].title = editingProduct.value.title;
      listings.value[index].price = editingProduct.value.price;
      listings.value[index].stock = editingProduct.value.stock;
      listings.value[index].image_urls = finalImageUrls;
    }

    alert("Product updated successfully!");
    editingProduct.value = null;

  } catch (error) {
    alert("Error updating product: " + error.message);
  } finally {
    isProcessing.value = false;
  }
}

// Profiles and KYC Logic
const submitKYC = async () => {
  if (!idCardFile.value || !kycDocType.value) return alert("Please select a document type and an image file.");
  isUploadingKYC.value = true;
  try {
    const fileExt = idCardFile.value.name.split('.').pop()
    const fileName = `kyc_${profile.value.id}_${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('kyc-documents').upload(fileName, idCardFile.value)
    if (uploadError) throw new Error("Image upload failed: " + uploadError.message)
    const { data: publicUrlData } = supabase.storage.from('kyc-documents').getPublicUrl(fileName)
    const { error: dbError } = await supabase.from('profiles').update({ id_card_url: publicUrlData.publicUrl, kyc_doc_type: kycDocType.value }).eq('id', profile.value.id)
    if (dbError) throw dbError
    
    alert(`${kycDocType.value} submitted successfully! Notifying Admin...`);
    const msg = `Hello Admin, I have submitted my ${kycDocType.value} for KYC verification. \n\nMy username is @${profile.value.username}.`;
    window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    
    profile.value.id_card_url = publicUrlData.publicUrl; 
    profile.value.kyc_doc_type = kycDocType.value;
    idCardFile.value = null;
  } catch (error) { alert("Error: " + error.message) } finally { isUploadingKYC.value = false; }
}

const confirmDelivery = async (order) => {
  if (!confirm(`Are you sure you have physically received "${order.product_name}"? \n\nClicking OK will instantly release the funds to the seller's wallet.`)) return;
  isProcessing.value = true;
  try {
    await supabase.from('orders').update({ status: 'Completed (Funds Released)' }).eq('id', order.id);
    const { data: seller } = await supabase.from('profiles').select('wallet_balance, escrow_balance').eq('id', order.seller_id).single();
    const amountToTransfer = Number(order.product_price);
    const newEscrowBalance = Math.max(0, Number(seller.escrow_balance || 0) - amountToTransfer); 
    const newWalletBalance = Number(seller.wallet_balance || 0) + amountToTransfer;
    await supabase.from('profiles').update({ wallet_balance: newWalletBalance, escrow_balance: newEscrowBalance }).eq('id', order.seller_id);
    await supabase.from('transactions').insert([{ profile_id: order.seller_id, amount: amountToTransfer, type: 'credit', description: `Escrow Released: Payment for ${order.product_name}` }]);
    alert("Success! The funds have been released to the seller.");
    order.status = 'Completed (Funds Released)'; 
  } catch (error) { alert("Error releasing funds: " + error.message); } finally { isProcessing.value = false; }
};

const reportIssue = async (order) => {
  const reason = prompt("Please describe the issue (e.g., Seller didn't show up, Item was broken). This will freeze the funds and notify the Admin.");
  if (!reason || reason.trim() === '') return; 
  isProcessing.value = true;
  try {
    await supabase.from('orders').update({ status: 'Disputed' }).eq('id', order.id);
    await supabase.from('support_tickets').insert([{ user_id: profile.value.id, subject: `URGENT ESCROW DISPUTE: Order #${String(order.id).substring(0,8)}`, message: `Buyer reported an issue and froze the transaction. Reason: "${reason}". Please contact both parties to resolve.`, status: 'Open' }]);
    
    alert("Transaction frozen! Notifying Admin via WhatsApp...");
    const msg = `🚨 *URGENT ESCROW DISPUTE*\n\nHello Admin, I am opening a dispute for Order #${String(order.id).substring(0,8)}. \n\nReason: ${reason}. \n\nMy username is @${profile.value.username}.`;
    window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    
    order.status = 'Disputed'; 
  } catch (error) { alert("Could not report issue: " + error.message); } finally { isProcessing.value = false; }
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
      business_name: editForm.value.business_name,
      business_desc: editForm.value.business_desc,
      profile_image: editForm.value.profile_image,
      cover_image: editForm.value.cover_image
    }).eq('id', profile.value.id)

    if (error) throw error
    profile.value = { ...profile.value, ...editForm.value }
    isEditing.value = false
  } catch (error) { alert("Error updating profile: " + error.message) } finally { isProcessing.value = false }
}
</script>

<style scoped>
.print-only-header { display: none; }
@media print {
  body * { visibility: hidden; }
  .no-print { display: none !important; }
  .printable-container, .printable-container * { visibility: visible; }
  .print-only-header { display: block !important; }
  .printable-container { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; margin: 0 !important; }
  .print-row { border: 1px solid #dee2e6 !important; margin-bottom: 10px !important; box-shadow: none !important; }
}
</style>