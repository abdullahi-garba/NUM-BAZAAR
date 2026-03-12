<template>
  <div class="container py-5 mt-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom pb-3">
      <div>
        <h2 class="fw-black mb-0 text-dark" style="color: #082b59;"><i class="bi bi-shop-window me-2"></i>Seller Hub</h2>
        <p class="text-muted mb-0 mt-1">Manage your escrow, upload products, and track inventory.</p>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else>
      <ul class="nav nav-tabs fw-bold mb-4 border-bottom-0" role="tablist">
        <li class="nav-item">
          <button class="nav-link active px-4 py-3 border-0 rounded-top-4" data-bs-toggle="tab" data-bs-target="#overview" type="button" style="background-color: #e9ecef; color: #082b59;">
            <i class="bi bi-wallet2 me-2"></i> Financial Overview
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link px-4 py-3 border-0 rounded-top-4 ms-2" data-bs-toggle="tab" data-bs-target="#inventory" type="button" style="background-color: #e9ecef; color: #6c757d;">
            <i class="bi bi-boxes me-2"></i> Upload & Inventory
          </button>
        </li>
      </ul>

      <div class="tab-content">
        
        <div class="tab-pane fade show active" id="overview" role="tabpanel">
          <div class="row g-4">
            
            <div class="col-md-6">
              <div class="card shadow-sm border-0 rounded-4 bg-white p-4 h-100">
                <div class="d-flex align-items-center mb-3">
                  <div class="bg-warning-subtle text-warning p-3 rounded-circle me-3"><i class="bi bi-shield-lock-fill fs-3"></i></div>
                  <div>
                    <h6 class="fw-bold text-muted text-uppercase mb-0">Locked in Escrow</h6>
                    <h3 class="fw-black mb-0">₦{{ Number(userProfile.escrow_balance).toLocaleString() }}</h3>
                  </div>
                </div>
                <p class="text-muted small mb-0">Funds waiting for buyers to confirm receipt of their items.</p>
              </div>
            </div>

            <div class="col-md-6">
              <div class="card shadow-sm border-0 rounded-4 bg-white p-4 h-100 border-success border-start border-4">
                <div class="d-flex align-items-center mb-3">
                  <div class="bg-success-subtle text-success p-3 rounded-circle me-3"><i class="bi bi-cash-stack fs-3"></i></div>
                  <div>
                    <h6 class="fw-bold text-muted text-uppercase mb-0">Available to Withdraw</h6>
                    <h3 class="fw-black text-success mb-0">₦{{ Number(userProfile.wallet_balance).toLocaleString() }}</h3>
                  </div>
                </div>
                
                <button v-if="hasBankDetails" @click="requestWithdrawal" class="btn btn-success fw-bold w-100 rounded-pill mt-3 shadow-sm" :disabled="userProfile.wallet_balance <= 0 || isWithdrawing">
                  {{ isWithdrawing ? 'Processing...' : 'Request Bank Withdrawal' }}
                </button>
                <div v-else class="alert alert-warning mt-3 mb-0 small fw-bold">
                  <i class="bi bi-exclamation-triangle me-2"></i> Please save your bank details below to enable withdrawals.
                </div>
              </div>
            </div>

            <div class="col-12 mt-4">
              <div class="card shadow-sm border-0 rounded-4 bg-light p-4">
                <h6 class="fw-bold text-dark border-bottom pb-2 mb-3"><i class="bi bi-bank me-2"></i>Payout Details Setup</h6>
                <form @submit.prevent="saveBankDetails" class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-muted">Bank Name</label>
                    <input type="text" class="form-control" placeholder="e.g. GTBank, Opay, Kuda" v-model="bankForm.bank_name" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-muted">Account Number</label>
                    <input type="text" class="form-control" placeholder="10-digit number" v-model="bankForm.account_number" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-muted">Account Name</label>
                    <input type="text" class="form-control" placeholder="Legal Name" v-model="bankForm.account_name" required>
                  </div>
                  <div class="col-12 text-end">
                    <button type="submit" class="btn btn-dark btn-sm fw-bold rounded-pill px-4" :disabled="isSavingBank">
                      {{ isSavingBank ? 'Saving...' : 'Save Details' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>

        <div class="tab-pane fade" id="inventory" role="tabpanel">
          
          <div class="card shadow-sm border-0 rounded-4 bg-white mb-5 overflow-hidden">
            <div class="card-header bg-dark text-white p-4 border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-upload me-2"></i>Upload New Merchandise</h5>
            </div>
            
            <div v-if="!hasActiveSubscription && userProfile.role !== 'admin'" class="card-body p-5 text-center">
              <i class="bi bi-lock-fill text-danger fs-1 mb-3 d-block"></i>
              <h4 class="fw-bold">Storefront Locked</h4>
              <p class="text-muted mb-4">You need an active 30-day seller subscription to upload new merchandise.</p>
              <button class="btn btn-primary fw-bold rounded-pill px-5" style="background-color: #082b59; border: none;">Subscribe via Paystack</button>
            </div>

            <div v-else class="card-body p-4 p-md-5">
              <form @submit.prevent="publishProduct" class="row g-4">
                <div class="col-md-6"><label class="fw-bold text-muted small text-uppercase">Product Title</label><input type="text" class="form-control form-control-lg bg-light border-0" v-model="newProduct.name" required></div>
                <div class="col-md-3"><label class="fw-bold text-muted small text-uppercase">Price (₦)</label><input type="number" class="form-control form-control-lg bg-light border-0" v-model="newProduct.price" required></div>
                <div class="col-md-3"><label class="fw-bold text-muted small text-uppercase">Initial Stock</label><input type="number" class="form-control form-control-lg bg-light border-0" v-model="newProduct.stock" min="1" required></div>
                <div class="col-md-4">
                  <label class="fw-bold text-muted small text-uppercase">Category</label>
                  <select class="form-select form-select-lg bg-light border-0" v-model="newProduct.category" required>
                    <option>Food & Beverages</option><option>IT & Tech</option><option>Fashion & Clothing</option><option>Textbooks</option><option>Services</option><option>Other</option>
                  </select>
                </div>
                <div class="col-md-4"><label class="fw-bold text-muted small text-uppercase">Upload Images</label><input type="file" class="form-control form-control-lg bg-light border-0" @change="e => imageFiles = Array.from(e.target.files)" accept="image/*" multiple required></div>
                <div class="col-md-4"><label class="fw-bold text-muted small text-uppercase">Tags (Comma separated)</label><input type="text" class="form-control form-control-lg bg-light border-0" v-model="newProduct.tagsStr"></div>
                <div class="col-12"><label class="fw-bold text-muted small text-uppercase">Detailed Description</label><textarea class="form-control bg-light border-0" v-model="newProduct.description" rows="3" required></textarea></div>
                
                <div class="col-12 text-end mt-4 pt-3 border-top">
                  <button type="submit" class="btn btn-primary btn-lg fw-bold px-5 rounded-pill shadow" :disabled="isUploadingProduct" style="background-color: #082b59; border: none;">
                    {{ isUploadingProduct ? 'Uploading...' : 'Push to Live Feed' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="card shadow-sm border-0 rounded-4 bg-white p-4">
            <h5 class="fw-bold mb-4 border-bottom pb-3 text-dark"><i class="bi bi-clipboard-data me-2"></i>Inventory Manager</h5>
            
            <div v-if="sellerProducts.length === 0" class="text-center text-muted py-4">You haven't uploaded any products yet.</div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Stock Remaining</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in sellerProducts" :key="product.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <img :src="product.image_urls[0]" class="rounded-3 me-3" style="width: 50px; height: 50px; object-fit: cover;">
                        <span class="fw-bold text-truncate" style="max-width: 200px; display: inline-block;">{{ product.title }}</span>
                      </div>
                    </td>
                    <td class="fw-bold text-danger">₦{{ product.price.toLocaleString() }}</td>
                    <td>
                      <span v-if="product.is_approved" class="badge bg-success-subtle text-success border border-success">Live</span>
                      <span v-else class="badge bg-warning-subtle text-warning border border-warning">Pending</span>
                    </td>
                    <td style="width: 150px;">
                      <input type="number" class="form-control bg-light" v-model="product.stock" min="0">
                    </td>
                    <td>
                      <button @click="updateStock(product)" class="btn btn-sm btn-outline-primary fw-bold rounded-pill">Update</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'

const isLoading = ref(true)
const currentUser = ref(null)
const userProfile = ref({})
const hasActiveSubscription = ref(false)

// Financials & Bank Details
const isWithdrawing = ref(false)
const isSavingBank = ref(false)
const bankForm = ref({ bank_name: '', account_number: '', account_name: '' })

const hasBankDetails = computed(() => {
  return userProfile.value.bank_name && userProfile.value.account_number && userProfile.value.account_name
})

// Upload & Inventory
const isUploadingProduct = ref(false)
const sellerProducts = ref([])
const newProduct = ref({ name: '', price: '', stock: 1, category: 'Food & Beverages', description: '', tagsStr: '' })
const imageFiles = ref([])

const fetchDashboardData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (sessionData.session) {
    currentUser.value = sessionData.session.user
    
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.value.id).single()
    if (profile) {
      userProfile.value = profile
      bankForm.value = { 
        bank_name: profile.bank_name || '', 
        account_number: profile.account_number || '', 
        account_name: profile.account_name || '' 
      }
      hasActiveSubscription.value = profile.is_subscribed && profile.subscription_expires_at && (new Date(profile.subscription_expires_at) > new Date())
    }

    const { data: products } = await supabase.from('products').select('*').eq('seller_id', currentUser.value.id).order('created_at', { ascending: false })
    sellerProducts.value = products || []
  }
  isLoading.value = false
}

const saveBankDetails = async () => {
  isSavingBank.value = true
  try {
    const { error } = await supabase.from('profiles').update(bankForm.value).eq('id', currentUser.value.id)
    if (error) throw error
    alert('Bank Details Saved Successfully!')
    await fetchDashboardData()
  } catch (error) {
    alert('Error saving bank details: ' + error.message)
  } finally {
    isSavingBank.value = false
  }
}

const requestWithdrawal = async () => {
  if(!confirm("Request bank transfer of ₦" + userProfile.value.wallet_balance + " to " + userProfile.value.bank_name + "?")) return;
  isWithdrawing.value = true
  
  try {
    const amount = userProfile.value.wallet_balance
    // Compile bank details into the transaction description for the admin
    const payoutDescription = `Bank Payout Request - ${userProfile.value.bank_name} | ${userProfile.value.account_number} | ${userProfile.value.account_name}`
    
    const { error: walletError } = await supabase.from('profiles').update({ wallet_balance: 0 }).eq('id', currentUser.value.id)
    if (walletError) throw walletError
    
    const { error: transError } = await supabase.from('transactions').insert([{ 
      profile_id: currentUser.value.id, 
      amount: amount, 
      type: 'debit', 
      status: 'Pending', 
      description: payoutDescription 
    }])
    if (transError) throw transError

    alert("Withdrawal requested successfully! Our Admin will wire the funds to your registered account shortly.")
    await fetchDashboardData()
  } catch(error) { 
    alert("Error requesting withdrawal: " + error.message) 
  } finally { 
    isWithdrawing.value = false 
  }
}

const publishProduct = async () => {
  if (imageFiles.value.length === 0) return alert("Please select at least one image.")
  isUploadingProduct.value = true
  
  try {
    let uploadedUrls = []
    for (const file of imageFiles.value) {
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${file.name.split('.').pop()}`
      await supabase.storage.from('product-images').upload(fileName, file)
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }
    
    const tagsArray = newProduct.value.tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    await supabase.from('products').insert([{ 
      title: newProduct.value.name, 
      price: Number(newProduct.value.price), 
      stock: Number(newProduct.value.stock),
      category: newProduct.value.category, 
      description: newProduct.value.description, 
      tags: tagsArray, 
      image_urls: uploadedUrls, 
      seller_id: currentUser.value.id 
    }])
    
    alert("Merchandise Listed! Pending Admin Approval.")
    newProduct.value = { name: '', price: '', stock: 1, category: 'Food & Beverages', description: '', tagsStr: '' }
    imageFiles.value = []
    await fetchDashboardData()
    
  } catch (error) { alert(error.message) } finally { isUploadingProduct.value = false }
}

const updateStock = async (product) => {
  try {
    await supabase.from('products').update({ stock: Number(product.stock) }).eq('id', product.id)
    alert('Stock updated successfully!')
  } catch (error) {
    alert('Failed to update stock.')
  }
}

onMounted(() => fetchDashboardData())
</script>