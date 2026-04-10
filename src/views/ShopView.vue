<template>
  <div class="container-fluid py-4 px-lg-5">
    
    <div v-if="!loading && currentUser && !isUserVerified && userRole !== 'admin'" class="min-vh-100 d-flex justify-content-center align-items-center">
      <div class="text-center bg-white p-5 rounded-4 shadow-lg border" style="max-width: 600px; border-color: rgba(0,0,0,0.05);">
        <i class="bi bi-shield-lock-fill d-block mb-3" style="font-size: 4rem; color: #b22b1d;"></i>
        <h2 class="fw-black text-dark mb-3">Identity Verification Required</h2>
        <p class="text-secondary fw-medium mb-4">
          For the security of the Newgate University community, all students and staff must verify their identity before accessing the marketplace, messaging vendors, or making purchases.
        </p>
        <button @click="router.push(`/profile/${currentUser.id}`)" class="btn btn-lg w-100 fw-bold rounded-pill shadow-sm" style="background-color: #082b59; color: white;">
          Submit KYC Document Now <i class="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </div>

    <div v-else-if="!loading" class="row g-4">
      
      <div class="col-lg-2 d-none d-lg-block">
        <div class="p-3 position-sticky" style="top: 100px; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          <ul class="nav flex-column gap-1">
            <li class="nav-item">
              <a href="#" @click.prevent="currentView = 'feed'" class="nav-link rounded px-3 py-2 d-flex align-items-center" :style="currentView === 'feed' ? 'background-color: #082b59; color: white; font-weight: 700;' : 'color: #111827; font-weight: 500;'">
                <i class="bi bi-grid-fill me-3" :class="currentView === 'feed' ? 'text-white' : 'text-secondary'"></i> Feed
              </a>
            </li>
            <li class="nav-item" v-if="currentUser">
              <a href="#" @click.prevent="currentView = 'listings'" class="nav-link rounded px-3 py-2 d-flex align-items-center" :style="currentView === 'listings' ? 'background-color: #082b59; color: white; font-weight: 700;' : 'color: #111827; font-weight: 500;'">
                <i class="bi bi-list-ul me-3" :class="currentView === 'listings' ? 'text-white' : 'text-secondary'"></i> My Listings
              </a>
            </li>
            <li class="nav-item">
              <a href="#" @click.prevent="currentView = 'saved'" class="nav-link rounded px-3 py-2 d-flex align-items-center" :style="currentView === 'saved' ? 'background-color: #082b59; color: white; font-weight: 700;' : 'color: #111827; font-weight: 500;'">
                <i class="bi bi-bookmark-fill me-3" :class="currentView === 'saved' ? 'text-white' : 'text-secondary'"></i> Saved
                <span v-if="savedItemIds.length > 0" class="badge ms-auto" :style="currentView === 'saved' ? 'background-color: rgba(255,255,255,0.2);' : 'background-color: #e9ecef; color: #111827;'">{{ savedItemIds.length }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-12 col-lg-10">
        
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div class="position-relative flex-grow-1" style="max-width: 500px;">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
            <input type="text" v-model="searchQuery" class="form-control ps-5 w-100" placeholder="Search items..." style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;">
          </div>
          <button @click="router.push('/dashboard')" class="py-2 px-4 d-flex align-items-center gap-2" style="background-color: #082b59; color: white; border-radius: 999px; font-weight: 600; border: none;">
            <i class="bi bi-plus-circle-fill"></i> Post Item
          </button>
        </div>

        <div v-if="topSellers.length > 0 && currentView === 'feed'" class="mb-4">
          <h6 class="fw-bold text-dark text-uppercase mb-3" style="letter-spacing: 0.05em; font-size: 0.8rem;">
            <i class="bi bi-star-fill text-warning me-2"></i>Top Campus Vendors
          </h6>
          <div class="d-flex gap-4 overflow-auto pb-2" style="-ms-overflow-style: none; scrollbar-width: none;">
            <div v-for="seller in topSellers" :key="seller.id" @click="router.push(`/profile/${seller.id}`)" class="text-center vendor-bubble" style="cursor: pointer; min-width: 80px;">
              <div class="position-relative d-inline-block">
                <img :src="seller.profile_image || `https://ui-avatars.com/api/?name=${seller.business_name || 'Vendor'}&background=e9ecef&color=082b59`" class="rounded-circle border border-2 border-white shadow-sm mb-2 object-fit-cover" style="width: 70px; height: 70px;">
                <span class="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle p-1 mb-2"></span>
              </div>
              <div class="small fw-bold text-dark text-truncate" style="max-width: 80px;">{{ seller.business_name || 'Verified Vendor' }}</div>
            </div>
          </div>
        </div>

        <div class="d-flex overflow-auto pb-2 mb-4 gap-2" style="-ms-overflow-style: none; scrollbar-width: none;">
          <button @click="activeCategory = 'All'" class="btn rounded-pill px-4 text-nowrap" :style="activeCategory === 'All' ? 'background-color: #082b59; color: white; font-weight: 600;' : 'background-color: white; color: #111827; border: 1px solid #e9ecef; font-weight: 500;'">All Items</button>
          <button @click="activeCategory = 'Textbooks'" class="btn rounded-pill px-4 text-nowrap" :style="activeCategory === 'Textbooks' ? 'background-color: #082b59; color: white; font-weight: 600;' : 'background-color: white; color: #111827; border: 1px solid #e9ecef; font-weight: 500;'">Textbooks</button>
          <button @click="activeCategory = 'IT & Tech'" class="btn rounded-pill px-4 text-nowrap" :style="activeCategory === 'IT & Tech' ? 'background-color: #082b59; color: white; font-weight: 600;' : 'background-color: white; color: #111827; border: 1px solid #e9ecef; font-weight: 500;'">IT & Tech</button>
          <button @click="activeCategory = 'Dorm Decor'" class="btn rounded-pill px-4 text-nowrap" :style="activeCategory === 'Dorm Decor' ? 'background-color: #082b59; color: white; font-weight: 600;' : 'background-color: white; color: #111827; border: 1px solid #e9ecef; font-weight: 500;'">Dorm Decor</button>
        </div>

        <div v-if="displayedProducts.length === 0" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-secondary mb-3 d-block"></i>
          <h5 class="fw-bold text-dark">Nothing here yet.</h5>
          <p class="text-secondary">No items match your current search or filter.</p>
        </div>

        <div v-else class="row g-2 g-md-4">
          <div v-for="product in displayedProducts" :key="product.id" class="col-4 col-lg-2">
            
            <div class="h-100 d-flex flex-column overflow-hidden position-relative product-card" @click="product.stock > 0 ? router.push(`/product/${product.id}`) : null" :style="product.stock > 0 ? 'cursor: pointer; background: #ffffff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);' : 'cursor: not-allowed; background: #f8f9fa; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);'">
              
              <button @click.stop="toggleSaved(product.id)" class="btn position-absolute top-0 start-0 m-1 rounded-circle shadow-sm d-flex justify-content-center align-items-center" style="background-color: white; width: 28px; height: 28px; z-index: 10; border: none; padding: 0;">
                <i class="bi fs-6" :class="savedItemIds.includes(product.id) ? 'bi-bookmark-fill text-danger' : 'bi-bookmark text-secondary'"></i>
              </button>

              <div class="position-relative bg-light">
                <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/400'" class="w-100 object-fit-cover" style="height: 120px;" :style="product.stock <= 0 ? 'opacity: 0.5; filter: grayscale(80%);' : ''" alt="Item">
                <div class="position-absolute top-0 end-0 p-1">
                  <span v-if="product.stock <= 0" class="badge bg-dark text-white shadow-sm compact-badge">SOLD OUT</span>
                </div>
              </div>
              
              <div class="p-2 d-flex flex-column flex-grow-1 bg-white" :style="product.stock <= 0 ? 'opacity: 0.7;' : ''">
                <h3 class="mb-1 text-truncate text-dark fw-bold compact-title">{{ product.title }}</h3>
                <h2 class="mb-2 mt-auto text-danger fw-black compact-price" :class="{'text-muted': product.stock <= 0}">
                  ₦{{ Number(product.price).toLocaleString() }}
                </h2>
                <div class="d-flex align-items-center">
                  <img :src="product.profiles?.profile_image || `https://ui-avatars.com/api/?name=${product.profiles?.business_name || 'User'}&background=e9ecef&color=082b59`" class="rounded-circle me-1 object-fit-cover" width="16" height="16">
                  <span class="text-secondary text-truncate compact-seller">{{ product.profiles?.business_name || 'Verified' }}</span>
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([])
const topSellers = ref([])
const loading = ref(true)
const currentUser = ref(null)
const isUserVerified = ref(false) 
const userRole = ref('buyer') 

const currentView = ref('feed')
const activeCategory = ref('All')
const searchQuery = ref('')
const savedItemIds = ref([])

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    currentUser.value = session.user
    const { data: profileData } = await supabase.from('profiles').select('is_verified, role').eq('id', currentUser.value.id).single()
    if (profileData) {
      isUserVerified.value = profileData.is_verified === true
      userRole.value = profileData.role
    }
  }

  savedItemIds.value = JSON.parse(localStorage.getItem('num_bazaar_saved') || '[]')

  if (!currentUser.value || isUserVerified.value || userRole.value === 'admin') {
    
    // Fetch Products
    const { data: prodData } = await supabase
      .from('products')
      .select(`*, profiles(id, business_name, profile_image)`)
      .order('created_at', { ascending: false })
    products.value = prodData || []

    // Calculate Top 5 Vendors By Actual Sales Volume
    const { data: orders } = await supabase
      .from('orders')
      .select('seller_id')
      .ilike('status', '%Completed%')
    
    if (orders && orders.length > 0) {
      // 1. Count frequencies of sales per vendor
      const counts = {}
      orders.forEach(o => counts[o.seller_id] = (counts[o.seller_id] || 0) + 1)
      
      // 2. Sort by highest sales and slice top 5 IDs
      const topSellerIds = Object.entries(counts)
        .sort((a,b) => b[1] - a[1])
        .slice(0,5)
        .map(e => e[0])
      
      if (topSellerIds.length > 0) {
        // 3. Fetch their profiles
        const { data: sellers } = await supabase
          .from('profiles')
          .select('id, business_name, profile_image')
          .in('id', topSellerIds)
        
        // 4. Map them back into the sorted array so the #1 seller is always first
        topSellers.value = topSellerIds.map(id => sellers.find(s => s.id === id)).filter(Boolean)
      }
    }
  }
  
  loading.value = false
})

const toggleSaved = (id) => {
  if (savedItemIds.value.includes(id)) {
    savedItemIds.value = savedItemIds.value.filter(itemId => itemId !== id)
  } else {
    savedItemIds.value.push(id)
  }
  localStorage.setItem('num_bazaar_saved', JSON.stringify(savedItemIds.value))
}

const displayedProducts = computed(() => {
  let filtered = products.value

  if (currentView.value === 'listings') filtered = filtered.filter(p => p.seller_id === currentUser.value?.id)
  else if (currentView.value === 'saved') filtered = filtered.filter(p => savedItemIds.value.includes(p.id))

  if (activeCategory.value !== 'All') {
    filtered = filtered.filter(p => p.title.toLowerCase().includes(activeCategory.value.toLowerCase().replace('it & tech', 'tech')))
  }

  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => p.title.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query))
  }

  return filtered
})
</script>

<style scoped>
div[style*="overflow-auto"]::-webkit-scrollbar { display: none; }
.product-card { box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.compact-title { font-size: 0.85rem; }
.compact-price { font-size: 0.95rem; }
.compact-seller { font-size: 0.65rem; }
.compact-badge { font-size: 0.55rem; padding: 4px 6px; }

.vendor-bubble { transition: transform 0.2s ease; }
.vendor-bubble:hover { transform: scale(1.05); }

@media (min-width: 992px) {
  .product-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .product-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
  .compact-title { font-size: 0.95rem; }
  .compact-price { font-size: 1.1rem; }
}
</style>