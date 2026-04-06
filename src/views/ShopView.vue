<template>
  <div>
    <div class="d-flex overflow-auto pb-3 mb-4 gap-2 no-scrollbar">
      <button class="btn btn-pill btn-primary-vanguard btn-sm px-4">All Items</button>
      <button class="btn btn-pill bg-white text-dark shadow-sm border-0 btn-sm px-4 fw-bold">Textbooks</button>
      <button class="btn btn-pill bg-white text-dark shadow-sm border-0 btn-sm px-4 fw-bold">IT & Tech</button>
      <button class="btn btn-pill bg-white text-dark shadow-sm border-0 btn-sm px-4 fw-bold">Dorm Decor</button>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else class="row g-4">
      <div v-for="product in products" :key="product.id" class="col-6 col-md-4 col-lg-3">
        <div class="card-vanguard h-100 d-flex flex-column overflow-hidden" @click="router.push(`/product/${product.id}`)" style="cursor: pointer;">
          
          <div class="position-relative">
            <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/400'" class="w-100 object-fit-cover" style="height: 200px;" alt="Item">
            <div class="position-absolute top-0 end-0 p-2">
              <AcademicBadge v-if="product.condition === 'New'" variant="warning">Mint</AcademicBadge>
            </div>
          </div>
          
          <div class="p-3 d-flex flex-column flex-grow-1">
            <h2 class="text-900 mb-1" style="color: var(--secondary); font-size: 1.25rem;">₦{{ Number(product.price).toLocaleString() }}</h2>
            <h3 class="text-600 mb-3 text-truncate" style="font-size: 0.95rem;">{{ product.title }}</h3>
            
            <div class="mt-auto d-flex align-items-center">
              <div class="rounded-circle bg-light d-flex justify-content-center align-items-center me-2" style="width: 24px; height: 24px;">
                <span class="text-900" style="font-size: 0.6rem; color: var(--primary);">{{ product.profiles?.business_name?.charAt(0) || 'U' }}</span>
              </div>
              <span class="text-500 text-muted" style="font-size: 0.75rem;">{{ product.profiles?.business_name || 'Verified Student' }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <button @click="router.push('/dashboard')" class="btn btn-oxblood rounded-circle shadow-lg position-fixed d-flex justify-content-center align-items-center" style="width: 65px; height: 65px; bottom: calc(90px + var(--safe-area-bottom)); right: 20px; z-index: 1050;">
      <i class="bi bi-plus-lg fs-3"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'
import AcademicBadge from '../components/AcademicBadge.vue'

const router = useRouter()
const products = ref([])
const loading = ref(true)

onMounted(async () => {
  const { data } = await supabase.from('products').select(`*, profiles(business_name)`).eq('status', 'active').order('created_at', { ascending: false })
  products.value = data || []
  loading.value = false
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>