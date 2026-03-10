<template>
  <div class="container py-5 mt-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <h2 class="fw-black mb-4 text-center" style="color: #082b59;">Resolution Center</h2>
        <p class="text-center text-muted mb-5">Got an issue with an order or a seller? Open a ticket and our Admin team will resolve it.</p>
        
        <div class="card shadow-lg border-0 rounded-4 bg-white p-4 p-md-5 mb-5">
          <h4 class="fw-bold mb-4 border-bottom pb-2"><i class="bi bi-headset me-2 text-primary"></i>Open a New Ticket</h4>
          <form @submit.prevent="submitTicket" class="row g-3">
            <div class="col-md-12">
              <label class="form-label fw-bold small text-uppercase">Subject / Order ID</label>
              <input type="text" class="form-control form-control-lg bg-light border-0" v-model="form.subject" placeholder="e.g. Broken item received - Order #1234" required>
            </div>
            <div class="col-12">
              <label class="form-label fw-bold small text-uppercase">Describe the Issue</label>
              <textarea class="form-control bg-light border-0" v-model="form.description" rows="5" placeholder="Please provide as much detail as possible..." required></textarea>
            </div>
            <div class="col-12 text-end mt-4">
              <button type="submit" class="btn btn-primary btn-lg fw-bold px-5 rounded-pill shadow" style="background-color: #082b59; border: none;">Submit Ticket</button>
            </div>
          </form>
        </div>

        <h4 class="fw-bold mb-3">My Support History</h4>
        <div v-if="tickets.length === 0" class="text-center text-muted py-4 bg-white shadow-sm rounded-4">
          <p class="mb-0">You have no open tickets.</p>
        </div>
        <div v-else class="card shadow-sm border-0 rounded-4 bg-white">
          <ul class="list-group list-group-flush">
            <li v-for="ticket in tickets" :key="ticket.id" class="list-group-item p-4">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="fw-bold mb-0 text-dark">{{ ticket.subject }}</h6>
                <span class="badge rounded-pill" :class="ticket.status === 'open' ? 'bg-warning text-dark' : 'bg-success'">{{ ticket.status.toUpperCase() }}</span>
              </div>
              <p class="text-muted small mb-0">{{ ticket.description }}</p>
              <small class="text-secondary" style="font-size: 0.7rem;">Filed on: {{ new Date(ticket.created_at).toLocaleString() }}</small>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const currentUser = ref(null)
const tickets = ref([])
const form = ref({ subject: '', description: '' })

const fetchTickets = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session) {
    currentUser.value = sessionData.session.user
    const { data } = await supabase.from('tickets').select('*').eq('user_id', currentUser.value.id).order('created_at', { ascending: false })
    tickets.value = data || []
  }
}

const submitTicket = async () => {
  if (!currentUser.value) return alert("Please sign in to open a ticket.");
  try {
    await supabase.from('tickets').insert([{ 
      user_id: currentUser.value.id, subject: form.value.subject, description: form.value.description, status: 'open' 
    }]);
    alert("Ticket submitted successfully! Our admins will review it.");
    form.value = { subject: '', description: '' };
    await fetchTickets();
  } catch (error) { alert("Failed to submit ticket."); }
}

onMounted(() => fetchTickets())
</script>