<template>
  <div class="container-fluid py-4 px-lg-5">
    <div class="row g-4">
      
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
                <i class="bi bi-bookmark-fill me-3" :class="currentView === 'saved' ? 'text-white' : 'text-secondary'"></i> Saved Items
                <span v-if="savedItemIds.length > 0" class="badge ms-auto" :style="currentView === 'saved' ? 'background-color: rgba(255,255,255,0.2);' : 'background-color: #e9ecef; color: #111827;'">{{ savedItemIds.length }}</span>
              </a>
            </li>
            <li class="nav-item mt-4 border-top pt-3">
              <a href="#" class="nav-link text-dark fw-medium rounded px-3 py-2 d-flex align-items-center">
                <i class="bi bi-shield-check me-3 text-secondary"></i> Security
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-12 col-lg-10">
        
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div class="position-relative flex-grow-1" style="max-width: 500px;">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
            <input type="text" v-model="searchQuery" class="form-control ps-5 w-100" placeholder="Search textbooks, tech, or dorm gear..." style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 14px 20px; font-weight: 500; color: #111827;">
          </div>
          <button @click="router.push('/dashboard')" class="py-2 px-4 d-flex align-items-center gap-2" style="background-color: #082b59; color: white; border-radius: 999px; font-weight: 600; border: none; transition: transform 0.2s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'" onmouseleave="this.style.transform='scale(1)'">
            <i class="bi bi-plus-circle-fill"></i> Post an Item
          </button>
        </div>

        <div v-if="topSellers.length > 0 && currentView === 'feed'" class="mb-5">
          <h6 class="fw-bold text-dark text-uppercase mb-3" style="letter-spacing: 0.05em;"><i class="bi bi-stars text-warning me-2"></i> Top Campus Sellers</h6>
          <div class="d-flex gap-4 overflow-auto pb-2" style="-ms-overflow-style: none; scrollbar-width: none;">
            <div v-for="seller in topSellers" :key="seller.id" @click="router.push(`/profile/${seller.id}`)" class="text-center" style="cursor: pointer; min-width: 90px;">
              <div class="rounded-circle mx-auto mb-2 shadow-sm d-flex justify-content-center align-items-center" style="width: 70px; height: 70px; border: 3px solid #082b59; padding: 2px;">
                <img :src="seller.profile_image || `https://ui-avatars.com/api/?name=${seller.business_name || 'Vendor'}&background=e9ecef&color=082b59`" class="rounded-circle w-100 h-100 object-fit-cover">
              </div>
              <p class="small fw-bold text-dark text-truncate mb-0 px-1" style="font-size: 0.75rem;">{{ seller.business_name || 'Verified Vendor' }}</p>
            </div>
          </div>
        </div>

        <div class="d-flex overflow-auto pb-2 mb-4 gap-2" style="-ms-overflow-style: none; scrollbar-width: none;">
          <button @click="activeCategory = 'All'" class="btn rounded-pill px-4" :style="activeCategory === 'All' ? 'background-color: #082b59; color: white; font-weight: 600;' : 'background-color: white; color: #111827; border: 1px solid #e9ecef; font-weight: 500;'">All Items</button>
          <button @click="activeCategory = 'Textbooks'" class="btn rounded-pill px-4" :style="activeCategory === 'Textbooks' ? 'background-color: #082b59; color: white; font-weight: 600;' : 'background-color: white; color: #111827; border: 1px solid #e9ecef; font-weight: 500;'">Textbooks</button>
          <button @click="activeCategory = 'IT & Tech'" class="btn rounded-pill px-4" :style="activeCategory === 'IT & Tech' ? 'background-color: #082b59; color: white; font-weight: 600;' : 'background-color: white; color: #111827; border: 1px solid #e9ecef; font-weight: 500;'">IT & Tech</button>
          <button @click="activeCategory = 'Dorm Decor'" class="btn rounded-pill px-4" :style="activeCategory === 'Dorm Decor' ? 'background-color: #082b59; color: white; font-weight: 600;' : 'background-color: white; color: #111827; border: 1px solid #e9ecef; font-weight: 500;'">Dorm Decor</button>
        </div>

        <h4 v-if="currentView === 'listings'" class="mb-4 fw-bold" style="color: #082b59;">My Active Listings</h4>
        <h4 v-if="currentView === 'saved'" class="mb-4 fw-bold" style="color: #082b59;">Saved Items</h4>

        <div v-if="loading" class="text-center py-5"><div class="spinner-border" style="color: #b22b1d;"></div></div>

        <div v-else-if="displayedProducts.length === 0" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-secondary mb-3 d-block"></i>
          <h5 class="fw-bold" style="color: #111827;">Nothing here yet.</h5>
          <p class="text-secondary">No items match your current search or filter.</p>
        </div>

        <div v-else class="row g-4">
          <div v-for="product in displayedProducts" :key="product.id" class="col-12 col-sm-6 col-lg-4 col-xl-3">
            
            <div class="h-100 d-flex flex-column overflow-hidden position-relative" @click="product.stock > 0 ? router.push(`/product/${product.id}`) : null" :style="product.stock > 0 ? 'cursor: pointer; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.03); transition: transform 0.2s ease;' : 'cursor: not-allowed; background: #f8f9fa; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);'">
              
              <button @click.stop="toggleSaved(product.id)" class="btn position-absolute top-0 start-0 m-2 rounded-circle shadow-sm d-flex justify-content-center align-items-center" style="background-color: white; width: 34px; height: 34px; z-index: 10; border: none;">
                <i class="bi fs-6" :class="savedItemIds.includes(product.id) ? 'bi-bookmark-fill text-danger' : 'bi-bookmark text-secondary'"></i>
              </button>

              <div class="position-relative bg-light">
                <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/400'" class="w-100 object-fit-cover" style="height: 220px; transition: opacity 0.3s;" :style="product.stock <= 0 ? 'opacity: 0.5; filter: grayscale(80%);' : ''" alt="Item">
                <div class="position-absolute top-0 end-0 p-3 d-flex flex-column gap-2 align-items-end">
                  <span v-if="product.stock <= 0" class="badge rounded-pill bg-dark text-white shadow" style="font-weight: 900; padding: 8px 14px; letter-spacing: 0.05em; font-size: 0.75rem;">SOLD OUT</span>
                </div>
              </div>
              
              <div class="p-3 d-flex flex-column flex-grow-1 bg-white" :style="product.stock <= 0 ? 'opacity: 0.7;' : ''">
                
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <h3 class="mb-0 text-truncate pe-2" style="font-size: 1.1rem; color: #111827; font-weight: 800; max-width: 70%;">{{ product.title }}</h3>
                  <span class="badge border fw-bold bg-light text-dark d-flex align-items-center" style="font-size: 0.7rem; padding: 4px 6px;">
                    <i class="bi bi-star-fill text-warning me-1"></i> {{ product.avgRating > 0 ? product.avgRating : 'New' }}
                  </span>
                </div>
                
                <h2 class="mb-3 mt-1" style="font-size: 1.3rem; color: #b22b1d; font-weight: 800;" :class="{'text-muted': product.stock <= 0}">
                  ₦{{ Number(product.price).toLocaleString() }}
                </h2>
                
                <div class="mt-auto d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center seller-link" @click.stop="router.push(`/profile/${product.profiles?.id}`)">
                    <img :src="product.profiles?.profile_image || `https://ui-avatars.com/api/?name=${product.profiles?.business_name || 'User'}&background=e9ecef&color=082b59`" class="rounded-circle me-2 object-fit-cover" width="24" height="24">
                    <span class="text-secondary text-truncate" style="font-size: 0.75rem; max-width: 120px;">Listed by <strong class="text-dark hover-underline">{{ product.profiles?.business_name || 'Verified Student' }}</strong></span>
                  </div>
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

const currentView = ref('feed')
const activeCategory = ref('All')
const searchQuery = ref('')
const savedItemIds = ref([])

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) currentUser.value = session.user

  savedItemIds.value = JSON.parse(localStorage.getItem('num_bazaar_saved') || '[]')

  // Fetch Products WITH Seller Profiles AND Reviews
  const { data: prodData } = await supabase
    .from('products')
    .select(`*, profiles(id, business_name, profile_image), reviews(rating)`)
    .order('created_at', { ascending: false })

  // Calculate Average Rating per product
  products.value = prodData?.map(p => {
    const avgRating = p.reviews?.length > 0 
      ? (p.reviews.reduce((acc, rev) => acc + rev.rating, 0) / p.reviews.length).toFixed(1) 
      : 0;
    return { ...p, avgRating }
  }) || []

  // Fetch Top 5 Sellers
  const { data: sellerData } = await supabase
    .from('profiles')
    .select('id, business_name, profile_image')
    .in('role', ['seller', 'external'])
    .limit(5)
    
  topSellers.value = sellerData || []
  
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
div[style*="overflow-auto"]::-webkit-scrollbar {
  display: none;
}
.seller-link {
  padding: 4px;
  border-radius: 8px;
  transition: background-color 0.2s;
}
.seller-link:hover {
  background-color: #f3f4f6;
}
.hover-underline:hover {
  text-decoration: underline;
}
</style>