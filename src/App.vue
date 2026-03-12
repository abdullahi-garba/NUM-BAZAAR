<template>
  <div id="app" class="d-flex flex-column min-vh-100 bg-light position-relative">
    
    <nav v-if="currentUser" class="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" style="background-color: #082b59;">
      <div class="container">
        
        <router-link class="navbar-brand fw-black fs-4 tracking-tight" to="/shop" @click="closeMobileNavbar">
          NUM BAZAAR
        </router-link>

        <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center gap-3 py-3 py-lg-0">
            
            <li class="nav-item w-100 text-center text-lg-start">
              <router-link to="/shop" class="nav-link fw-bold text-white" @click="closeMobileNavbar">
                <i class="bi bi-rss me-1"></i> Feed
              </router-link>
            </li>
            
            <li class="nav-item w-100 text-center text-lg-start">
              <router-link to="/cart" class="nav-link fw-bold text-white position-relative" @click="closeMobileNavbar">
                <i class="bi bi-cart3 me-1"></i> Cart
                <span v-if="cartCount > 0" class="position-absolute top-25 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">
                  {{ cartCount }}
                </span>
              </router-link>
            </li>
            
            <li class="nav-item w-100 text-center text-lg-start" v-if="['seller', 'admin'].includes(userRole)">
              <router-link to="/dashboard" class="nav-link fw-bold text-white" @click="closeMobileNavbar">
                <i class="bi bi-shop-window me-1"></i> Seller Hub
              </router-link>
            </li>
            
            <li class="nav-item w-100 text-center text-lg-start">
              <router-link :to="`/profile/${currentUser.id}`" class="nav-link fw-bold text-white" @click="closeMobileNavbar">
                <i class="bi bi-person-circle me-1"></i> Profile
              </router-link>
            </li>

            <li class="nav-item w-100 text-center text-lg-start" v-if="userRole === 'admin'">
              <router-link to="/admin" class="nav-link fw-bold" style="color: #ffc107;" @click="closeMobileNavbar">
                <i class="bi bi-shield-lock-fill me-1"></i> Admin
              </router-link>
            </li>

            <li class="nav-item ms-lg-3 mt-2 mt-lg-0 w-100">
              <button @click="handleSignOut" class="btn btn-outline-light btn-sm fw-bold rounded-pill px-4 py-2 w-100">
                <i class="bi bi-box-arrow-right me-1"></i> Sign Out
              </button>
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

    <footer class="bg-dark text-white text-center py-4 mt-auto">
      <div class="container">
        <p class="mb-0 fw-bold">© {{ new Date().getFullYear() }} NUM BAZAAR. All rights reserved.</p>
        <small class="text-white-50">The Secure Campus Economy</small>
      </div>
    </footer>
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
const cartCount = ref(0)

const unreadMessages = ref(0)
const ticketCount = ref(0)

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
  } catch (e) {
    cartCount.value = 0
  }
}

const fetchNotificationData = async () => {
  if (!currentUser.value) return;
  
  const { count: msgCount } = await supabase.from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', currentUser.value.id)
    .eq('is_read', false)
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
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (profile) userRole.value = profile.role
    fetchNotificationData()
  } else {
    currentUser.value = null
    userRole.value = 'buyer'
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
    if (event === 'SIGNED_OUT') router.push('/') 
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
body { background-color: #f8f9fa; font-family: 'Inter', sans-serif; }
.fw-black { font-weight: 900; }
.tracking-tight { letter-spacing: -0.05em; }

.floating-widgets {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1050;
}
.widget-btn {
  width: 60px;
  height: 60px;
  transition: transform 0.2s ease;
}
.widget-btn:hover {
  transform: translateY(-5px) scale(1.05);
}
@media (max-width: 768px) {
  .floating-widgets { bottom: 20px; right: 20px; }
  .widget-btn { width: 50px; height: 50px; }
  .widget-btn i { font-size: 1.2rem !important; }
}
</style>