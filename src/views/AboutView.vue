<template>
  <div class="container py-5 mt-4">
    
    <div class="text-center mb-5 pb-3">
      <h1 class="fw-black mb-3" style="color: #082b59;">Built for the Campus. <br>Secured by Escrow.</h1>
      <p class="text-muted lead mx-auto" style="max-width: 700px;">
        NUM BAZAAR was engineered to solve a critical problem: creating a completely trustless, secure micro-economy for the Newgate University community. We eliminate fraud by ensuring funds are never released until the product is physically delivered.
      </p>
    </div>

    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 mb-5 text-center">
      <div class="row g-4 align-items-center">
        <div class="col-md-4">
          <i class="bi bi-shield-lock-fill text-warning mb-3 d-block" style="font-size: 4rem;"></i>
          <h5 class="fw-bold text-dark">Zero Fraud</h5>
          <p class="text-muted small">Our automated escrow engine locks funds safely during every transaction.</p>
        </div>
        <div class="col-md-4">
          <div class="border-start border-end px-3">
            <i class="bi bi-shop mb-3 d-block" style="color: #082b59; font-size: 4rem;"></i>
            <h5 class="fw-bold text-dark">Student Commerce</h5>
            <p class="text-muted small">Empowering student entrepreneurs to launch digital storefronts instantly.</p>
          </div>
        </div>
        <div class="col-md-4">
          <i class="bi bi-lightning-charge-fill text-primary mb-3 d-block" style="font-size: 4rem;"></i>
          <h5 class="fw-bold text-dark">Real-Time Sync</h5>
          <p class="text-muted small">Live chat and instant stock depletion built on a modern infrastructure.</p>
        </div>
      </div>
    </div>

    <h3 class="fw-black text-center mb-5 text-dark">Meet the Core Team</h3>
    
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>
    
    <div v-else-if="teamMembers.length === 0" class="text-center text-muted py-4">
      <p>Team profiles are currently being updated.</p>
    </div>

    <div v-else class="row g-4 justify-content-center">
      
      <div v-for="member in teamMembers" :key="member.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100 text-center overflow-hidden team-card">
          <div class="bg-light py-4">
            <img :src="member.image_url" :alt="member.name" class="rounded-circle object-fit-cover shadow-sm border border-4 border-white" style="width: 140px; height: 140px;">
          </div>
          <div class="card-body p-4 d-flex flex-column">
            <h4 class="fw-black text-dark mb-1">{{ member.name }}</h4>
            <div class="mb-3">
              <span class="badge px-3 py-2 rounded-pill" style="background-color: #082b59;">{{ member.role }}</span>
            </div>
            
            <p class="text-muted small text-start flex-grow-1" style="white-space: pre-line;">
              {{ member.bio }}
            </p>
            
            <div class="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
              <a v-if="member.github_url" :href="member.github_url" target="_blank" class="text-muted fs-5 hover-primary"><i class="bi bi-github"></i></a>
              <a v-if="member.linkedin_url" :href="member.linkedin_url" target="_blank" class="text-muted fs-5 hover-primary"><i class="bi bi-linkedin"></i></a>
              <a v-if="member.twitter_url" :href="member.twitter_url" target="_blank" class="text-muted fs-5 hover-primary"><i class="bi bi-twitter-x"></i></a>
              <a v-if="member.email" :href="'mailto:' + member.email" class="text-muted fs-5 hover-primary"><i class="bi bi-envelope"></i></a>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="mt-5 bg-dark text-white rounded-4 p-4 p-md-5 text-center shadow-sm">
      <h3 class="fw-black mb-3">Want to sell on NUM BAZAAR?</h3>
      <p class="text-white-50 mb-4 mx-auto" style="max-width: 500px;">Join the growing network of student entrepreneurs securing their transactions through our Escrow engine.</p>
      <router-link to="/auth" class="btn btn-warning fw-bold rounded-pill px-5 py-2 text-dark">Get Started</router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const teamMembers = ref([])
const isLoading = ref(true)

const fetchTeam = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    teamMembers.value = data || []
  } catch (error) {
    console.error("Error fetching team:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchTeam())
</script>

<style scoped>
.team-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
.hover-primary {
  transition: color 0.2s ease;
}
.hover-primary:hover {
  color: #082b59 !important;
}
</style>