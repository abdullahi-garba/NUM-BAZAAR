<template>
  <div class="container pb-5">
    
    <button @click="router.back()" class="btn btn-sm bg-white border shadow-sm rounded-pill px-3 mb-4 text-navy-strict" style="font-weight: 800;">
      <i class="bi bi-arrow-left me-2"></i>Back
    </button>

    <div v-if="product" class="row g-5">
      <div class="col-lg-6">
        <div class="overflow-hidden border" style="border-radius: 1rem; box-shadow: 0 12px 24px rgba(8, 43, 89, 0.08);">
          <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/600'" class="w-100 object-fit-cover" style="height: 500px;">
        </div>
      </div>

      <div class="col-lg-6 d-flex flex-column">
        
        <div class="p-3 mb-4 rounded-3 d-flex align-items-start" style="background-color: #f0f4f8; border: 1px solid rgba(8, 43, 89, 0.2);">
          <i class="bi bi-shield-lock-fill fs-4 me-3 mt-1 text-navy-strict"></i>
          <div>
            <h6 class="mb-1 text-navy-strict" style="font-weight: 900;">ESCROW PROTECTION ACTIVE</h6>
            <p class="mb-0 small" style="font-weight: 600; color: #333333 !important;">Funds are held securely by the Newgate University protocol until you confirm receipt.</p>
          </div>
        </div>

        <div class="mb-2">
          <span class="badge text-uppercase me-2 bg-navy-strict text-white-strict" style="letter-spacing: 0.05em;">Campus Approved</span>
          <span v-if="product.stock < 3" class="badge bg-warning text-dark text-uppercase" style="letter-spacing: 0.05em;">High Demand</span>
        </div>

        <h1 class="text-uppercase mb-2 text-navy-strict" style="font-weight: 900; font-size: 2.5rem; line-height: 1.1;">{{ product.title }}</h1>
        <div class="d-flex align-items-baseline mb-4 border-bottom pb-3">
          <h2 class="mb-0 me-3 text-navy-strict" style="font-weight: 900; font-size: 2.5rem;">₦{{ Number(product.price).toLocaleString() }}</h2>
          <span class="text-success" style="font-weight: 700;"><i class="bi bi-check-circle-fill me-1"></i> In Stock ({{ product.stock }})</span>
        </div>

        <div class="p-4 mb-4 d-flex flex-row justify-content-between align-items-center bg-navy-strict" style="border-radius: 1rem; box-shadow: 0 12px 24px rgba(8, 43, 89, 0.15);">
          <div class="d-flex align-items-center">
             <div class="rounded-circle bg-white d-flex justify-content-center align-items-center me-3 shadow-sm text-navy-strict" style="width: 50px; height: 50px;">
                <i class="bi bi-shop fs-4"></i>
             </div>
             <div>
               <h6 class="mb-0 text-white-strict" style="font-weight: 900;">{{ product.profiles?.business_name || 'Verified Vendor' }}</h6>
               <span class="small" style="font-weight: 600; color: rgba(255,255,255,0.7) !important;">Academic Member ID: {{ product.seller_id.substring(0, 5) }}</span>
             </div>
          </div>
          <button class="btn btn-light rounded-pill btn-sm px-4 text-navy-strict" style="font-weight: 800; border: none;">Message</button>
        </div>

        <p class="mb-5" style="font-weight: 500; line-height: 1.7; font-size: 1.05rem; color: #333333 !important;">{{ product.description }}</p>

        <div class="mt-auto">
           <button @click="addToCart" class="btn rounded-pill w-100 fs-5 py-3 shadow d-flex justify-content-center align-items-center gap-2 bg-oxblood-strict text-white-strict" style="font-weight: 800; border: none;">
             <i class="bi bi-cart-plus-fill"></i> Add to Escrow Cart
           </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const router = useRouter()
const product = ref(null)

onMounted(async () => {
  const { data } = await supabase.from('products').select(`*, profiles(business_name)`).eq('id', route.params.id).single()
  product.value = data
})

const addToCart = () => {
  let cart = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
  if (!cart.some(item => item.id === product.value.id)) {
    cart.push(product.value)
    localStorage.setItem('num_bazaar_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))
  }
  router.push('/cart')
}
</script>