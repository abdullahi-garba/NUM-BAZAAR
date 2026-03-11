<template>
  <div class="container py-5 mt-4">
    <div class="d-flex align-items-center mb-4 border-bottom pb-3">
      <h2 class="fw-black mb-0 text-danger"><i class="bi bi-shield-lock-fill me-2"></i>Admin Overwatch</h2>
    </div>

    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-danger"></div></div>

    <div v-else-if="!isAdmin" class="text-center py-5">
      <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 4rem;"></i>
      <h3 class="fw-bold mt-3">Access Denied</h3>
      <p class="text-muted">You do not have administrative clearance to view this sector.</p>
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-6">
        <div class="card shadow-sm border-0 rounded-4 bg-white h-100">
          <div class="card-header bg-danger text-white p-3 border-0 rounded-top-4">
            <h5 class="fw-bold mb-0"><i class="bi bi-bank me-2"></i>Pending Withdrawals</h5>
          </div>
          <div class="card-body p-0">
            <div v-if="withdrawals.length === 0" class="p-5 text-center text-muted">
              <p class="mb-0">No pending withdrawal requests.</p>
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="req in withdrawals" :key="req.id" class="list-group-item p-4">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-bold text-dark mb-0">{{ req.description }}</h6>
                  <h5 class="fw-black text-danger mb-0">₦{{ Number(req.amount).toLocaleString() }}</h5>
                </div>
                <small class="text-muted d-block mb-3">Requested: {{ new Date(req.created_at).toLocaleString() }}</small>
                <button @click="markAsPaid(req.id)" class="btn btn-sm btn-outline-success fw-bold rounded-pill w-100">
                  <i class="bi bi-check2-all me-1"></i> Mark as Paid
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card shadow-sm border-0 rounded-4 bg-white h-100">
          <div class="card-header bg-dark text-white p-3 border-0 rounded-top-4">
            <h5 class="fw-bold mb-0"><i class="bi bi-search me-2"></i>Product Moderation Queue</h5>
          </div>
          <div class="card-body p-0">
            <div v-if="pendingProducts.length === 0" class="p-5 text-center text-muted">
              <p class="mb-0">The queue is clear. All products approved.</p>
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="product in pendingProducts" :key="product.id" class="list-group-item p-4">
                <div class="d-flex align-items-center mb-3">
                  <img :src="product.image_urls[0]" class="rounded-3 me-3" style="width: 60px; height: 60px; object-fit: cover;">
                  <div>
                    <h6 class="fw-bold mb-1">{{ product.title }}</h6>
                    <h6 class="fw-black text-primary mb-0">₦{{ Number(product.price).toLocaleString() }}</h6>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button @click="approveProduct(product.id)" class="btn btn-sm btn-success fw-bold rounded-pill flex-grow-1">Approve</button>
                  <button @click="rejectProduct(product.id)" class="btn btn-sm btn-danger fw-bold rounded-pill flex-grow-1">Reject</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const isLoading = ref(true)
const isAdmin = ref(false)
const withdrawals = ref([])
const pendingProducts = ref([])

const fetchAdminData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (sessionData.session) {
    // 1. Verify Admin Clearance
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', sessionData.session.user.id).single()
    
    if (profile && profile.role === 'admin') {
      isAdmin.value = true
      
      // 2. Fetch Pending Withdrawals (Debits that are not marked 'Paid' yet)
      const { data: txns } = await supabase.from('transactions').select('*').eq('type', 'debit').eq('status', 'Completed').order('created_at', { ascending: false })
      withdrawals.value = txns || []

      // 3. Fetch Pending Products
      const { data: prods } = await supabase.from('products').select('*').eq('is_approved', false).order('created_at', { ascending: true })
      pendingProducts.value = prods || []
    }
  }
  isLoading.value = false
}

const markAsPaid = async (id) => {
  if(!confirm("Have you physically wired this money to the seller's bank account?")) return;
  await supabase.from('transactions').update({ status: 'Paid Out' }).eq('id', id)
  fetchAdminData()
}

const approveProduct = async (id) => {
  await supabase.from('products').update({ is_approved: true }).eq('id', id)
  fetchAdminData()
}

const rejectProduct = async (id) => {
  if(!confirm("Delete this product from the database?")) return;
  await supabase.from('products').delete().eq('id', id)
  fetchAdminData()
}

onMounted(() => fetchAdminData())
</script>