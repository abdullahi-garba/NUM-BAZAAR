<template>
  <div class="container admin-container pb-5 mt-4">
    <div v-if="!isAdmin" class="text-center py-5"><h3 class="fw-bold text-danger">ACCESS DENIED</h3></div>
    
    <div v-else>
      <h2 class="fw-black mb-4" style="color: #800000;"><i class="bi bi-shield-lock-fill me-2"></i>System Overwatch</h2>
      <div class="row g-4">
        
        <div class="col-lg-6">
          <div class="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
            <div class="card-header text-white fw-bold py-3 border-0" style="background-color: #082b59;">Pending Product Approvals</div>
            <div v-if="pendingProducts.length === 0" class="text-center py-5 bg-white"><h5 class="text-muted">No pending approvals.</h5></div>
            <ul v-else class="list-group list-group-flush bg-white">
              <li v-for="product in pendingProducts" :key="product.id" class="list-group-item p-4">
                <div class="d-flex align-items-center mb-3">
                  <img :src="product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : 'https://via.placeholder.com/60'" style="width: 50px; height: 50px; object-fit: cover;" class="me-3 rounded-3 shadow-sm" />
                  <div><h6 class="fw-bold mb-1">{{ product.title }}</h6><span class="fw-bold text-danger">₦{{ Number(product.price).toLocaleString() }}</span></div>
                </div>
                <div class="d-flex gap-2">
                  <button @click="approveProduct(product.id)" class="btn btn-success btn-sm w-100 fw-bold rounded-pill shadow-sm">Approve</button>
                  <button @click="rejectProduct(product.id)" class="btn btn-outline-danger btn-sm w-100 fw-bold rounded-pill">Reject</button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
            <div class="card-header text-white fw-bold py-3 border-0" style="background-color: #800000;"><i class="bi bi-headset me-2"></i>Active Support Tickets</div>
            <div v-if="tickets.length === 0" class="text-center py-5 bg-white"><h5 class="text-muted">No open complaints!</h5></div>
            <ul v-else class="list-group list-group-flush bg-white">
              <li v-for="ticket in tickets" :key="ticket.id" class="list-group-item p-4">
                <h6 class="fw-bold mb-1 text-dark">{{ ticket.subject }}</h6>
                <p class="text-muted small mb-3">{{ ticket.description }}</p>
                <button @click="resolveTicket(ticket.id)" class="btn btn-outline-success btn-sm w-100 fw-bold rounded-pill">Mark as Resolved</button>
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

const isAdmin = ref(false)
const pendingProducts = ref([])
const tickets = ref([])

const checkAdminClearance = async (user) => {
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (data?.role === 'admin' || data?.role === 'Admin') { 
    isAdmin.value = true
    await loadDashboardData() 
  }
}

const loadDashboardData = async () => {
  const { data: pending } = await supabase.from('products').select('*').eq('is_approved', false).order('created_at', { ascending: false })
  if (pending) pendingProducts.value = pending

  const { data: openTickets } = await supabase.from('tickets').select('*').eq('status', 'open').order('created_at', { ascending: true })
  if (openTickets) tickets.value = openTickets
}

const approveProduct = async (id) => { await supabase.from('products').update({ is_approved: true }).eq('id', id); await loadDashboardData() }
const rejectProduct = async (id) => { if (confirm('Reject and delete?')) { await supabase.from('products').delete().eq('id', id); await loadDashboardData() } }
const resolveTicket = async (id) => { await supabase.from('tickets').update({ status: 'resolved' }).eq('id', id); await loadDashboardData() }

onMounted(async () => { 
  const { data } = await supabase.auth.getSession()
  if (data.session) checkAdminClearance(data.session.user) 
})
</script>