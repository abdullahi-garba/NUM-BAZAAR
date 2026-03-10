<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center bg-light p-0">
    <div class="row g-0 w-100 shadow-lg min-vh-100 min-vh-md-auto mx-md-5 my-md-5 rounded-md-5 overflow-hidden bg-white">
      
      <div class="col-lg-5 d-none d-lg-flex flex-column justify-content-center align-items-center p-5 text-white position-relative" style="background: linear-gradient(135deg, #082b59 0%, #1a1a1a 100%);">
        <div class="z-1 text-center">
          <h1 class="display-3 fw-black tracking-tight mb-3">NUM BAZAAR</h1>
          <p class="lead fw-normal opacity-75 mb-5">The ultimate campus marketplace. Buy, sell, and connect safely with escrow protection.</p>
          <div class="d-flex gap-3 justify-content-center opacity-50"><i class="bi bi-shield-check fs-1"></i><i class="bi bi-wallet2 fs-1"></i><i class="bi bi-shop fs-1"></i></div>
        </div>
      </div>

      <div class="col-lg-7 p-4 p-md-5 d-flex flex-column justify-content-center" style="max-height: 100vh; overflow-y: auto;">
        <div class="w-100 mx-auto" style="max-width: 550px;">
          <div class="text-center mb-4">
            <h2 class="fw-bold mb-1" style="color: #082b59;">{{ isLogin ? 'Welcome Back' : 'Create an Account' }}</h2>
            <p class="text-muted">{{ isLogin ? 'Sign in to access your wallet and orders.' : 'Join the safest marketplace on campus.' }}</p>
          </div>

          <div class="d-flex gap-2 mb-4">
            <button @click="signInWithProvider('google')" class="btn btn-outline-dark w-50 fw-semibold rounded-3 py-2"><i class="bi bi-google me-2 text-danger"></i> Google</button>
            <button @click="signInWithProvider('apple')" class="btn btn-outline-dark w-50 fw-semibold rounded-3 py-2"><i class="bi bi-apple me-2"></i> Apple</button>
          </div>
          
          <div class="d-flex align-items-center mb-4"><hr class="flex-grow-1"><span class="mx-3 text-muted small fw-bold">OR EMAIL</span><hr class="flex-grow-1"></div>

          <form @submit.prevent="handleAuth">
            <div v-if="!isLogin" class="registration-scroll-area pe-2 mb-4">
              <div class="card border-0 bg-light rounded-4 p-3 mb-3">
                <h6 class="fw-bold text-primary mb-3"><i class="bi bi-person-lock me-2"></i>Identity (KYC)</h6>
                <div class="row g-2">
                  <div class="col-md-6"><input type="text" class="form-control" v-model="form.firstName" placeholder="First Name" required></div>
                  <div class="col-md-6"><input type="text" class="form-control" v-model="form.lastName" placeholder="Last Name" required></div>
                  <div class="col-md-6"><input type="text" class="form-control" v-model="form.username" placeholder="@username" required></div>
                  <div class="col-md-6"><input type="date" class="form-control" v-model="form.dob" required></div>
                  <div class="col-12"><input type="text" class="form-control" v-model="form.whatsapp" placeholder="WhatsApp Number" required></div>
                </div>
              </div>

              <div class="card border-0 bg-light rounded-4 p-3 mb-3">
                <h6 class="fw-bold text-primary mb-3"><i class="bi bi-building-check me-2"></i>Campus Profile</h6>
                <div class="row g-2">
                  <div class="col-md-6"><select class="form-select" v-model="form.role" required><option value="buyer">Buy</option><option value="seller">Sell & Buy</option></select></div>
                  <div class="col-md-6"><select class="form-select" v-model="form.campus" required><option value="Student">Student</option><option value="Staff">Staff</option><option value="External">External</option></select></div>
                  <div class="col-12"><label class="form-label small fw-bold text-muted mb-1">Profile Picture</label><input type="file" class="form-control form-control-sm" @change="e => profilePic = e.target.files[0]" accept="image/*"></div>
                </div>
              </div>

              <div v-if="form.role === 'seller'" class="card border-0 bg-primary-subtle rounded-4 p-3 mb-3">
                <h6 class="fw-bold text-primary mb-3"><i class="bi bi-shop me-2"></i>Business Setup</h6>
                <div class="row g-2">
                  <div class="col-md-6"><input type="text" class="form-control" v-model="form.businessName" placeholder="Business Name" required></div>
                  <div class="col-md-6"><select class="form-select" v-model="form.businessSector" required><option value="Food & Beverages">Food</option><option value="IT & Tech">Tech</option><option value="Fashion & Clothing">Fashion</option><option value="Other">Other</option></select></div>
                  <div class="col-12"><textarea class="form-control" v-model="form.businessDesc" rows="2" placeholder="Description" required></textarea></div>
                  <div class="col-12"><label class="form-label small fw-bold text-muted mb-1">Cover Photo</label><input type="file" class="form-control form-control-sm" @change="e => coverPic = e.target.files[0]" accept="image/*"></div>
                </div>
              </div>
            </div>

            <div class="form-floating mb-3"><input type="email" class="form-control rounded-3" id="floatingEmail" v-model="form.email" placeholder="name@example.com" required><label for="floatingEmail">Email address</label></div>
            <div class="form-floating mb-4"><input type="password" class="form-control rounded-3" id="floatingPassword" v-model="form.password" placeholder="Password" minlength="6" required><label for="floatingPassword">Password</label></div>

            <button type="submit" class="btn btn-primary w-100 fw-bold py-3 rounded-3 shadow-sm mb-3" :disabled="isLoading" style="background-color: #082b59; border: none; font-size: 1.1rem;">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>{{ isLogin ? 'Secure Sign In' : 'Create Account & Verify' }}
            </button>
          </form>

          <div class="text-center mt-2"><p class="text-muted">{{ isLogin ? "Don't have an account?" : "Already verified?" }} <a href="#" @click.prevent="isLogin = !isLogin" class="text-primary fw-bold text-decoration-none border-bottom border-primary">{{ isLogin ? 'Create one now' : 'Sign in here' }}</a></p></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter(); const isLogin = ref(true); const isLoading = ref(false)
const profilePic = ref(null); const coverPic = ref(null)
const form = ref({ email: '', password: '', firstName: '', lastName: '', middleName: '', username: '', dob: '', role: 'buyer', whatsapp: '', campus: 'Student', businessName: '', businessDesc: '', businessSector: 'Other' })

// THE NEW OAUTH LOGIC
const signInWithProvider = async (provider) => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: provider })
  if (error) alert(error.message)
}

const handleAuth = async () => {
  isLoading.value = true
  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({ email: form.value.email, password: form.value.password })
      if (error) throw error
      window.location.href = '/shop' 
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.value.email, password: form.value.password })
      if (authError) throw authError
      
      let profileUrl = null, coverUrl = null;
      if (profilePic.value) {
        const pName = `prof_${authData.user.id}_${Date.now()}`
        await supabase.storage.from('user-profiles').upload(pName, profilePic.value)
        profileUrl = supabase.storage.from('user-profiles').getPublicUrl(pName).data.publicUrl
      }
      if (coverPic.value) {
        const cName = `cov_${authData.user.id}_${Date.now()}`
        await supabase.storage.from('user-profiles').upload(cName, coverPic.value)
        coverUrl = supabase.storage.from('user-profiles').getPublicUrl(cName).data.publicUrl
      }

      const { error: dbError } = await supabase.from('profiles').insert([{
        id: authData.user.id, first_name: form.value.firstName, last_name: form.value.lastName, middle_name: form.value.middleName,
        username: form.value.username, dob: form.value.dob, role: form.value.role, phone_number: form.value.whatsapp, 
        campus_affiliation: form.value.campus, business_name: form.value.businessName, business_desc: form.value.businessDesc, 
        business_sector: form.value.businessSector, profile_image: profileUrl, cover_image: coverUrl
      }])
      if (dbError) throw dbError

      alert("Account created successfully! You can now log in.")
      isLogin.value = true 
    }
  } catch (error) { alert(error.message) } finally { isLoading.value = false }
}
</script>
<style scoped>.registration-scroll-area { max-height: 45vh; overflow-y: auto; }</style>