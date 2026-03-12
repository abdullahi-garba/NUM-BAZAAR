<template>
  <div class="container py-5 mt-4">
    <div class="d-flex align-items-center mb-4 border-bottom pb-3">
      <h2 class="fw-black mb-0 text-dark"><i class="bi bi-headset me-2"></i>Support Resolution Center</h2>
    </div>

    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else class="row g-4">
      
      <div class="col-lg-4">
        <div class="card shadow-sm border-0 rounded-4 bg-white p-4 sticky-top" style="top: 100px;">
          <h5 class="fw-bold mb-3 border-bottom pb-2">Open a Ticket</h5>
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
            <button type="submit" class="btn btn-primary w-100 fw-bold rounded-pill py-2 shadow-sm" :disabled="isSubmitting" style="background-color: #082b59; border: none;">
              {{ isSubmitting ? 'Submitting...' : 'Submit Ticket' }}
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const isLoading = ref(true)
const isSubmitting = ref(false)
const currentUser = ref(null)
const isAdmin = ref(false)

const newTicket = ref({ subject: '', description: '' })
const myTickets = ref([])
const adminTickets = ref([])

const fetchWorkspaceData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (sessionData.session) {
    currentUser.value = sessionData.session.user
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.value.id).single()
    if (profile && profile.role === 'admin') isAdmin.value = true

    const { data: userTix } = await supabase.from('tickets').select('*').eq('user_id', currentUser.value.id).order('created_at', { ascending: false })
    myTickets.value = userTix || []

    if (isAdmin.value) {
      const { data: allTix } = await supabase.from('tickets').select('*').eq('status', 'open').order('created_at', { ascending: false })
      adminTickets.value = allTix || []
    }
  }
  isLoading.value = false
}

const submitTicket = async () => {
  if (!currentUser.value) return alert("Please log in to submit a ticket.");
  isSubmitting.value = true
  try {
    await supabase.from('tickets').insert([{ user_id: currentUser.value.id, subject: newTicket.value.subject, description: newTicket.value.description }])
    alert("Ticket submitted successfully! Admin will review it shortly.")
    newTicket.value = { subject: '', description: '' }
    await fetchWorkspaceData()
  } catch (error) { alert("Error submitting ticket.") } finally { isSubmitting.value = false }
}

const resolveTicket = async (ticketId) => {
  if(!confirm("Mark this dispute as fully resolved?")) return;
  try {
    await supabase.from('tickets').update({ status: 'resolved' }).eq('id', ticketId)
    await fetchWorkspaceData()
  } catch (error) { alert("Error updating ticket.") }
}

onMounted(() => fetchWorkspaceData())
</script>