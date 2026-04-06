<template>
  <div id="app" class="d-flex flex-column min-vh-100 position-relative">
    
    <nav v-if="currentUser" class="navbar sticky-top nav-glass d-none d-lg-flex py-3">
      <div class="container d-flex justify-content-between align-items-center">
        <router-link class="brand-anchor" to="/shop">NUM BAZAAR</router-link>
        
        <div class="d-flex align-items-center gap-4">
          <router-link to="/shop" class="nav-item-vanguard" active-class="active-tab">Feed</router-link>
          <router-link to="/dashboard" class="nav-item-vanguard" active-class="active-tab" v-if="['seller', 'admin'].includes(userRole)">Seller Hub</router-link>
          <router-link :to="`/profile/${currentUser.id}`" class="nav-item-vanguard" active-class="active-tab">Profile</router-link>
          
          <router-link to="/cart" class="nav-item-vanguard position-relative" active-class="active-tab">
            Cart
            <span v-if="cartCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;">{{ cartCount }}</span>
          </router-link>
          
          <button @click="handleSignOut" class="btn btn-pill btn-primary-vanguard btn-sm ms-3">Sign Out</button>
        </div>
      </div>
    </nav>

    <main class="flex-grow-1 container py-4 py-lg-5">
      <router-view />
    </main>

    <div v-if="currentUser" class="bottom-nav d-lg-none shadow-lg">
      <div class="d-flex justify-content-around align-items-center h-100">
        <router-link to="/shop" class="nav-item text-center text-decoration-none" active-class="active-bottom-tab">
          <i class="bi bi-house-door-fill fs-4 d-block mb-1"></i>
          <span class="d-block" style="font-size: 0.7rem; font-weight: 600;">Home</span>
        </router-link>
        
        <router-link to="/cart" class="nav-item text-center text-decoration-none position-relative" active-class="active-bottom-tab">
          <i class="bi bi-cart-fill fs-4 d-block mb-1"></i>
          <span class="d-block" style="font-size: 0.7rem; font-weight: 600;">Cart</span>
          <span v-if="cartCount > 0" class="position-absolute badge rounded-pill" style="background-color: var(--secondary); top: 0; right: 10px; font-size: 0.6rem;">{{ cartCount }}</span>
        </router-link>

        <router-link v-if="userRole === 'seller'" to="/dashboard" class="nav-item text-center text-decoration-none" active-class="active-bottom-tab">
          <i class="bi bi-shop-window fs-4 d-block mb-1"></i>
          <span class="d-block" style="font-size: 0.7rem; font-weight: 600;">Hub</span>
        </router-link>

        <router-link :to="`/profile/${currentUser.id}`" class="nav-item text-center text-decoration-none" active-class="active-bottom-tab">
          <i class="bi bi-person-circle fs-4 d-block mb-1"></i>
          <span class="d-block" style="font-size: 0.7rem; font-weight: 600;">Profile</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)
const userRole = ref('buyer')
const cartCount = ref(0)

const updateCartCount = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
    cartCount.value = cart.length
  } catch (e) { cartCount.value = 0 }
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    currentUser.value = session.user
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (data) userRole.value = data.role
  }
  updateCartCount()
  window.addEventListener('storage', updateCartCount)
  
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser.value = session?.user || null
    if (event === 'SIGNED_OUT') router.push('/auth')
  })
})

const handleSignOut = async () => {
  await supabase.auth.signOut()
  localStorage.removeItem('num_bazaar_cart')
}
</script>

<style scoped>
.nav-glass {
  background: rgba(248, 249, 250, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 4px 32px rgba(0, 23, 55, 0.05);
  padding-top: calc(15px + var(--safe-area-top));
}

.brand-anchor {
  font-weight: 900;
  font-size: 1.6rem;
  color: var(--primary);
  letter-spacing: -0.06em;
  text-decoration: none;
}

.nav-item-vanguard {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--primary);
  text-decoration: none;
  opacity: 0.6;
  padding-bottom: 0.25rem;
  transition: opacity 0.2s;
}

.nav-item-vanguard:hover { opacity: 1; }

.active-tab {
  opacity: 1;
  border-bottom: 3px solid var(--secondary); /* Oxblood active state */
}

/* Mobile Bottom Nav */
@media (max-width: 991px) {
  main { padding-bottom: calc(90px + var(--safe-area-bottom)) !important; }
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(70px + var(--safe-area-bottom));
  background-color: var(--surface-card);
  z-index: 1060;
  padding-bottom: var(--safe-area-bottom);
  border-top: 1px solid rgba(0,0,0,0.05); /* Only subtle line allowed */
}

.bottom-nav .nav-item {
  flex: 1;
  color: #a0aab5;
  transition: color 0.2s ease, transform 0.2s ease;
}

.bottom-nav .active-bottom-tab {
  color: var(--secondary) !important; /* Oxblood active icon */
  transform: translateY(-2px);
}
</style>