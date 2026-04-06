<template>
  <div class="min-vh-100 d-flex justify-content-center align-items-center">
    <div class="card-vanguard p-5 w-100" style="max-width: 480px;">
      
      <div class="text-center mb-5">
        <div class="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style="width: 60px; height: 60px;">
          <i class="bi bi-shield-lock-fill fs-3" style="color: var(--primary);"></i>
        </div>
        <h1 class="text-900 mb-2">Academic Vanguard</h1>
        <p class="text-500 text-muted">Secure access for Newgate University members.</p>
      </div>

      <div class="d-flex bg-light rounded-pill p-1 mb-4">
        <button class="btn flex-grow-1 rounded-pill fw-bold" :class="isLogin ? 'bg-white shadow-sm text-dark' : 'text-muted border-0'" @click="isLogin = true">Sign In</button>
        <button class="btn flex-grow-1 rounded-pill fw-bold" :class="!isLogin ? 'bg-white shadow-sm text-dark' : 'text-muted border-0'" @click="isLogin = false">Create Account</button>
      </div>

      <form @submit.prevent="handleAuth">
        <div class="mb-3">
          <label class="form-label text-600 small text-uppercase letter-spacing">University Email</label>
          <input type="email" v-model="email" class="form-control input-vanguard w-100" placeholder="student.name@newgate.edu" required>
        </div>
        
        <div class="mb-4">
          <label class="form-label text-600 small text-uppercase letter-spacing d-flex justify-content-between">
            Password <span v-if="isLogin" class="text-danger" style="cursor:pointer">Forgot?</span>
          </label>
          <input type="password" v-model="password" class="form-control input-vanguard w-100" placeholder="••••••••••••" required>
        </div>

        <button type="submit" class="btn btn-pill btn-oxblood w-100 fs-5 mb-3 d-flex justify-content-center align-items-center gap-2" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm"></span>
          {{ isLogin ? 'Enter the Bazaar' : 'Register ID' }} <i class="bi bi-arrow-right"></i>
        </button>
      </form>

      <div class="text-center mt-4">
        <AcademicBadge icon="bi-shield-check" variant="default" class="me-2">Encrypted</AcademicBadge>
        <AcademicBadge icon="bi-bank" variant="default">Verified Member</AcademicBadge>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'
import AcademicBadge from '../components/AcademicBadge.vue'

const router = useRouter()
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleAuth = async () => {
  loading.value = true
  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (error) throw error
    } else {
      const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
      if (error) throw error
      alert("Registration successful. Check your email.")
    }
    router.push('/shop')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.letter-spacing { letter-spacing: 0.05em; color: #6c757d; }
</style>