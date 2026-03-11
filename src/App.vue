<template>
  <div id="app" class="d-flex flex-column min-vh-100 bg-light">
    
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
            
            <li class="nav-item">
              <router-link to="/shop" class="nav-link fw-bold text-white" @click="closeMobileNavbar">
                <i class="bi bi-rss me-1"></i> Feed
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link to="/cart" class="nav-link fw-bold text-white position-relative" @click="closeMobileNavbar">
                <i class="bi bi-cart3 me-1"></i> Cart
                <span v-if="cartCount > 0" class="position-absolute top-25 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">
                  {{ cartCount }}
                </span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link to="/dashboard" class="nav-link fw-bold text-white" @click="closeMobileNavbar">
                <i class="bi bi-shop-window me-1"></i> Seller Hub
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link :to="`/profile/${currentUser.id}`" class="nav-link fw-bold text-white" @click="closeMobileNavbar">
                <i class="bi bi-person-circle me-1"></i> Profile
              </router-link>
            </li>

            <li class="nav-item" v-if="isAdmin">
              <router-link to="/admin" class="nav-link fw-bold" style="color: #ffc107;" @click="closeMobileNavbar">
                <i class="bi bi-shield-lock-fill me-1"></i> Admin
              </router-link>
            </li>

            <li class="nav-item ms-lg-3 mt-2 mt-lg-0">
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
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)
const isAdmin = ref(false)
const cartCount = ref(0)

// MOBILE NAVBAR FIX: Closes the hamburger menu when a link is clicked
const closeMobileNavbar = () => {
  const navbarCollapse = document.getElementById('navbarNav')
  const toggler = document.querySelector('.navbar-toggler')
  if (navbarCollapse && navbarCollapse.classList.contains('show') && toggler) {
    toggler.click()
  }
}

// Function to check cart items in LocalStorage
const updateCartCount = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
    cartCount.value = cart.length
  } catch (e) {
    cartCount.value = 0
  }
}

// Global Auth & Role Check
const checkAuthAndRole = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    currentUser.value = session.user
    
    // Fetch the user's role from the database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      
    // Set admin status
    if (profile && profile.role === 'admin') {
      isAdmin.value = true
    } else {
      isAdmin.value = false
    }
  } else {
    currentUser.value = null
    isAdmin.value = false
  }
}

onMounted(() => {
  checkAuthAndRole()
  updateCartCount()

  window.addEventListener('storage', updateCartCount)
  const cartInterval = setInterval(updateCartCount, 1000)

  supabase.auth.onAuthStateChange((event, session) => {
    checkAuthAndRole()
    if (event === 'SIGNED_OUT') {
      router.push('/') // Redirects to landing page on logout instead of auth
    }
  })

  onUnmounted(() => {
    clearInterval(cartInterval)
    window.removeEventListener('storage', updateCartCount)
  })
})

const handleSignOut = async () => {
  closeMobileNavbar() 
  await supabase.auth.signOut()
  localStorage.removeItem('num_bazaar_cart') 
  updateCartCount()
  router.push('/') // Go to landing page
}
</script>

<style>
/* Global App Styles */
body {
  background-color: #f8f9fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.fw-black { font-weight: 900; }
.tracking-tight { letter-spacing: -0.05em; }
</style>