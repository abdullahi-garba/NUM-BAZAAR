<template>
  <div class="container-fluid py-4 px-lg-5">
    
    <div v-if="!loading && currentUser && !isUserVerified && userRole !== 'admin'" class="min-vh-100 d-flex justify-content-center align-items-center">
      <div class="text-center bg-white p-5 rounded-4 shadow-lg border" style="max-width: 600px; border-color: rgba(0,0,0,0.05);">
        <i class="bi bi-shield-lock-fill d-block mb-3" style="font-size: 4rem; color: #b22b1d;"></i>
        <h2 class="fw-black text-dark mb-3">Identity Verification Required</h2>
        <p class="text-secondary fw-medium mb-4">
          For the security of the Newgate University community, all students and staff must verify their identity before accessing the marketplace.
        </p>
        <button @click="router.push(`/profile/${currentUser.id}`)" class="btn btn-lg w-100 fw-bold rounded-pill shadow-sm" style="background-color: #082b59; color: white;">
          Submit KYC Document Now <i class="bi bi-arrow-right ms-2"></i>
        </button>
        <button @click="requestENTFastTrack" class="btn btn-success fw-bold text-white mt-2 w-100 d-flex justify-content-center align-items-center gap-2">
        <i class="bi bi-whatsapp"></i> Request ENT211 Fast-Track
        </button>
      </div>
    </div>

    <div v-else-if="!loading" class="row g-4">
      
      <div class="col-lg-2 d-none d-lg-block">
        <div class="p-3 position-sticky" style="top: 100px; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          <ul class="nav flex-column gap-1">
            <li class="nav-item">
              <a href="#" @click.prevent="currentView = 'feed'; activeCategory = 'All'" class="nav-link rounded px-3 py-2 d-flex align-items-center" :style="currentView === 'feed' ? 'background-color: #082b59; color: white; font-weight: 700;' : 'color: #111827; font-weight: 500;'">
                <i class="bi bi-grid-fill me-3"></i> Feed
              </a>
            </li>
            <li class="nav-item" v-if="currentUser">
              <a href="#" @click.prevent="currentView = 'listings'; activeCategory = 'All'" class="nav-link rounded px-3 py-2 d-flex align-items-center" :style="currentView === 'listings' ? 'background-color: #082b59; color: white; font-weight: 700;' : 'color: #111827; font-weight: 500;'">
                <i class="bi bi-shop me-3"></i> My Listings
              </a>
            </li>
            <li class="nav-item">
              <a href="#" @click.prevent="currentView = 'saved'; activeCategory = 'All'" class="nav-link rounded px-3 py-2 d-flex align-items-center" :style="currentView === 'saved' ? 'background-color: #082b59; color: white; font-weight: 700;' : 'color: #111827; font-weight: 500;'">
                <i class="bi bi-bookmark-fill me-3"></i> Saved Items
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-12 col-lg-10">
        
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div class="position-relative flex-grow-1" style="max-width: 500px;">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
            <input type="text" v-model="searchQuery" class="form-control ps-5 w-100 bg-light border-0 fw-medium" placeholder="Search textbooks, tech, or dorm gear...">
          </div>
          <button @click="router.push('/dashboard')" class="py-2 px-4 d-flex align-items-center gap-2 btn fw-bold rounded-pill" style="background-color: #082b59; color: white;">
            <i class="bi bi-plus-circle-fill"></i> Post an Item
          </button>
        </div>

        <div v-if="topSellers.length > 0 && currentView === 'feed'" class="mb-5">
          <h6 class="fw-bold text-dark text-uppercase mb-3" style="letter-spacing: 0.05em;"><i class="bi bi-stars text-warning me-2"></i> Top Campus Sellers</h6>
          <div class="d-flex gap-4 overflow-auto pb-2" style="-ms-overflow-style: none; scrollbar-width: none;">
            <div v-for="seller in topSellers" :key="seller.id" @click="router.push(`/profile/${seller.id}`)" class="text-center vendor-bubble" style="cursor: pointer; min-width: 90px;">
              <div class="rounded-circle mx-auto mb-2 shadow-sm d-flex justify-content-center align-items-center" style="width: 70px; height: 70px; border: 3px solid #082b59; padding: 2px;">
                <img :src="seller.profile_image || `https://ui-avatars.com/api/?name=${seller.business_name || 'Vendor'}&background=e9ecef&color=082b59`" class="rounded-circle w-100 h-100 object-fit-cover">
              </div>
              <p class="small fw-bold text-dark text-truncate mb-0 px-1" style="font-size: 0.75rem;">{{ seller.business_name || 'Verified Vendor' }}</p>
            </div>
          </div>
        </div>

        <div class="d-flex overflow-auto pb-2 mb-4 gap-2" style="-ms-overflow-style: none; scrollbar-width: none;">
          <button @click="currentView = 'feed'; activeCategory = 'All'" class="btn rounded-pill px-4 text-nowrap" :class="currentView === 'feed' && activeCategory === 'All' ? 'bg-dark text-white fw-bold' : 'bg-white border text-dark fw-medium'">All Items</button>
          
          <button v-if="currentUser" @click="currentView = 'listings'; activeCategory = 'All'" class="btn rounded-pill px-4 text-nowrap" :class="currentView === 'listings' ? 'bg-dark text-white fw-bold' : 'bg-white border text-dark fw-medium'"><i class="bi bi-shop me-1"></i> My Listings</button>
          <button @click="currentView = 'saved'; activeCategory = 'All'" class="btn rounded-pill px-4 text-nowrap" :class="currentView === 'saved' ? 'bg-dark text-white fw-bold' : 'bg-white border text-dark fw-medium'"><i class="bi bi-bookmark-fill me-1"></i> Saved Items</button>
          
          <button v-for="cat in uniqueCategories" :key="cat" @click="currentView = 'feed'; activeCategory = cat" class="btn rounded-pill px-4 text-nowrap" :class="currentView === 'feed' && activeCategory === cat ? 'bg-dark text-white fw-bold' : 'bg-white border text-dark fw-medium'">
            {{ cat }}
          </button>
        </div>

        <h4 v-if="currentView === 'listings'" class="mb-4 fw-bold" style="color: #082b59;">My Active Listings</h4>
        <h4 v-if="currentView === 'saved'" class="mb-4 fw-bold" style="color: #082b59;">Saved Items</h4>

        <div v-if="displayedProducts.length === 0" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-secondary mb-3 d-block"></i>
          <h5 class="fw-bold" style="color: #111827;">Nothing here yet.</h5>
        </div>

        <div v-else class="row g-2 g-md-4">
          <div v-for="product in displayedProducts" :key="product.id" class="col-4 col-lg-2">
            
            <div class="h-100 d-flex flex-column overflow-hidden position-relative product-card" @click="product.stock > 0 ? router.push(`/product/${product.id}`) : null" :style="product.stock > 0 ? 'cursor: pointer; background: #ffffff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);' : 'cursor: not-allowed; background: #f8f9fa; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);'">
              
              <button @click.stop="toggleSaved(product.id)" class="btn position-absolute top-0 start-0 m-1 rounded-circle shadow-sm d-flex justify-content-center align-items-center bg-white" style="width: 28px; height: 28px; z-index: 10;">
                <i class="bi fs-6" :class="savedItemIds.includes(product.id) ? 'bi-bookmark-fill text-danger' : 'bi-bookmark text-secondary'"></i>
              </button>

              <div class="position-relative bg-light">
                <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/400'" class="w-100 object-fit-cover" style="height: 120px;" :style="product.stock <= 0 ? 'opacity: 0.5; filter: grayscale(80%);' : ''">
                
                <span v-if="product.stock <= 0" class="badge bg-dark text-white position-absolute top-0 end-0 m-2 shadow-sm compact-badge">SOLD OUT</span>
                <span v-else class="badge bg-white text-dark border position-absolute bottom-0 start-0 m-2 shadow-sm compact-badge">Stock: {{ product.stock }}</span>
              </div>
              
              <div class="p-2 d-flex flex-column flex-grow-1 bg-white" :style="product.stock <= 0 ? 'opacity: 0.7;' : ''">
                <h3 class="mb-1 text-truncate text-dark fw-bold compact-title">{{ product.title }}</h3>
                <div class="d-flex align-items-center mb-1">
                  <div class="text-warning small me-1 d-flex" style="font-size: 0.65rem;">
                    <i v-for="n in 5" :key="n" class="bi" :class="n <= Math.round(product.avgRating) ? 'bi-star-fill' : 'bi-star'"></i>
                  </div>
                  <span class="text-secondary fw-bold" style="font-size: 0.65rem;">({{ product.reviews?.length || 0 }})</span>
                </div>
                <h2 class="mb-2 mt-auto text-danger fw-black compact-price">₦{{ Number(product.price).toLocaleString() }}</h2>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([])
const topSellers = ref([])
const loading = ref(true)
const currentUser = ref(null)
const isUserVerified = ref(false) 
const userRole = ref('buyer') 
let localRealtimeChannel = null

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

    localRealtimeChannel = supabase.channel('shop_auth_alerts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser.value.id}` }, (payload) => {
        if (payload.new.is_verified && !isUserVerified.value) {
          window.location.reload();
        }
      }).subscribe()
  }

  savedItemIds.value = JSON.parse(localStorage.getItem('num_bazaar_saved') || '[]')

  if (!currentUser.value || isUserVerified.value || userRole.value === 'admin') {
    
    const { data: prodData } = await supabase
      .from('products')
      .select(`*, profiles(id, business_name, profile_image), reviews(rating)`)
      .eq('is_approved', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    products.value = prodData?.map(p => {
      const avgRating = p.reviews?.length > 0 ? (p.reviews.reduce((acc, rev) => acc + rev.rating, 0) / p.reviews.length).toFixed(1) : 0;
      return { ...p, avgRating }
    }) || []

    const { data: orders } = await supabase.from('orders').select('seller_id').ilike('status', '%Completed%')
    
    if (orders && orders.length > 0) {
      const counts = {}
      orders.forEach(o => counts[o.seller_id] = (counts[o.seller_id] || 0) + 1)
      const topSellerIds = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0,5).map(e => e[0])
      
      if (topSellerIds.length > 0) {
        const { data: sellers } = await supabase.from('profiles').select('id, business_name, profile_image').in('id', topSellerIds)
        topSellers.value = topSellerIds.map(id => sellers.find(s => s.id === id)).filter(Boolean)
      }
    }
  }
  loading.value = false
})

onUnmounted(() => { if (localRealtimeChannel) supabase.removeChannel(localRealtimeChannel) })

const toggleSaved = (id) => {
  if (savedItemIds.value.includes(id)) savedItemIds.value = savedItemIds.value.filter(itemId => itemId !== id)
  else savedItemIds.value.push(id)
  localStorage.setItem('num_bazaar_saved', JSON.stringify(savedItemIds.value))
}

// DYNAMIC CATEGORY EXTRACTION
const uniqueCategories = computed(() => {
  // Extract all categories, filter out empties, make unique, and sort alphabetically
  const categories = products.value.map(p => p.category).filter(c => c && c.trim() !== '')
  return [...new Set(categories)].sort()
})

const displayedProducts = computed(() => {
  let filtered = products.value
  
  if (currentView.value === 'listings') filtered = filtered.filter(p => p.seller_id === currentUser.value?.id)
  else if (currentView.value === 'saved') filtered = filtered.filter(p => savedItemIds.value.includes(p.id))

  // FILTERING LOGIC FIXED: Checks exact category match dynamically
  if (activeCategory.value !== 'All' && currentView.value === 'feed') {
    filtered = filtered.filter(p => p.category === activeCategory.value)
  }

  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => p.title.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query))
  }

  return filtered
})

const requestENTFastTrack = () => {
  // You will replace this with the actual Admin WhatsApp number
  const adminWhatsAppNumber = "234XXXXXXXXXX"; 
  
  const username = profileData.value?.username || currentUser.value?.email || "Student";
  const businessName = profileData.value?.business_name || "N/A";
  
  const message = `Hello Admin, I am an ENT211 student. My username is *${username}* and my business name is *${businessName}*. I need a force verification so I can list my products for the Wednesday exhibition.`;
  
  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};
</script>

<style scoped>
div[style*="overflow-auto"]::-webkit-scrollbar { display: none; }
.product-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.product-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
.compact-title { font-size: 0.95rem; }
.compact-price { font-size: 1.1rem; }
.compact-seller { font-size: 0.65rem; }
.compact-badge { font-size: 0.55rem; padding: 4px 6px; }
.vendor-bubble { transition: transform 0.2s ease; }
.vendor-bubble:hover { transform: scale(1.05); }
</style>