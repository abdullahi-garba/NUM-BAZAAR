<template>
  <div class="bg-light min-vh-100 pb-5">
    
    <div style="height: 200px; background-color: #082b59; position: relative; background-size: cover; background-position: center;" :style="profile?.cover_image ? `background-image: url('${profile.cover_image}');` : ''">
      <div class="position-absolute w-100 h-100" style="background: linear-gradient(to bottom, rgba(8,43,89,0.5), rgba(8,43,89,1));"></div>
    </div>

    <div class="container px-lg-5" style="margin-top: -80px; position: relative; z-index: 10;">
      
      <div v-if="isLoading" class="text-center py-5"><div class="spinner-border" style="color: #b22b1d;"></div></div>
      
      <div v-else-if="profile" class="row g-4">
        
        <div class="col-lg-4">
          <div class="bg-white p-4 shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
            
            <div class="text-center mb-4">
              <img :src="profile.profile_image || `https://ui-avatars.com/api/?name=${profile.first_name || 'User'}&background=e9ecef&color=082b59&size=120`" class="rounded-circle border border-4 border-white shadow-sm mb-3 object-fit-cover" style="width: 120px; height: 120px; background-color: white;">
              
              <h4 class="fw-bold text-dark mb-0">{{ profile.business_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'New User' }}</h4>
              <p class="text-secondary fw-medium mb-2">@{{ profile.username }}</p>
              
              <div class="d-flex flex-wrap justify-content-center gap-2 mb-2 mt-2">
                <span class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" :style="profile.role === 'seller' ? 'background-color: #082b59; color: white;' : 'background-color: #e9ecef; color: #6b7280;'">
                  {{ profile.role === 'seller' ? 'Vendor' : profile.role === 'admin' ? 'Admin' : 'Buyer' }}
                </span>
                <span class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" style="background-color: #f3f4f6; color: #111827; border: 1px solid #e5e7eb;">
                  {{ profile.campus_affiliation || 'Student' }}
                </span>
                <span v-if="profile.business_sector" class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" style="background-color: #ffe8d6; color: #b22b1d; border: 1px solid #b22b1d;">
                  {{ profile.business_sector }}
                </span>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold text-dark text-uppercase small" style="letter-spacing: 0.05em;">Business Description / Bio</h6>
              <p class="text-secondary small fw-medium" style="line-height: 1.6;">
                {{ profile.business_desc || 'No description provided yet.' }}
              </p>
            </div>

            <div class="d-flex flex-column gap-3 mb-4 border-top pt-4">
              <div class="d-flex align-items-center text-secondary small fw-medium">
                <i class="bi bi-envelope-fill me-3 fs-5" style="color: #082b59;"></i> {{ profile.email || 'Hidden' }}
              </div>
              <div class="d-flex align-items-center text-secondary small fw-medium">
                <i class="bi bi-telephone-fill me-3 fs-5" style="color: #082b59;"></i> {{ profile.phone_number || 'Not provided' }}
              </div>
              <div class="d-flex align-items-center text-secondary small fw-medium" v-if="profile.dob">
                <i class="bi bi-gift-fill me-3 fs-5" style="color: #082b59;"></i> {{ new Date(profile.dob).toLocaleDateString() }}
              </div>
              <div class="d-flex align-items-center text-secondary small fw-medium">
                <i class="bi bi-calendar-check-fill me-3 fs-5" style="color: #082b59;"></i> Joined {{ new Date(profile.created_at || Date.now()).toLocaleDateString() }}
              </div>
            </div>

            <button v-if="isOwnProfile && !isEditing" @click="isEditing = true" class="btn w-100 rounded-pill fw-bold py-2" style="background-color: #f3f4f6; color: #111827; border: 1px solid #e5e7eb; transition: all 0.2s;">
              <i class="bi bi-pencil-square me-2"></i> Edit Profile
            </button>
          </div>
        </div>

        <div class="col-lg-8">
          
          <div v-if="isEditing" class="bg-white p-4 shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
            <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <h5 class="fw-bold text-dark mb-0">Update Profile Details</h5>
              <button @click="isEditing = false" class="btn-close"></button>
            </div>

            <form @submit.prevent="saveProfile">
              <div class="row g-3 mb-4">
                
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Display Picture</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFileUpload(e, 'avatar')" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 10px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Cover Banner Image</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFileUpload(e, 'cover')" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 10px 15px; font-weight: 500; color: #111827;">
                </div>

                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">First Name</label>
                  <input type="text" v-model="editForm.first_name" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Middle Name</label>
                  <input type="text" v-model="editForm.middle_name" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Last Name</label>
                  <input type="text" v-model="editForm.last_name" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Account Type</label>
                  <select v-model="editForm.role" class="form-select" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Vendor (Seller)</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Campus Affiliation</label>
                  <select v-model="editForm.campus_affiliation" class="form-select" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="External">External</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Business Name</label>
                  <input type="text" v-model="editForm.business_name" class="form-control" placeholder="Optional" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Business Sector</label>
                  <input type="text" v-model="editForm.business_sector" class="form-control" placeholder="e.g. Tech, Food" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Phone Number</label>
                  <input type="tel" v-model="editForm.phone_number" class="form-control" placeholder="080..." style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Date of Birth</label>
                  <input type="date" v-model="editForm.dob" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;">
                </div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-uppercase text-dark" style="letter-spacing: 0.05em;">Business Description / Bio</label>
                  <textarea v-model="editForm.business_desc" class="form-control" rows="4" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500; color: #111827;"></textarea>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-3 pt-3 border-top">
                <button type="button" @click="isEditing = false" class="btn fw-bold rounded-pill px-4" style="background-color: white; color: #6b7280; border: 1px solid #e9ecef;">Cancel</button>
                <button type="submit" class="btn fw-bold rounded-pill px-5" style="background-color: #b22b1d; color: white; border: none;" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> Save Changes
                </button>
              </div>
            </form>
          </div>

          <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h4 class="fw-bold text-dark mb-0">{{ ['seller', 'external'].includes(profile.role) ? 'Active Listings' : 'Recent Activity' }}</h4>
            </div>

            <div v-if="listings.length === 0" class="bg-white p-5 text-center shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
              <i class="bi bi-inbox fs-1 text-secondary mb-3 d-block"></i>
              <h5 class="fw-bold text-dark">No items found</h5>
              <p class="text-secondary fw-medium">This user hasn't listed any items for sale yet.</p>
            </div>
            
            <div v-else class="row g-4">
              <div v-for="product in listings" :key="product.id" class="col-md-6 col-xl-4">
                <div class="h-100 d-flex flex-column overflow-hidden bg-white" @click="$router.push(`/product/${product.id}`)" style="cursor: pointer; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: transform 0.2s ease;">
                  <div class="position-relative bg-light">
                    <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/400'" class="w-100 object-fit-cover" style="height: 180px;" alt="Item">
                    <span v-if="product.stock <= 0" class="badge bg-dark position-absolute top-0 end-0 m-2">SOLD OUT</span>
                  </div>
                  <div class="p-3 d-flex flex-column flex-grow-1">
                    <h6 class="fw-bold text-dark text-truncate mb-1">{{ product.title }}</h6>
                    <h5 class="fw-bold mt-auto mb-0" style="color: #b22b1d;">₦{{ Number(product.price).toLocaleString() }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <div v-else class="text-center py-5">
        <h3 class="fw-bold text-dark mb-3">Setting up your profile...</h3>
        <p class="text-secondary mb-4">If this screen doesn't update, please refresh the page.</p>
        <button @click="forceRefresh" class="btn fw-bold rounded-pill px-4" style="background-color: #082b59; color: white;">Refresh Page</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const isLoading = ref(true)
const isSaving = ref(false)

const profile = ref(null)
const listings = ref([])
const isOwnProfile = ref(false)
const isEditing = ref(false)

const editForm = ref({})
const displayPictureFile = ref(null)
const coverPictureFile = ref(null)

const handleFileUpload = (event, type) => {
  if (type === 'avatar') displayPictureFile.value = event.target.files[0]
  if (type === 'cover') coverPictureFile.value = event.target.files[0]
}

const forceRefresh = () => window.location.reload()

onMounted(async () => {
  isLoading.value = true
  const profileId = route.params.id

  try {
    const { data: userProfile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', profileId).single()
    
    if (profileErr) {
      console.warn("Profile not found or still generating:", profileErr)
      // We don't throw the error, we let the UI gracefully show the "Setting up your profile" message
    } else {
      profile.value = userProfile

      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session && sessionData.session.user.id === profileId) {
        isOwnProfile.value = true
        editForm.value = {
          first_name: profile.value.first_name || '',
          last_name: profile.value.last_name || '',
          middle_name: profile.value.middle_name || '',
          business_name: profile.value.business_name || '',
          business_sector: profile.value.business_sector || '',
          business_desc: profile.value.business_desc || '',
          phone_number: profile.value.phone_number || '',
          role: profile.value.role || 'buyer',
          campus_affiliation: profile.value.campus_affiliation || 'Student',
          dob: profile.value.dob || '',
          profile_image: profile.value.profile_image || '',
          cover_image: profile.value.cover_image || ''
        }
      }

      if (profile.value.role && ['seller', 'external'].includes(profile.value.role)) {
        const { data: products } = await supabase.from('products').select('*').eq('seller_id', profileId).order('created_at', { ascending: false })
        listings.value = products || []
      }
    }
  } catch (error) {
    console.error("Error loading profile data:", error)
  } finally {
    isLoading.value = false
  }
})

const saveProfile = async () => {
  isSaving.value = true
  try {
    if (displayPictureFile.value) {
      const fileExt = displayPictureFile.value.name.split('.').pop()
      const fileName = `avatar_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('user-profiles').upload(fileName, displayPictureFile.value)
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('user-profiles').getPublicUrl(fileName)
        editForm.value.profile_image = publicUrlData.publicUrl
      }
    }

    if (coverPictureFile.value) {
      const fileExt = coverPictureFile.value.name.split('.').pop()
      const fileName = `cover_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('user-profiles').upload(fileName, coverPictureFile.value)
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('user-profiles').getPublicUrl(fileName)
        editForm.value.cover_image = publicUrlData.publicUrl
      }
    }

    const { error } = await supabase.from('profiles').update({
      first_name: editForm.value.first_name,
      last_name: editForm.value.last_name,
      middle_name: editForm.value.middle_name,
      business_name: editForm.value.business_name,
      business_sector: editForm.value.business_sector,
      business_desc: editForm.value.business_desc,
      phone_number: editForm.value.phone_number,
      role: editForm.value.role,
      campus_affiliation: editForm.value.campus_affiliation,
      dob: editForm.value.dob || null,
      profile_image: editForm.value.profile_image,
      cover_image: editForm.value.cover_image
    }).eq('id', profile.value.id)

    if (error) throw error

    profile.value = { ...profile.value, ...editForm.value }
    isEditing.value = false
    displayPictureFile.value = null
    coverPictureFile.value = null
    
  } catch (error) {
    alert("Error updating profile: " + error.message)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
input, textarea, select { font-size: 16px !important; }
.h-100:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 25px rgba(0,0,0,0.05) !important; }
</style>