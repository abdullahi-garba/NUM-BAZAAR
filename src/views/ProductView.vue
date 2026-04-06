<template>
  <div class="container pb-5">
    
    <button @click="router.back()" class="btn btn-sm bg-white shadow-sm rounded-pill fw-bold px-3 mb-4">
      <i class="bi bi-arrow-left me-2"></i>Back
    </button>

    <div v-if="product" class="row g-5">
      <div class="col-lg-6">
        <div class="card-vanguard overflow-hidden">
          <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/600'" class="w-100 object-fit-cover" style="height: 500px;">
        </div>
      </div>

      <div class="col-lg-6 d-flex flex-column">
        
        <div class="p-3 mb-4 rounded-3 d-flex align-items-start" style="background-color: var(--tertiary-fixed); color: var(--on-tertiary-fixed);">
          <i class="bi bi-shield-check fs-4 me-3 mt-1"></i>
          <div>
            <h6 class="text-900 mb-1">ESCROW PROTECTION ACTIVE</h6>
            <p class="mb-0 small text-500">Funds are held securely by Newgate University Treasury until you confirm receipt.</p>
          </div>
        </div>

        <div class="mb-2">
          <AcademicBadge variant="default" class="me-2">Campus Approved</AcademicBadge>
          <AcademicBadge v-if="product.stock < 3" variant="warning">High Demand</AcademicBadge>
        </div>

        <h1 class="text-900 text-uppercase mb-2" style="font-size: 2.5rem; line-height: 1.1;">{{ product.title }}</h1>
        <div class="d-flex align-items-baseline mb-4">
          <h2 class="text-900 mb-0 me-3" style="font-size: 2.5rem; color: var(--primary);">₦{{ Number(product.price).toLocaleString() }}</h2>
          <span class="text-500 text-success"><i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i> In Stock ({{ product.stock }})</span>
        </div>

        <div class="card-vanguard p-4 mb-4 bg-light d-flex flex-row justify-content-between align-items-center">
          <div class="d-flex align-items-center">
             <div class="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center me-3" style="width: 50px; height: 50px;">
                <i class="bi bi-person-fill fs-4 text-muted"></i>
             </div>
             <div>
               <h6 class="text-900 mb-0">{{ product.profiles?.business_name || 'Verified Vendor' }}</h6>
               <span class="small text-muted text-500">Academic Member ID: {{ product.seller_id.substring(0, 5) }}</span>
             </div>
          </div>
          <button class="btn btn-outline-dark rounded-pill fw-bold btn-sm px-4">Message</button>
        </div>

        <p class="text-500 text-muted mb-5" style="line-height: 1.7;">{{ product.description }}</p>

        <div class="mt-auto">
           <button @click="addToCart" class="btn btn-pill btn-oxblood w-100 fs-5 py-3 shadow-sm d-flex justify-content-center align-items-center gap-2">
             <i class="bi bi-lock-fill"></i> Add to Escrow Cart
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
import AcademicBadge from '../components/AcademicBadge.vue'

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