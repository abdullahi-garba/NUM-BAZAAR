<template>
  <div id="app" class="min-vh-100 d-flex flex-column">
    
    <nav v-if="currentUser" class="navbar sticky-top py-3 px-4 d-none d-lg-flex shadow-sm" style="background-color: #082b59; z-index: 1050; border: none;">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        
        <router-link to="/shop" class="d-flex align-items-center text-decoration-none">
          <i class="bi bi-mortarboard-fill fs-4 me-2 text-white"></i>
          <span style="font-weight: 900; font-size: 1.4rem; letter-spacing: -0.05em; color: #ffffff; font-style: italic;">NUM BAZAAR</span>
        </router-link>
        
        <div class="d-flex align-items-center gap-4">
          <router-link to="/shop" class="nav-link-stitch" active-class="nav-active">Feed</router-link>
          <router-link to="/dashboard" class="nav-link-stitch" active-class="nav-active" v-if="['seller', 'admin'].includes(userRole)">Post</router-link>
          <router-link :to="`/profile/${currentUser.id}`" class="nav-link-stitch" active-class="nav-active">Profile</router-link>
          <router-link to="/messages" class="nav-link-stitch" active-class="nav-active">Messages</router-link>
          <router-link to="/cart" class="nav-link-stitch" active-class="nav-active">Cart</router-link>
          <router-link to="/about" class="nav-link-stitch" active-class="nav-active">About</router-link>
          
          <router-link v-if="userRole === 'admin'" to="/admin" class="nav-link-stitch text-warning fw-bold position-relative" active-class="nav-active" style="letter-spacing: 0.05em;">
            <i class="bi bi-shield-lock-fill me-1"></i> Admin
            <span v-if="adminAlerts > 0" class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
          </router-link>
        </div>
        
        <div class="d-flex align-items-center gap-4">
          <router-link to="/notifications" class="text-white position-relative text-decoration-none">
            <i class="bi bi-bell-fill fs-5"></i>
            <span v-if="bellCount > 0" class="position-absolute translate-middle badge rounded-pill" style="background-color: #b22b1d; top: 0px; left: 15px; font-size: 0.6rem; color: white;">{{ bellCount }}</span>
          </router-link>

          <router-link to="/cart" class="text-white position-relative text-decoration-none">
            <i class="bi bi-cart3 fs-5"></i>
            <span v-if="cartCount > 0" class="position-absolute translate-middle badge rounded-pill" style="background-color: #b22b1d; top: 0px; left: 15px; font-size: 0.6rem; color: white;">{{ cartCount }}</span>
          </router-link>
          
          <div class="d-flex align-items-center gap-3 border-start ps-4" style="border-color: rgba(255,255,255,0.2) !important;">
            <router-link :to="`/profile/${currentUser.id}`" class="text-decoration-none">
              <img :src="`https://ui-avatars.com/api/?name=${currentUser.email || 'User'}&background=ffffff&color=082b59`" class="rounded-circle cursor-pointer border border-2 border-white object-fit-cover shadow-sm" width="35" height="35" title="My Profile">
            </router-link>

            <button @click="handleSignOut" class="btn btn-sm rounded-pill fw-bold px-3 signout-btn" style="background-color: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); transition: all 0.2s;">
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </nav>

    <nav v-if="currentUser" class="navbar sticky-top px-3 py-2 d-lg-none shadow-sm" style="background-color: #082b59; z-index: 1050;">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <router-link to="/shop" class="d-flex align-items-center text-decoration-none">
          <i class="bi bi-mortarboard-fill fs-5 me-2 text-white"></i>
          <span style="font-weight: 900; font-size: 1.2rem; letter-spacing: -0.05em; color: #ffffff; font-style: italic;">NUM BAZAAR</span>
        </router-link>
        
        <div class="d-flex align-items-center gap-3">
          <router-link to="/notifications" class="text-white text-decoration-none position-relative me-2">
            <i class="bi bi-bell-fill fs-5"></i>
            <span v-if="bellCount > 0" class="position-absolute translate-middle badge rounded-pill" style="background-color: #b22b1d; top: 0px; left: 15px; font-size: 0.5rem; color: white; padding: 3px 5px;">{{ bellCount }}</span>
          </router-link>
          
          <button @click="handleSignOut" class="btn btn-sm text-white-50 p-0 border-0" title="Sign Out">
            <i class="bi bi-box-arrow-right fs-5"></i>
          </button>
        </div>
      </div>
    </nav>

    <div v-if="currentUser" class="bottom-nav d-lg-none shadow-lg bg-white" style="position: fixed; bottom: 0; left: 0; right: 0; height: 70px; z-index: 1060; border-top: 1px solid rgba(0,0,0,0.05);">
      <div class="d-flex justify-content-around align-items-center h-100 px-2">
        <router-link to="/shop" class="nav-item text-center text-decoration-none" active-class="active-bottom-tab" style="color: #6b7280; flex: 1;">
          <i class="bi bi-grid-fill fs-4 d-block mb-1"></i>
          <span class="d-block fw-bold text-uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">Feed</span>
        </router-link>
        
        <router-link to="/cart" class="nav-item text-center text-decoration-none position-relative" active-class="active-bottom-tab" style="color: #6b7280; flex: 1;">
          <i class="bi bi-cart-fill fs-4 d-block mb-1"></i>
          <span class="d-block fw-bold text-uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">Cart</span>
          <span v-if="cartCount > 0" class="position-absolute badge rounded-pill" style="background-color: #b22b1d; color: white; top: -2px; right: 15px; font-size: 0.6rem;">{{ cartCount }}</span>
        </router-link>

        <router-link v-if="['seller', 'admin'].includes(userRole)" to="/dashboard" class="nav-item text-center text-decoration-none" active-class="active-bottom-tab" style="color: #6b7280; flex: 1;">
          <i class="bi bi-plus-circle-fill fs-4 d-block mb-1"></i>
          <span class="d-block fw-bold text-uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">Post</span>
        </router-link>

        <router-link to="/messages" class="nav-item text-center text-decoration-none" active-class="active-bottom-tab" style="color: #6b7280; flex: 1;">
          <i class="bi bi-chat-dots-fill fs-4 d-block mb-1"></i>
          <span class="d-block fw-bold text-uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">Chat</span>
        </router-link>

        <router-link v-if="userRole === 'admin'" to="/admin" class="nav-item text-center text-decoration-none position-relative" active-class="active-bottom-tab" style="color: #6b7280; flex: 1;">
          <i class="bi bi-shield-lock-fill fs-4 d-block mb-1"></i>
          <span v-if="adminAlerts > 0" class="position-absolute p-1 bg-danger border border-light rounded-circle" style="top: 5px; right: 20px;"></span>
          <span class="d-block fw-bold text-uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">Admin</span>
        </router-link>

        <router-link :to="`/profile/${currentUser.id}`" class="nav-item text-center text-decoration-none" active-class="active-bottom-tab" style="color: #6b7280; flex: 1;">
          <i class="bi bi-person-circle fs-4 d-block mb-1"></i>
          <span class="d-block fw-bold text-uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">Profile</span>
        </router-link>
      </div>
    </div>

    <router-link v-if="currentUser" to="/support" class="btn rounded-circle shadow-lg d-flex justify-content-center align-items-center support-fab" title="Need Help?">
      <i class="bi bi-headset fs-3 text-white"></i>
    </router-link>

    <main class="flex-grow-1" :style="currentUser ? 'padding-bottom: 80px;' : ''">
      <router-view />
    </main>

    <footer v-if="currentUser" class="global-footer pt-5 pb-4" style="background-color: #082b59; margin-top: auto;">
      <div class="container">
        <div class="row g-4 mb-4">
          <div class="col-lg-4 text-center text-lg-start">
            <h4 class="text-white fw-black fst-italic mb-3" style="letter-spacing: -0.05em;">NUM BAZAAR</h4>
            <p class="small text-white-50 fw-medium mb-0" style="line-height: 1.6;">
              The exclusive marketplace for Newgate University. Verified, Secured, and Student-First since 2024.
            </p>
          </div>
          <div class="col-6 col-lg-2 offset-lg-2">
            <h6 class="text-white fw-bold mb-3 small text-uppercase" style="letter-spacing: 0.05em;">Marketplace</h6>
            <ul class="list-unstyled small text-white-50 fw-medium d-flex flex-column gap-2">
              <li>Textbook Exchange</li><li>Dorm Essentials</li><li>Tech & Gadgets</li>
            </ul>
          </div>
          <div class="col-6 col-lg-2">
            <h6 class="text-white fw-bold mb-3 small text-uppercase" style="letter-spacing: 0.05em;">Institution</h6>
            <ul class="list-unstyled small text-white-50 fw-medium d-flex flex-column gap-2">
              <li>University Policy</li><li>Safety Guidelines</li><li>Student Discounts</li>
            </ul>
          </div>
          <div class="col-6 col-lg-2">
            <h6 class="text-white fw-bold mb-3 small text-uppercase" style="letter-spacing: 0.05em;">Support</h6>
            <ul class="list-unstyled small text-white-50 fw-medium d-flex flex-column gap-2">
              <li><router-link to="/terms" class="text-white-50 text-decoration-none">Terms & Conditions</router-link></li>
              <li><router-link to="/support" class="text-white-50 text-decoration-none">Submit a Ticket</router-link></li>
            </ul>
          </div>
        </div>
        <div class="border-top pt-4 mt-4 d-flex flex-column flex-md-row justify-content-between align-items-center text-white-50 small fw-medium" style="border-color: rgba(255,255,255,0.1) !important;">
          <span class="mb-3 mb-md-0 text-center">&copy; 2026 NEWGATE UNIVERSITY MARKETPLACE. ALL RIGHTS RESERVED.</span>
          <div class="d-flex gap-4">
            <span><i class="bi bi-shield-check me-1"></i> VERIFIED SECURE</span>
            <span><i class="bi bi-lock-fill me-1"></i> SSL PROTECTION</span>
          </div>
        </div>
      </div>
    </footer>

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
const adminAlerts = ref(0)
const bellCount = ref(0) 

const updateCartCount = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
    cartCount.value = cart.length
  } catch (e) { cartCount.value = 0 }
}

const fetchRoleAndAlerts = async (userId) => {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (data) {
    userRole.value = data.role
    if (data.role === 'admin') {
      const { count: kycCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).not('id_card_url', 'is', null).eq('is_verified', false)
      const { count: ticketCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
      const { count: payoutCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'debit').eq('status', 'Pending')
      adminAlerts.value = (kycCount || 0) + (ticketCount || 0) + (payoutCount || 0)
    }
  }

  const { count: unreadNotes } = await supabase.from('in_app_notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)
  bellCount.value = unreadNotes || 0
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    currentUser.value = session.user
    await fetchRoleAndAlerts(session.user.id)
  }
  
  updateCartCount()
  window.addEventListener('storage', updateCartCount)
  window.addEventListener('notifications_read', () => { bellCount.value = 0 })
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    currentUser.value = session?.user || null
    if (session?.user) {
      await fetchRoleAndAlerts(session.user.id)
    } else {
      userRole.value = 'buyer'
      adminAlerts.value = 0
      bellCount.value = 0
    }
    if (event === 'SIGNED_OUT') router.push('/auth')
  })
})

const handleSignOut = async () => {
  await supabase.auth.signOut()
  localStorage.removeItem('num_bazaar_cart')
}
</script>

<style scoped>
.nav-link-stitch {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.2s;
  padding-bottom: 2px;
}

.nav-link-stitch:hover { color: #ffffff; }
.nav-active { color: #ffffff !important; font-weight: 700; border-bottom: 2px solid #ffffff; }
.nav-item { transition: transform 0.2s ease, color 0.2s ease; }
.active-bottom-tab { color: #082b59 !important; transform: translateY(-2px); }

.signout-btn:hover {
  background-color: rgba(255,255,255,0.2) !important;
  color: white !important;
}

.support-fab {
  position: fixed;
  width: 60px;
  height: 60px;
  background-color: #b22b1d;
  color: white;
  right: 25px;
  bottom: 25px;
  z-index: 1040;
  transition: transform 0.2s ease;
  border: none;
}
.support-fab:hover { transform: scale(1.08); }

@media (max-width: 991px) {
  .support-fab {
    bottom: 95px; 
    right: 20px;
    width: 55px;
    height: 55px;
  }
  .global-footer {
    padding-bottom: 90px !important;
  }
}
</style>