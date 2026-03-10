<template>
  <header class="sticky-top shadow-sm" style="background-color: #082b59;">
    <nav class="navbar navbar-expand-lg navbar-dark container py-3">
      <RouterLink class="navbar-brand fw-bold fs-4 tracking-wide" to="/">NUM BAZAAR</RouterLink>
      
      <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        
        <form v-if="session" class="d-flex me-auto ms-lg-4 my-2 my-lg-0" style="max-width: 400px; width: 100%;">
          <div class="input-group input-group-sm">
            <input type="text" class="form-control border-0" placeholder="Search products, tags...">
            <button class="btn btn-light text-primary px-3" type="button"><i class="bi bi-search"></i></button>
          </div>
        </form>

        <ul class="navbar-nav align-items-center gap-3">
          <li class="nav-item"><RouterLink class="nav-link text-white fw-semibold" to="/shop"><i class="bi bi-shop me-1"></i> Feed</RouterLink></li>
          
          <li class="nav-item">
            <RouterLink class="nav-link text-white fw-semibold position-relative pe-3" to="/cart">
              <i class="bi bi-cart3 fs-5"></i>
              <span class="position-absolute top-10 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.7em;">Cart</span>
            </RouterLink>
          </li>
          
          <li class="nav-item" v-if="session && (userRole === 'seller' || userRole === 'admin')">
            <RouterLink class="nav-link text-white fw-semibold" to="/dashboard"><i class="bi bi-wallet2 me-1"></i> Seller Hub</RouterLink>
          </li>
          
          <li class="nav-item" v-if="session && userId">
            <RouterLink class="nav-link text-white fw-semibold" :to="`/profile/${userId}`"><i class="bi bi-person-circle me-1"></i> Profile</RouterLink>
          </li>
          
          <li class="nav-item ms-lg-2" v-if="userRole === 'admin'">
            <RouterLink class="nav-link text-warning fw-bold" to="/admin"><i class="bi bi-shield-lock-fill me-1"></i> Admin</RouterLink>
          </li>
          
          <li class="nav-item ms-lg-3" v-if="!session">
            <RouterLink class="btn btn-light text-primary btn-sm fw-bold px-4 rounded-pill" to="/auth">Sign In</RouterLink>
          </li>
          
          <li class="nav-item ms-lg-3" v-if="session">
            <button @click="handleLogout" class="btn btn-outline-light btn-sm fw-bold px-3 rounded-pill"><i class="bi bi-box-arrow-right me-1"></i> Sign Out</button>
          </li>
        </ul>
      </div>
    </nav>
  </header>
  <main class="min-vh-100 pt-4 pb-5 bg-light"><RouterView /></main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabaseClient'

const router = useRouter()
const session = ref(null)
const userRole = ref('')
const userId = ref(null)

const fetchRole = async (id) => {
  const { data } = await supabase.from('profiles').select('role').eq('id', id).single()
  if (data) userRole.value = data.role
}

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
    if (data.session) { userId.value = data.session.user.id; fetchRole(userId.value) }
  })
  supabase.auth.onAuthStateChange((_event, _session) => {
    session.value = _session
    if (_session) { userId.value = _session.user.id; fetchRole(userId.value) } 
    else { userRole.value = ''; userId.value = null }
  })
})

const handleLogout = async () => { await supabase.auth.signOut(); router.push('/auth') }
</script>

<style>
body { background-color: #f8f9fa; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
.navbar-brand { letter-spacing: 1px; }
</style>