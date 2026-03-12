<template>
  <div class="container py-5 mt-4">
    <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
      <div class="d-flex align-items-center">
        <h2 class="fw-black mb-0 text-dark" style="color: #082b59;"><i class="bi bi-grid-1x2-fill me-2"></i>Workspace</h2>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else>
      <ul class="nav nav-tabs fw-bold mb-4 border-bottom-0" role="tablist">
        <li class="nav-item">
          <button class="nav-link active px-4 py-3 border-0 rounded-top-4" data-bs-toggle="tab" data-bs-target="#support" type="button" style="background-color: #e9ecef; color: #082b59;">
            <i class="bi bi-headset me-2"></i> Support Center
          </button>
        </li>
        <li class="nav-item" v-if="['seller', 'admin'].includes(userRole)">
          <button class="nav-link px-4 py-3 border-0 rounded-top-4 ms-2" data-bs-toggle="tab" data-bs-target="#seller-tools" type="button" style="background-color: #e9ecef; color: #6c757d;">
            <i class="bi bi-box-seam me-2"></i> Seller Tools
          </button>
        </li>
      </ul>

      <div class="tab-content">
        
        <div class="tab-pane fade show active" id="support" role="tabpanel">
          <div class="row g-4">
            
            <div class="col-lg-4">
              <div class="card shadow-sm border-0 rounded-4 bg-white p-4 sticky-top" style="top: 100px;">
                <h5 class="fw-bold mb-3 border-bottom pb-2">Open a Dispute / Ticket</h5>
                <p class="text-muted small mb-4">Having an issue with an Escrow order, a vendor, or your account? Open a ticket and our Admin team will investigate.</p>
                
                <form @submit.prevent="submitTicket">
                  <div class="mb-3">
                    <label class="form-label fw-bold text-muted small text-uppercase">Subject</label>
                    <select class="form-select bg-light border-0" v-model="newTicket.subject" required>
                      <option value="" disabled>Select an issue...</option>
                      <option value="Escrow Dispute (Item not delivered)">Escrow Dispute (Item not delivered)</option>
                      <option value="Escrow Dispute (Item defective/fake)">Escrow Dispute (Item defective/fake)</option>
                      <option value="Report a Vendor">Report a Vendor</option>
                      <option value="Payment / Withdrawal Issue">Payment / Withdrawal Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="mb-4">
                    <label class="form-label fw-bold text-muted small text-uppercase">Detailed Description</label>
                    <textarea class="form-control bg-light border-0" v-model="newTicket.description" rows="4" placeholder="Provide order names, vendor details, or exact amounts..." required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary w-100 fw-bold rounded-pill py-2 shadow-sm" :disabled="isSubmittingTicket" style="background-color: #082b59; border: none;">
                    {{ isSubmittingTicket ? 'Submitting...' : 'Submit Ticket' }}
                  </button>
                </form>
              </div>
            </div>

            <div class="col-lg-8">
              <div v-if="isAdmin" class="card shadow-sm border-0 rounded-4 bg-white mb-4">
                <div class="card-header bg-dark text-white p-3 border-0 rounded-top-4 d-flex justify-content-between align-items-center">
                  <h5 class="fw-bold mb-0"><i class="bi bi-shield-lock me-2"></i>Admin Queue (All Open Tickets)</h5>
                </div>
                <div class="card-body p-0">
                  <div v-if="adminTickets.length === 0" class="p-5 text-center text-muted">No open tickets across the platform. Good job!</div>
                  <ul v-else class="list-group list-group-flush">
                    <li v-for="ticket in adminTickets" :key="ticket.id" class="list-group-item p-4 border-danger border-start border-4">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="fw-bold text-dark mb-0">{{ ticket.subject }}</h6>
                        <span class="badge bg-danger-subtle text-danger rounded-pill">Needs Action</span>
                      </div>
                      <p class="text-muted small mb-3 bg-light p-3 rounded-3">{{ ticket.description }}</p>
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted fw-bold">Ticket ID: {{ ticket.id.substring(0,8) }}</small>
                        <button @click="resolveTicket(ticket.id)" class="btn btn-sm btn-success fw-bold rounded-pill px-4">Mark as Resolved</button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="card shadow-sm border-0 rounded-4 bg-white">
                <div class="card-header bg-white border-bottom p-4">
                  <h5 class="fw-bold mb-0">My Support History</h5>
                </div>
                <div class="card-body p-0">
                  <div v-if="myTickets.length === 0" class="p-5 text-center text-muted">
                    <i class="bi bi-check2-circle fs-1 mb-2 d-block text-success"></i>
                    <p class="mb-0">You have no active or past support tickets.</p>
                  </div>
                  <ul v-else class="list-group list-group-flush">
                    <li v-for="ticket in myTickets" :key="ticket.id" class="list-group-item p-4">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="fw-bold text-dark mb-0">{{ ticket.subject }}</h6>
                        <span v-if="ticket.status === 'open'" class="badge bg-warning-subtle text-warning border border-warning rounded-pill">Open</span>
                        <span v-else class="badge bg-success-subtle text-success border border-success rounded-pill">Resolved</span>
                      </div>
                      <p class="text-muted small mb-2">{{ ticket.description }}</p>
                      <small class="text-muted d-block">Submitted: {{ new Date(ticket.created_at).toLocaleString() }}</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="tab-pane fade" id="seller-tools" role="tabpanel" v-if="['seller', 'admin'].includes(userRole)">
          <div class="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
            <div class="card-header bg-dark text-white p-4 border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-upload me-2"></i>Upload New Merchandise</h5>
            </div>
            
            <div v-if="!hasActiveSubscription && userRole !== 'admin'" class="card-body p-5 text-center">
              <i class="bi bi-lock-fill text-danger fs-1 mb-3 d-block"></i>
              <h4 class="fw-bold">Storefront Locked</h4>
              <p class="text-muted mb-4">You need an active 30-day seller subscription to upload new merchandise to the Campus Feed.</p>
              <router-link to="/dashboard" class="btn btn-primary fw-bold rounded-pill px-5" style="background-color: #082b59; border: none;">Go to Verification Hub</router-link>
            </div>

            <div v-else class="card-body p-4 p-md-5">
              <form @submit.prevent="publishProduct" class="row g-4">
                <div class="col-md-6"><label class="fw-bold text-muted small text-uppercase">Product Title</label><input type="text" class="form-control form-control-lg bg-light border-0" v-model="newProduct.name" required></div>
                <div class="col-md-3"><label class="fw-bold text-muted small text-uppercase">Price (₦)</label><input type="number" class="form-control form-control-lg bg-light border-0" v-model="newProduct.price" required></div>
                <div class="col-md-3">
                  <label class="fw-bold text-muted small text-uppercase">Category</label>
                  <select class="form-select form-select-lg bg-light border-0" v-model="newProduct.category" required>
                    <option>Food & Beverages</option><option>IT & Tech</option><option>Fashion & Clothing</option><option>Textbooks</option><option>Services</option><option>Other</option>
                  </select>
                </div>
                <div class="col-md-6"><label class="fw-bold text-muted small text-uppercase">Upload Images (Select Multiple)</label><input type="file" class="form-control form-control-lg bg-light border-0" @change="e => imageFiles = Array.from(e.target.files)" accept="image/*" multiple required></div>
                <div class="col-md-6"><label class="fw-bold text-muted small text-uppercase">Search Tags (Comma separated)</label><input type="text" class="form-control form-control-lg bg-light border-0" v-model="newProduct.tagsStr" placeholder="e.g. macbook, laptop, used"></div>
                <div class="col-12"><label class="fw-bold text-muted small text-uppercase">Detailed Description</label><textarea class="form-control bg-light border-0" v-model="newProduct.description" rows="3" required></textarea></div>
                
                <div class="col-12 text-end mt-4 pt-3 border-top">
                  <button type="submit" class="btn btn-primary btn-lg fw-bold px-5 rounded-pill shadow" :disabled="isUploadingProduct" style="background-color: #082b59; border: none;">
                    {{ isUploadingProduct ? 'Uploading to Database...' : 'Push to Live Feed' }}
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
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

// GLOBAL STATE
const isLoading = ref(true)
const currentUser = ref(null)
const userRole = ref('buyer')
const isAdmin = ref(false)
const hasActiveSubscription = ref(false)

// SUPPORT TICKET STATE
const isSubmittingTicket = ref(false)
const newTicket = ref({ subject: '', description: '' })
const myTickets = ref([])
const adminTickets = ref([])

// PRODUCT UPLOAD STATE
const isUploadingProduct = ref(false)
const newProduct = ref({ name: '', price: '', category: 'Food & Beverages', description: '', tagsStr: '' })
const imageFiles = ref([])

const fetchWorkspaceData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (sessionData.session) {
    currentUser.value = sessionData.session.user
    
    // Check role & subscription status
    const { data: profile } = await supabase.from('profiles').select('role, is_subscribed, subscription_expires_at').eq('id', currentUser.value.id).single()
    if (profile) {
      userRole.value = profile.role
      if (profile.role === 'admin') isAdmin.value = true
      hasActiveSubscription.value = profile.is_subscribed && profile.subscription_expires_at && (new Date(profile.subscription_expires_at) > new Date())
    }

    // Fetch user's personal tickets
    const { data: userTix } = await supabase.from('tickets').select('*').eq('user_id', currentUser.value.id).order('created_at', { ascending: false })
    myTickets.value = userTix || []

    // If Admin, fetch all OPEN tickets
    if (isAdmin.value) {
      const { data: allTix } = await supabase.from('tickets').select('*').eq('status', 'open').order('created_at', { ascending: false })
      adminTickets.value = allTix || []
    }
  }
  isLoading.value = false
}

// SUPPORT METHODS
const submitTicket = async () => {
  if (!currentUser.value) return alert("Please log in to submit a ticket.");
  isSubmittingTicket.value = true
  try {
    await supabase.from('tickets').insert([{
      user_id: currentUser.value.id,
      subject: newTicket.value.subject,
      description: newTicket.value.description
    }])
    alert("Ticket submitted successfully! Admin will review it shortly.")
    newTicket.value = { subject: '', description: '' }
    await fetchWorkspaceData()
  } catch (error) {
    alert("Error submitting ticket.")
  } finally {
    isSubmittingTicket.value = false
  }
}

const resolveTicket = async (ticketId) => {
  if(!confirm("Mark this dispute as fully resolved?")) return;
  try {
    await supabase.from('tickets').update({ status: 'resolved' }).eq('id', ticketId)
    await fetchWorkspaceData()
  } catch (error) {
    alert("Error updating ticket.")
  }
}

// SELLER METHODS
const publishProduct = async () => {
  if (imageFiles.value.length === 0) return alert("Please select at least one image.")
  isUploadingProduct.value = true
  
  try {
    let uploadedUrls = []
    
    // Upload each image one by one
    for (const file of imageFiles.value) {
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${file.name.split('.').pop()}`
      await supabase.storage.from('product-images').upload(fileName, file)
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }
    
    const tagsArray = newProduct.value.tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    // Insert into DB
    await supabase.from('products').insert([{ 
      title: newProduct.value.name, 
      price: Number(newProduct.value.price), 
      category: newProduct.value.category, 
      description: newProduct.value.description, 
      tags: tagsArray, 
      image_urls: uploadedUrls, 
      seller_id: currentUser.value.id 
    }])
    
    alert("Merchandise Listed Successfully! It is now pending Admin Approval.")
    
    // Clear the form
    newProduct.value = { name: '', price: '', category: 'Food & Beverages', description: '', tagsStr: '' }
    imageFiles.value = []
    
  } catch (error) { 
    alert(error.message) 
  } finally { 
    isUploadingProduct.value = false 
  }
}

onMounted(() => fetchWorkspaceData())
</script>

<style scoped>
.nav-tabs .nav-link.active { background-color: white !important; color: #082b59 !important; border-bottom: 3px solid #082b59 !important; }
</style>