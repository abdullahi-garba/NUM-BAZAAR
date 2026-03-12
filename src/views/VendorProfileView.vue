<template>
  <div class="container py-5 mt-4">
    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    
    <div v-else-if="!vendor" class="text-center py-5">
      <h3 class="fw-bold text-muted">Vendor Not Found</h3>
    </div>

    <div v-else class="row g-4 justify-content-center">
      <div class="col-lg-10">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 bg-white">
          <div class="position-relative" style="height: 200px; background-color: #082b59;">
            <img v-if="vendor.cover_image" :src="vendor.cover_image" class="w-100 h-100" style="object-fit: cover; opacity: 0.8;">
          </div>
          <div class="card-body p-4 position-relative" style="margin-top: -60px;">
            <div class="d-flex flex-column flex-md-row align-items-md-end mb-3">
              <img v-if="vendor.profile_image" :src="vendor.profile_image" class="rounded-circle border border-4 border-white shadow bg-white mb-3 mb-md-0 me-md-4" style="width: 120px; height: 120px; object-fit: cover;">
              <div v-else class="bg-light text-primary rounded-circle d-flex justify-content-center align-items-center mb-3 mb-md-0 me-md-4 shadow border border-4 border-white" style="width: 120px; height: 120px; font-size: 3rem; font-weight: bold;">
                {{ vendor?.business_name?.charAt(0) || vendor?.first_name?.charAt(0) || 'V' }}
              </div>
              
              <div class="pb-2 flex-grow-1">
                <h2 class="fw-black mb-0 text-dark">{{ vendor?.business_name || (vendor?.first_name + ' ' + vendor?.last_name) || 'Campus Vendor' }}
                  <span v-if="vendor.is_subscribed" class="ms-2 fs-5 text-success"><i class="bi bi-patch-check-fill"></i></span>
                </h2>
                <p class="text-muted mb-2 fw-semibold">@{{ vendor.username }} • {{ vendor.campus_affiliation }}</p>
                
                <div class="d-flex gap-3 mt-3">
                  <span class="badge bg-light text-dark border px-3 py-2"><i class="bi bi-box-seam text-success me-1"></i> {{ completedSalesCount }} Successful Deliveries</span>
                  <span class="badge bg-light text-dark border px-3 py-2"><i class="bi bi-star-fill text-warning me-1"></i> {{ averageRating }} / 5.0 Rating</span>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-top">
              <h6 class="fw-bold text-muted text-uppercase small mb-2">About the Business ({{ vendor.business_sector || 'General' }})</h6>
              <p class="mb-0">{{ vendor.business_desc || 'This vendor has not provided a business description yet.' }}</p>
            </div>
          </div>
        </div>

        <ul class="nav nav-pills mb-4" role="tablist">
          <li class="nav-item"><button class="nav-link active fw-bold px-4 rounded-pill" data-bs-toggle="pill" data-bs-target="#active-listings">Active Listings</button></li>
          <li class="nav-item"><button class="nav-link fw-bold px-4 rounded-pill ms-2" data-bs-toggle="pill" data-bs-target="#recent-sales">Recent Deliveries</button></li>
        </ul>

        <div class="tab-content">
          <div class="tab-pane fade show active" id="active-listings">
            <div class="row g-4">
              <div v-if="activeProducts.length === 0" class="col-12 text-center text-muted py-5 card border-0 rounded-4">No active items right now.</div>
              <div v-for="product in activeProducts" :key="product.id" class="col-md-6 col-lg-4">
                 <div class="card shadow-sm border-0 rounded-4 h-100 product-card overflow-hidden">
                    <img :src="product.image_urls[0]" class="card-img-top" style="height: 200px; object-fit: cover;">
                    <div class="card-body p-3">
                      <h6 class="fw-bold text-truncate mb-1">{{ product.title }}</h6>
                      <h5 class="fw-black text-danger mb-3">₦{{ product.price.toLocaleString() }}</h5>
                      <router-link :to="`/product/${product.id}`" class="btn btn-outline-dark btn-sm w-100 fw-bold rounded-pill">View Details</router-link>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div class="tab-pane fade" id="recent-sales">
             <div class="card shadow-sm border-0 rounded-4 p-4 bg-white">
               <div v-if="completedOrders.length === 0" class="text-center text-muted py-4">No completed deliveries yet.</div>
               <ul v-else class="list-group list-group-flush">
                 <li v-for="order in completedOrders" :key="order.id" class="list-group-item px-0 py-3 d-flex align-items-center">
                   <div class="bg-success-subtle text-success rounded-circle p-2 me-3"><i class="bi bi-check-lg"></i></div>
                   <div class="flex-grow-1">
                     <h6 class="fw-bold mb-0 text-dark">Delivered: {{ order.product_name }}</h6>
                     <small class="text-muted">{{ new Date(order.created_at).toLocaleDateString() }}</small>
                   </div>
                 </li>
               </ul>
             </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const vendorId = route.params.id
const isLoading = ref(true)
const vendor = ref(null)
const activeProducts = ref([])
const completedOrders = ref([])
const reviews = ref([])

const completedSalesCount = computed(() => completedOrders.value.length)
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 'New'
  const sum = reviews.value.reduce((acc, rev) => acc + rev.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const fetchVendorData = async () => {
  isLoading.value = true
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', vendorId).single()
  vendor.value = profile

  if (profile) {
    const { data: products } = await supabase.from('products').select('*').eq('seller_id', vendorId).eq('is_approved', true)
    activeProducts.value = products || []

    const { data: orders } = await supabase.from('orders').select('*').eq('seller_id', vendorId).eq('status', 'Completed (Funds Released)').order('created_at', { ascending: false }).limit(10)
    completedOrders.value = orders || []

    if (products && products.length > 0) {
      const productIds = products.map(p => p.id)
      const { data: revs } = await supabase.from('reviews').select('rating').in('product_id', productIds)
      reviews.value = revs || []
    }
  }
  
  isLoading.value = false
}

onMounted(() => fetchVendorData())
</script>

<style scoped>
.product-card { transition: transform 0.2s ease; }
.product-card:hover { transform: translateY(-5px); }
.nav-pills .nav-link.active { background-color: #082b59; color: white; }
.nav-pills .nav-link { color: #6c757d; background-color: #e9ecef; }
</style>