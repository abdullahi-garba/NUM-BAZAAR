<template>
  <div class="bg-white min-vh-100 d-flex flex-column">
    
    <div class="text-center position-relative" style="background-color: #082b59; padding-top: 80px; padding-bottom: 120px;">
      <div class="container">
        <span class="badge text-uppercase mb-4" style="background-color: #ffe8d6; color: #b22b1d; letter-spacing: 0.1em; font-weight: 800; padding: 8px 16px;">The Academic Vanguard</span>
        <h1 class="display-4 text-white mb-3" style="font-weight: 900; letter-spacing: -0.04em;">Built for the Campus.<br><span style="color: #8da9c4;">Secured by Escrow.</span></h1>
        <p class="lead text-white-50 mx-auto mb-5" style="max-width: 650px; font-weight: 500; font-size: 1.1rem;">
          The official commerce hub for Newgate University students. We combine academic trust with fintech-grade security to ensure every trade is protected.
        </p>
        <div class="d-flex justify-content-center gap-3">
          <button class="btn rounded-pill px-4 py-3" style="background-color: #b22b1d; color: white; font-weight: 700; border: none;">Get Support Now</button>
          <button class="btn rounded-pill px-4 py-3" style="background-color: rgba(255,255,255,0.1); color: white; font-weight: 700; border: 1px solid rgba(255,255,255,0.2);">Our Ethics</button>
        </div>
      </div>
    </div>

    <div class="container" style="margin-top: -60px; position: relative; z-index: 10;">
      <div class="row g-4">
        <div class="col-md-4">
          <div class="p-4 p-lg-5 h-100 bg-white" style="border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
            <div class="rounded d-inline-flex p-3 mb-4" style="background-color: #082b59; color: white;"><i class="bi bi-shield-lock-fill fs-4"></i></div>
            <h4 class="fw-bold mb-3" style="color: #111827;">Shielded Trades</h4>
            <p class="text-secondary mb-0" style="font-weight: 500; line-height: 1.6;">Our escrow system holds funds until the item is hand-delivered on campus, eliminating fraud and ensuring student safety.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-4 p-lg-5 h-100 bg-white" style="border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
            <div class="rounded d-inline-flex p-3 mb-4" style="background-color: #b22b1d; color: white;"><i class="bi bi-shop fs-4"></i></div>
            <h4 class="fw-bold mb-3" style="color: #111827;">Student Economy</h4>
            <p class="text-secondary mb-0" style="font-weight: 500; line-height: 1.6;">Empowering students to launch small ventures and circulate resources strictly within the Newgate University ecosystem.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-4 p-lg-5 h-100 bg-white" style="border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
            <div class="rounded d-inline-flex p-3 mb-4" style="background-color: #d97706; color: white;"><i class="bi bi-lightning-charge-fill fs-4"></i></div>
            <h4 class="fw-bold mb-3" style="color: #111827;">Instant Access</h4>
            <p class="text-secondary mb-0" style="font-weight: 500; line-height: 1.6;">Verified student IDs mean instant trust. No lengthy vetting—just browse, buy, and meet between lectures.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-5 mt-5">
      <h2 class="fw-bold mb-5" style="color: #111827; font-size: 2.2rem; letter-spacing: -0.03em;">The Curators</h2>
      
      <div v-if="isLoading" class="text-center py-5"><div class="spinner-border" style="color: #082b59;"></div></div>
      <div v-else-if="teamMembers.length === 0" class="text-center text-muted py-4 fw-medium">Team profiles are currently being updated.</div>
      
      <div v-else class="row g-4">
        <div v-for="member in teamMembers" :key="member.id" class="col-6 col-lg-3">
          <div class="p-3 border-0 h-100 d-flex flex-column bg-white" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <img :src="member.image_url" :alt="member.name" class="rounded w-100 mb-3 object-fit-cover" style="aspect-ratio: 1; border-radius: 12px !important;">
            <h5 class="fw-bold mb-1 text-dark">{{ member.name }}</h5>
            <p class="small fw-bold mb-3 text-uppercase" style="color: #b22b1d; letter-spacing: 0.05em; font-size: 0.7rem;">{{ member.role }}</p>
            <p class="text-secondary small flex-grow-1 mb-0" style="font-weight: 500; line-height: 1.5;">{{ member.bio }}</p>
            
            <div class="d-flex gap-3 mt-4 pt-3 border-top">
              <a v-if="member.github_url" :href="member.github_url" target="_blank" class="text-secondary hover-dark"><i class="bi bi-github"></i></a>
              <a v-if="member.linkedin_url" :href="member.linkedin_url" target="_blank" class="text-secondary hover-dark"><i class="bi bi-linkedin"></i></a>
              <a v-if="member.twitter_url" :href="member.twitter_url" target="_blank" class="text-secondary hover-dark"><i class="bi bi-twitter-x"></i></a>
              <a v-if="member.email" :href="'mailto:' + member.email" class="text-secondary hover-dark"><i class="bi bi-envelope"></i></a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="py-5 mb-4" style="background-color: #f8f9fa;">
      <div class="container py-4">
        <div class="text-center mb-5">
          <h2 class="fw-bold text-dark mb-3" style="letter-spacing: -0.03em;">How can we help?</h2>
          <p class="text-secondary fw-medium">Search our knowledge base or contact the warden office.</p>
          <div class="position-relative mx-auto mt-4" style="max-width: 600px;">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-secondary"></i>
            <input type="text" class="form-control rounded-pill ps-5 py-3 shadow-sm border-0" placeholder="Search for 'How to sell', 'Escrow rules'..." style="background-color: #ffffff; font-weight: 500; padding-left: 3rem !important;">
            <button class="btn position-absolute top-50 end-0 translate-middle-y me-2 rounded-pill px-4 py-2" style="background-color: #082b59; color: white; font-weight: 700;">Search</button>
          </div>
        </div>

        <div class="row g-4 mx-auto" style="max-width: 900px;">
          <div class="col-md-6">
            <div class="d-flex align-items-start p-4 bg-white shadow-sm h-100" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.03);">
              <i class="bi bi-question-circle-fill fs-4 me-3" style="color: #b22b1d;"></i>
              <div>
                <h6 class="fw-bold text-dark mb-1">Help Center</h6>
                <p class="small text-secondary mb-0 fw-medium">Detailed guides for sellers and buyers.</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex align-items-start p-4 bg-white shadow-sm h-100" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.03);">
              <i class="bi bi-shield-check fs-4 me-3" style="color: #b22b1d;"></i>
              <div>
                <h6 class="fw-bold text-dark mb-1">Security Audit</h6>
                <p class="small text-secondary mb-0 fw-medium">See how we protect your academic identity.</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex align-items-start p-4 bg-white shadow-sm h-100" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.03);">
              <i class="bi bi-shield-exclamation fs-4 me-3" style="color: #b22b1d;"></i>
              <div>
                <h6 class="fw-bold text-dark mb-1">Dispute Resolution</h6>
                <p class="small text-secondary mb-0 fw-medium">Process for items not matching description.</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex align-items-start p-4 bg-white shadow-sm h-100" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.03);">
              <i class="bi bi-envelope-fill fs-4 me-3" style="color: #b22b1d;"></i>
              <div>
                <h6 class="fw-bold text-dark mb-1">Contact Us</h6>
                <p class="small text-secondary mb-0 fw-medium">Typical response time: 2 campus hours.</p>
              </div>
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

const teamMembers = ref([])
const isLoading = ref(true)

const fetchTeam = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true })
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
.hover-dark {
  transition: color 0.2s ease;
}
.hover-dark:hover {
  color: #111827 !important;
}
</style>