<template>
  <div id="app" class="d-flex flex-column min-vh-100 bg-light position-relative">
    
    <div v-if="userStatus === 'suspended' || userStatus === 'banned'" class="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-dark text-white p-4">
      <i class="bi bi-slash-circle text-danger mb-4" style="font-size: 5rem;"></i>
      <h1 class="fw-black mb-3 text-center">Account {{ userStatus === 'suspended' ? 'Suspended' : 'Banned' }}</h1>
      <p class="text-center text-white-50 mb-5" style="max-width: 500px;">
        Your access to NUM BAZAAR has been restricted due to suspicious activity, policy violations, or a pending administrative review. 
      </p>

      <div class="card bg-white text-dark border-0 rounded-4 p-4 shadow-lg w-100" style="max-width: 500px;">
        <h5 class="fw-bold border-bottom pb-3 mb-3"><i class="bi bi-shield-exclamation me-2 text-warning"></i>Submit an Appeal</h5>
        <div v-if="hasAppealed" class="alert alert-success fw-bold text-center mb-0 border-0 bg-success-subtle text-success-emphasis">
          <i class="bi bi-check-circle me-2"></i> Appeal submitted successfully. Our team will review your case.
        </div>
        <form v-else @submit.prevent="submitAppeal">
          <label class="form-label small fw-bold text-muted">Explain why your account should be reinstated:</label>
          <textarea class="form-control bg-light border-0 mb-3" rows="4" v-model="appealText" required placeholder="Provide context or evidence..."></textarea>
          <button type="submit" class="btn btn-danger w-100 fw-bold rounded-pill" :disabled="isSubmittingAppeal">
            {{ isSubmittingAppeal ? 'Submitting...' : 'Send Appeal to Admin' }}
          </button>
        </form>
      </div>
      
      <button @click="handleSignOut" class="btn btn-outline-light rounded-pill px-4 mt-5 fw-bold"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</button>
    </div>

    <template v-else>
      
      <nav v-if="currentUser" class="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" style="background-color: #082b59;">
        <div class="container">
          <router-link class="navbar-brand fw-black fs-4 tracking-tight" to="/shop" @click="closeMobileNavbar">NUM BAZAAR</router-link>
          <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto align-items-center gap-3 py-3 py-lg-0">
              <li class="nav-item w-100 text-center text-lg-start"><router-link to="/shop" class="nav-link fw-bold text-white" @click="closeMobileNavbar"><i class="bi bi-rss me-1"></i> Feed</router-link></li>
              <li class="nav-item w-100 text-center text-lg-start">
                <router-link to="/cart" class="nav-link fw-bold text-white position-relative" @click="closeMobileNavbar">
                  <i class="bi bi-cart3 me-1"></i> Cart
                  <span v-if="cartCount > 0" class="position-absolute top-25 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">{{ cartCount }}</span>
                </router-link>
              </li>
              <li class="nav-item w-100 text-center text-lg-start" v-if="['seller', 'admin'].includes(userRole)">
                <router-link to="/dashboard" class="nav-link fw-bold text-white" @click="closeMobileNavbar"><i class="bi bi-shop-window me-1"></i> Seller Hub</router-link>
              </li>
              <li class="nav-item w-100 text-center text-lg-start">
                <router-link :to="`/profile/${currentUser.id}`" class="nav-link fw-bold text-white" @click="closeMobileNavbar"><i class="bi bi-person-circle me-1"></i> Profile</router-link>
              </li>
              <li class="nav-item w-100 text-center text-lg-start" v-if="userRole === 'admin'">
                <router-link to="/admin" class="nav-link fw-bold" style="color: #ffc107;" @click="closeMobileNavbar"><i class="bi bi-shield-lock-fill me-1"></i> Admin</router-link>
              </li>
              <li class="nav-item ms-lg-3 mt-2 mt-lg-0 w-100">
                <button @click="handleSignOut" class="btn btn-outline-light btn-sm fw-bold rounded-pill px-4 py-2 w-100"><i class="bi bi-box-arrow-right me-1"></i> Sign Out</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main class="flex-grow-1">
        <router-view />
      </main>

      <div v-if="currentUser" class="floating-widgets d-flex flex-column gap-3">
        <router-link to="/support" class="btn btn-warning text-dark rounded-circle shadow-lg d-flex justify-content-center align-items-center position-relative widget-btn">
          <i class="bi bi-headset fs-4"></i>
          <span v-if="ticketCount > 0 && route.path !== '/support'" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow">{{ ticketCount }}</span>
        </router-link>
        <router-link to="/messages" class="btn btn-primary rounded-circle shadow-lg d-flex justify-content-center align-items-center position-relative widget-btn" style="background-color: #082b59; border: none;">
          <i class="bi bi-chat-dots-fill fs-4 text-white"></i>
          <span v-if="unreadMessages > 0 && route.path !== '/messages'" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow">{{ unreadMessages }}</span>
        </router-link>
      </div>

      <footer class="bg-dark text-white text-center py-5 mt-auto border-top border-4 border-warning">
        <div class="container">
          <div class="row justify-content-center mb-4">
            <div class="col-md-6 d-flex justify-content-center gap-4">
              <router-link to="/about" class="text-white text-decoration-none hover-warning fw-bold"><i class="bi bi-info-circle me-1"></i> About Us</router-link>
              <router-link to="/support" class="text-white text-decoration-none hover-warning fw-bold"><i class="bi bi-headset me-1"></i> Help & Support</router-link>
            </div>
          </div>
          <p class="mb-1 fw-black fs-5">NUM BAZAAR</p>
          <p class="mb-0 text-white-50 small">© {{ new Date().getFullYear() }} The Secure Campus Economy. All rights reserved.</p>
        </div>
      </footer>
      
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from './lib/supabaseClient'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const currentUser = ref(null)
const userRole = ref('buyer')
const userStatus = ref('active') // Default to active for guests
const cartCount = ref(0)

const unreadMessages = ref(0)
const ticketCount = ref(0)

// Appeal Logic
const appealText = ref('')
const isSubmittingAppeal = ref(false)
const hasAppealed = ref(false)

const closeMobileNavbar = () => {
  const navbarCollapse = document.getElementById('navbarNav')
  if (navbarCollapse && navbarCollapse.classList.contains('show')) {
    if (typeof bootstrap !== 'undefined') {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse, { toggle: false })
      bsCollapse.hide()
    } else {
      navbarCollapse.classList.remove('show')
    }
  }
}

const updateCartCount = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
    cartCount.value = cart.length
  } catch (e) { cartCount.value = 0 }
}

const fetchNotificationData = async () => {
  if (!currentUser.value || userStatus.value !== 'active') return;
  
  const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', currentUser.value.id).eq('is_read', false)
  unreadMessages.value = msgCount || 0

  if (userRole.value === 'admin') {
    const { count: tCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
    ticketCount.value = tCount || 0
  } else {
    const { count: tCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.value.id).eq('status', 'open')
    ticketCount.value = tCount || 0
  }
}

const checkAuthAndRole = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    currentUser.value = session.user
    // Fetch user status alongside role to enforce bans
    const { data: profile } = await supabase.from('profiles').select('role, status').eq('id', session.user.id).single()
    if (profile) {
      userRole.value = profile.role
      userStatus.value = profile.status || 'active'
    }
    fetchNotificationData()
  } else {
    currentUser.value = null
    userRole.value = 'buyer'
    userStatus.value = 'active' // Ensure guests aren't locked out
  }
}

const submitAppeal = async () => {
  if (!appealText.value.trim()) return;
  isSubmittingAppeal.value = true;
  try {
    await supabase.from('tickets').insert([{ 
      user_id: currentUser.value.id, 
      subject: `Account Appeal (${userStatus.value.toUpperCase()})`, 
      description: appealText.value 
    }])
    hasAppealed.value = true;
  } catch (error) {
    alert("Error submitting appeal. Please try again later.")
  } finally {
    isSubmittingAppeal.value = false;
  }
}

let notifInterval;

onMounted(() => {
  checkAuthAndRole()
  updateCartCount()
  window.addEventListener('storage', updateCartCount)
  
  const cartInterval = setInterval(updateCartCount, 1000)
  notifInterval = setInterval(fetchNotificationData, 5000) 

  supabase.auth.onAuthStateChange((event, session) => {
    checkAuthAndRole()
    if (event === 'SIGNED_OUT') {
      userStatus.value = 'active'
      router.push('/') 
    }
  })

  onUnmounted(() => {
    clearInterval(cartInterval)
    clearInterval(notifInterval)
    window.removeEventListener('storage', updateCartCount)
  })
})

const handleSignOut = async () => {
  closeMobileNavbar() 
  await supabase.auth.signOut()
  localStorage.removeItem('num_bazaar_cart') 
  updateCartCount()
  router.push('/') 
}
</script>

<style>
/* Import Inter Font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

/* GLOBAL NATIVE APP RESET */
:root {
  /* This ensures the app doesn't go under the Android status bar or iPhone notch */
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}

body { 
  background-color: #f8f9fa; 
  font-family: 'Inter', sans-serif; 
  
  /* Prevent the "pull-to-refresh" web browser bounce effect */
  overscroll-behavior-y: none; 
  
  /* Stop text from being accidentally highlighted when swiping */
  -webkit-user-select: none;
  user-select: none;
  
  /* Disable double-tap to zoom on mobile */
  touch-action: manipulation;
}

/* Re-enable text selection ONLY for inputs and textareas so users can type! */
input, textarea {
  -webkit-user-select: auto;
  user-select: auto;
}

/* Remove the ugly blue tap flash on Android webviews */
* {
  -webkit-tap-highlight-color: transparent;
}

/* UTILITY CLASSES */
.fw-black { font-weight: 900; }
.tracking-tight { letter-spacing: -0.05em; }

/* NAVBAR FIXES FOR ANDROID */
.navbar {
  padding-top: calc(10px + var(--safe-area-top)) !important;
}

/* FLOATING WIDGETS (Optimized for thumbs and avoiding bottom safe areas) */
.floating-widgets { 
  position: fixed; 
  bottom: calc(30px + var(--safe-area-bottom)); 
  right: 30px; 
  z-index: 1050; 
}

.widget-btn { 
  width: 60px; 
  height: 60px; 
  transition: transform 0.2s ease, box-shadow 0.2s ease; 
}

.widget-btn:active { 
  transform: scale(0.92); /* Native app "squish" effect when tapped */
}

@media (min-width: 992px) {
  .widget-btn:hover { 
    transform: translateY(-5px) scale(1.05); 
  }
}

/* MOBILE SPECIFIC TWEAKS */
@media (max-width: 768px) {
  .floating-widgets { 
    bottom: calc(20px + var(--safe-area-bottom)); 
    right: 20px; 
  }
  .widget-btn { 
    width: 55px; 
    height: 55px; 
  }
  .widget-btn i { 
    font-size: 1.3rem !important; 
  }
  
  /* Make cards stretch slightly more on small screens */
  .container {
    padding-left: 12px;
    padding-right: 12px;
  }
}

/* FOOTER STYLING */
.hover-warning { transition: color 0.2s; }
.hover-warning:hover { color: #ffc107 !important; }
</style>