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

      <div class="p-4 p-md-5 w-100 bg-white shadow" style="max-width: 500px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
        
        <div class="text-center mb-4">
          <div class="rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style="width: 50px; height: 50px; background-color: #e0e7ff; color: #3730a3;">
            <i class="bi bi-lock-fill fs-4"></i>
          </div>
          <h2 class="mb-1 fw-bold text-dark">NUM BAZAAR</h2>
          <p class="text-secondary small fw-medium">Secure access for the Newgate ecosystem.</p>
        </div>

        <div class="d-flex rounded-pill p-1 mb-4" style="background-color: #f3f4f6;">
          <button class="btn flex-grow-1 rounded-pill fw-bold" :style="isLogin ? 'background-color: white; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : 'color: #6b7280; border: none;'" @click="isLogin = true">Sign In</button>
          <button class="btn flex-grow-1 rounded-pill fw-bold" :style="!isLogin ? 'background-color: white; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : 'color: #6b7280; border: none;'" @click="isLogin = false">Create Account</button>
        </div>

        <form @submit.prevent="handleAuth">
          
          <div v-if="!isLogin" class="row g-3 mb-3">
            <div class="col-6">
              <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">First Name</label>
              <input type="text" v-model="firstName" class="form-control" placeholder="John" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;" :required="!isLogin">
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Last Name</label>
              <input type="text" v-model="lastName" class="form-control" placeholder="Doe" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;" :required="!isLogin">
            </div>
          </div>

          <div v-if="!isLogin" class="mb-3">
            <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Username</label>
            <div class="position-relative">
              <input type="text" v-model="username" class="form-control w-100" placeholder="student_99" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;" :required="!isLogin">
              <i class="bi bi-person position-absolute top-50 end-0 translate-middle-y me-3 text-secondary fs-5"></i>
            </div>
          </div>

          <div v-if="!isLogin" class="row g-3 mb-3">
            <div class="col-6">
              <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Account Type</label>
              <select v-model="accountType" class="form-select w-100" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;" :required="!isLogin">
                <option value="buyer">Buyer</option>
                <option value="seller">Vendor (Seller)</option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Affiliation</label>
              <select v-model="affiliation" class="form-select w-100" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;" :required="!isLogin">
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
                <option value="External">External</option>
              </select>
            </div>
          </div>

          <div v-if="!isLogin && affiliation === 'Student' && accountType === 'seller'" class="mb-3 bg-warning-subtle p-3 rounded-4 border border-warning">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="entCheck" v-model="isEnt211">
              <label class="form-check-label small fw-bold text-dark" for="entCheck">
                I am currently taking ENT211 (Entrepreneurship & Innovation)
              </label>
            </div>
            <p class="small text-secondary mb-0 mt-1" style="font-size: 0.75rem;"><i class="bi bi-gift-fill text-warning me-1"></i> Verify to unlock 3 months of free storefront subscription!</p>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Email Address</label>
            <div class="position-relative">
              <input type="email" v-model="email" class="form-control w-100" placeholder="student@newgate.edu" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;" required>
              <i class="bi bi-at position-absolute top-50 end-0 translate-middle-y me-3 text-secondary fs-5"></i>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="form-label small fw-bold text-uppercase d-flex justify-content-between w-100 text-dark" style="letter-spacing: 0.05em;">
              <span>Password</span>
              <span v-if="isLogin" @click="handlePasswordReset" style="color: #b22b1d; cursor:pointer; text-transform: none;">Forgot?</span>
            </label>
            <div class="position-relative">
              <input type="password" v-model="password" class="form-control w-100" placeholder="••••••••••••" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;" :required="!isResetting" minlength="6">
              <i class="bi bi-eye position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"></i>
            </div>
          </div>

          <div v-if="!isLogin" class="form-check mb-4 bg-light p-3 rounded-4 border">
            <input class="form-check-input ms-1 mt-1" type="checkbox" id="termsCheck" v-model="acceptedTerms" required>
            <label class="form-check-label small fw-medium text-secondary ms-2" for="termsCheck" style="line-height: 1.4;">
              I agree to the <router-link to="/terms" target="_blank" style="color: #082b59; font-weight: bold;">Terms and Conditions</router-link>, Escrow rules, and mandatory Identity Verification (KYC).
            </label>
          </div>

          <button type="submit" class="btn w-100 fs-6 py-3 mb-4 d-flex justify-content-center align-items-center gap-2" style="background-color: #b22b1d; color: white; border-radius: 999px; font-weight: 600; border: none;" :disabled="loading || (!isLogin && !acceptedTerms)">
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            {{ isLogin ? 'Join the Bazaar' : 'Register Account' }} <i class="bi bi-arrow-right"></i>
          </button>
        </form>
      </div>
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
const firstName = ref('')
const lastName = ref('')
const username = ref('')
const accountType = ref('buyer') 
const affiliation = ref('Student')
const isEnt211 = ref(false)
const acceptedTerms = ref(false)

const loading = ref(false)
const isResetting = ref(false)

const handleAuth = async () => {
  loading.value = true
  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (error) throw error
      router.push('/shop')
    } else {
      
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: email.value, 
        password: password.value 
      })
      if (authError) throw authError

      // 2. Logic for 3-Months Free (ENT211)
      let freeSubscriptionEnd = null;
      if (isEnt211.value && accountType.value === 'seller') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 90); // Add 90 days
        freeSubscriptionEnd = expiryDate.toISOString();
      }

      // 3. EXPLICITLY CREATE DATABASE PROFILE
      if (authData?.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          first_name: firstName.value,
          last_name: lastName.value,
          username: username.value,
          role: accountType.value,
          campus_affiliation: affiliation.value,
          is_ent211: isEnt211.value,
          subscription_ends_at: freeSubscriptionEnd, // Grants the 3 months if applicable
          business_name: ['seller', 'external'].includes(accountType.value) ? `${firstName.value}'s Store` : null
        }])
        
        if (profileError) {
          console.error("Database Profile Error: ", profileError)
          alert("Account created, but profile setup failed. Please contact support.")
        }
      }

      alert(isEnt211.value ? "Registration successful! Enjoy your 3 free months." : "Registration successful! Welcome to NUM BAZAAR.")
      router.push('/shop')
    }
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

const handlePasswordReset = async () => {
  if (!email.value) { alert("Please enter your Email address first."); return; }
  loading.value = true; isResetting.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, { redirectTo: `${window.location.origin}/auth` })
    if (error) throw error
    alert(`A password reset link has been sent to ${email.value}. Please check your inbox.`)
  } catch (error) { alert(error.message) } finally { loading.value = false; isResetting.value = false }
}
</script>