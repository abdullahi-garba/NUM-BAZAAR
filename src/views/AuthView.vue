<template>
  <div class="min-vh-100 d-flex flex-column" style="background: url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000') center/cover no-repeat;">
    
    <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-3" style="background-color: rgba(248, 249, 250, 0.9);">
      
      <div class="position-absolute top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center d-none d-md-flex">
        <div class="d-flex align-items-center">
          <i class="bi bi-mortarboard-fill fs-4 me-2 text-dark"></i>
          <span style="font-weight: 900; font-size: 1.2rem; font-style: italic;">NUM BAZAAR</span>
        </div>
        <span class="text-secondary small fw-medium">Newgate University Digital Marketplace</span>
      </div>

      <div class="p-4 p-md-5 w-100 bg-white" style="max-width: 460px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        
        <div class="text-center mb-4">
          <div class="rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style="width: 50px; height: 50px; background-color: #e0e7ff; color: #3730a3;">
            <i class="bi bi-lock-fill fs-4"></i>
          </div>
          <h2 class="mb-1 fw-bold text-dark">NUM BAZAAR</h2>
          <p class="text-secondary small fw-medium">Secure access for Newgate University members.</p>
        </div>

        <div class="d-flex rounded-pill p-1 mb-4" style="background-color: #f3f4f6;">
          <button class="btn flex-grow-1 rounded-pill fw-bold" :style="isLogin ? 'background-color: white; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : 'color: #6b7280; border: none;'" @click="isLogin = true">Sign In</button>
          <button class="btn flex-grow-1 rounded-pill fw-bold" :style="!isLogin ? 'background-color: white; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : 'color: #6b7280; border: none;'" @click="isLogin = false">Create Account</button>
        </div>

        <form @submit.prevent="handleAuth">
          <div class="mb-3">
            <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">University Email</label>
            <div class="position-relative">
              <input type="email" v-model="email" class="form-control w-100" placeholder="student.name@newgate.edu" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;" required>
              <i class="bi bi-at position-absolute top-50 end-0 translate-middle-y me-3 text-secondary fs-5"></i>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="form-label small fw-bold text-uppercase d-flex justify-content-between w-100 text-dark" style="letter-spacing: 0.05em;">
              <span>Password</span>
              <span v-if="isLogin" @click="handlePasswordReset" style="color: #b22b1d; cursor:pointer; text-transform: none;">Forgot?</span>
            </label>
            <div class="position-relative">
              <input type="password" v-model="password" class="form-control w-100" placeholder="••••••••••••" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;" :required="!isResetting">
              <i class="bi bi-eye position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"></i>
            </div>
          </div>

          <button type="submit" class="btn w-100 fs-6 py-3 mb-4 d-flex justify-content-center align-items-center gap-2" style="background-color: #b22b1d; color: white; border-radius: 999px; font-weight: 600; border: none;" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            {{ isLogin ? 'Join the Bazaar' : 'Register Account' }} <i class="bi bi-arrow-right"></i>
          </button>
        </form>

        <div class="text-center d-flex justify-content-center gap-3">
          <span class="small text-secondary fw-bold" style="font-size: 0.7rem;"><i class="bi bi-shield-check text-primary me-1"></i> ENCRYPTED</span>
          <span class="small text-secondary fw-bold" style="font-size: 0.7rem;"><i class="bi bi-bank text-primary me-1"></i> VERIFIED MEMBER</span>
        </div>
      </div>
      
      <p class="text-secondary small mt-4 text-center fw-medium">By signing in, you agree to the <strong class="text-dark">Marketplace Conduct Code</strong> and <strong class="text-dark">Privacy Charter</strong>.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)
const isResetting = ref(false)

const handleAuth = async () => {
  loading.value = true
  try {
    if (isLogin.value) {
      // Standard Login
      const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (error) throw error
      router.push('/shop')
    } else {
      // Registration (Now instantly logs them in since confirmation is disabled)
      const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
      if (error) throw error
      
      // Removed the "Check your email" alert. 
      // User is instantly routed to the feed.
      router.push('/shop')
    }
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

const handlePasswordReset = async () => {
  if (!email.value) {
    alert("Please enter your University Email address first.")
    return
  }
  
  loading.value = true
  isResetting.value = true
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/auth`,
    })
    if (error) throw error
    alert(`A password reset link has been sent to ${email.value}. Please check your inbox.`)
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
    isResetting.value = false
  }
}
</script>