<template>
  <div class="container py-5 mt-4">
    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    
    <div v-else-if="profile" class="row g-4 justify-content-center">
      
      <div class="col-lg-4">
        <div class="card shadow-sm border-0 rounded-4 bg-white p-4 text-center sticky-top" style="top: 100px;">
          <div class="position-relative d-inline-block mx-auto mb-3">
            <img :src="profile.profile_image || 'https://via.placeholder.com/150'" class="rounded-circle object-fit-cover shadow-sm border border-3 border-white" style="width: 120px; height: 120px;">
            <span v-if="profile.is_verified" class="position-absolute bottom-0 end-0 p-2 bg-success border border-light rounded-circle text-white shadow-sm" title="KYC Verified" style="transform: translate(-10%, -10%);">
              <i class="bi bi-patch-check-fill"></i>
            </span>
          </div>
          
          <h4 class="fw-black mb-1 text-dark">{{ profile.business_name || profile.first_name || 'Campus Member' }}</h4>
          <p class="text-muted mb-2">@{{ profile.username }}</p>
          
          <span class="badge mb-3" :class="profile.role === 'seller' ? 'bg-primary' : 'bg-secondary'">{{ profile.role.toUpperCase() }}</span>
          
          <div v-if="isOwner && !profile.is_verified" class="mt-4 pt-3 border-top text-start">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-shield-lock me-2"></i>Identity Verification</h6>
            <div v-if="profile.id_card_url" class="alert alert-warning small py-2 mb-0 fw-bold border-0 bg-warning-subtle text-warning-emphasis">
              <i class="bi bi-hourglass-split me-1"></i> ID submitted. Pending Admin review.
            </div>
            <div v-else>
              <p class="text-muted small mb-2">Please upload your Newgate University ID card to become a verified member.</p>
              <input type="file" class="form-control form-control-sm mb-2 bg-light border-0" accept="image/*" @change="e => kycFile = e.target.files[0]">
              <button @click="uploadKYC" class="btn btn-dark btn-sm w-100 fw-bold rounded-pill" :disabled="isUploadingKYC || !kycFile">
                {{ isUploadingKYC ? 'Uploading...' : 'Submit ID Card' }}
              </button>
            </div>
          </div>

          <p v-if="profile.bio" class="text-muted small mt-4 pt-3 border-top text-start px-2">"{{ profile.bio }}"</p>
          
          <button v-if="isOwner" class="btn btn-outline-dark fw-bold rounded-pill w-100 mt-3">Edit Profile</button>
        </div>
      </div>

      <div class="col-lg-8" v-if="isOwner">
        <div class="card shadow-sm border-0 rounded-4 bg-white p-4">
          <h4 class="fw-black mb-4 border-bottom pb-3"><i class="bi bi-bag-check-fill me-2"></i>My Purchases</h4>
          
          <div v-if="myOrders.length === 0" class="text-center text-muted py-5">
            <i class="bi bi-receipt fs-1 mb-3 d-block"></i>
            You haven't made any escrow purchases yet.
          </div>

          <div v-else class="list-group list-group-flush">
            <div v-for="order in myOrders" :key="order.id" class="list-group-item p-4 border rounded-4 mb-3 bg-light">
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                
                <div class="d-flex align-items-center">
                  <img :src="order.product_image" class="rounded-3 me-3 object-fit-cover shadow-sm" style="width: 70px; height: 70px;">
                  <div>
                    <h6 class="fw-bold mb-1 text-dark">{{ order.product_name }}</h6>
                    <div class="text-danger fw-black mb-1">₦{{ Number(order.product_price).toLocaleString() }}</div>
                    <small class="text-muted d-block">Order ID: {{ order.id.substring(0,8) }}</small>
                  </div>
                </div>

                <div class="text-end">
                  <span v-if="order.status === 'Paid (In Escrow)'" class="badge bg-warning text-dark border border-warning mb-2 px-3 py-2 rounded-pill shadow-sm"><i class="bi bi-lock-fill me-1"></i> Paid (Funds in Escrow)</span>
                  <span v-else class="badge bg-success-subtle text-success border border-success mb-2 px-3 py-2 rounded-pill"><i class="bi bi-check-circle-fill me-1"></i> Completed</span>
                  
                  <button v-if="order.status === 'Paid (In Escrow)'" @click="confirmDelivery(order)" class="btn btn-success btn-sm w-100 fw-bold rounded-pill shadow-sm" :disabled="isConfirming === order.id">
                    {{ isConfirming === order.id ? 'Releasing...' : 'Confirm & Release Funds' }}
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const profileId = route.params.id

const isLoading = ref(true)
const profile = ref(null)
const isOwner = ref(false)
const myOrders = ref([])
const isConfirming = ref(null)

// KYC Data
const kycFile = ref(null)
const isUploadingKYC = ref(false)

const fetchProfileData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  const currentUser = sessionData.session?.user

  if (currentUser && currentUser.id === profileId) isOwner.value = true

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', profileId).single()
  profile.value = profileData

  if (isOwner.value) {
    const { data: ordersData } = await supabase.from('orders').select('*').eq('buyer_id', profileId).order('created_at', { ascending: false })
    myOrders.value = ordersData || []
  }

  isLoading.value = false
}

const uploadKYC = async () => {
  if (!kycFile.value) return;
  isUploadingKYC.value = true;
  
  try {
    const fileExt = kycFile.value.name.split('.').pop()
    const fileName = `${profile.value.id}_kyc_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage.from('kyc-documents').upload(fileName, kycFile.value)
    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from('kyc-documents').getPublicUrl(fileName)
    
    const { error: updateError } = await supabase.from('profiles').update({ id_card_url: publicUrlData.publicUrl }).eq('id', profile.value.id)
    if (updateError) throw updateError

    alert("ID Card submitted successfully! Admin will review it shortly.")
    kycFile.value = null
    await fetchProfileData()

  } catch (error) {
    alert("Error uploading KYC document: " + error.message)
  } finally {
    isUploadingKYC.value = false;
  }
}

const confirmDelivery = async (order) => {
  if(!confirm("Are you sure you have received the item in good condition? This will release the funds to the seller instantly.")) return;
  
  isConfirming.value = order.id
  try {
    const { data: sellerProfile } = await supabase.from('profiles').select('wallet_balance, escrow_balance').eq('id', order.seller_id).single()
    
    const newWallet = Number(sellerProfile.wallet_balance || 0) + Number(order.product_price)
    const newEscrow = Number(sellerProfile.escrow_balance || 0) - Number(order.product_price)

    await supabase.from('profiles').update({ wallet_balance: newWallet, escrow_balance: newEscrow }).eq('id', order.seller_id)
    await supabase.from('orders').update({ status: 'Completed' }).eq('id', order.id)
    await supabase.from('transactions').insert([{ profile_id: order.seller_id, amount: order.product_price, type: 'credit', status: 'Completed', description: `Escrow Release for Order #${order.id.substring(0,8)}` }])

    alert("Funds released to seller successfully!")
    await fetchProfileData()
  } catch (error) {
    alert("Error releasing funds. Please contact support.")
  } finally {
    isConfirming.value = null
  }
}

onMounted(() => fetchProfileData())
</script>