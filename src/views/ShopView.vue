<template>
  <div class="container shop-container pb-5 mt-4">
    
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div><h2 class="fw-black mb-0" style="color: #082b59; font-size: 2.2rem;">Campus Feed</h2></div>
      
      <div class="input-group border border-2 rounded-pill overflow-hidden bg-white shadow-sm" style="max-width: 400px;">
        <span class="input-group-text bg-white border-0 ps-3"><i class="bi bi-search text-muted"></i></span>
        <input type="text" class="form-control border-0 shadow-none" placeholder="Search laptops, food, keywords..." v-model="searchQuery">
      </div>

      <button v-if="['seller', 'admin'].includes(userRole)" @click="showUploadForm = !showUploadForm" class="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm" style="background-color: #082b59; border: none;">
        <i class="bi" :class="showUploadForm ? 'bi-x-lg' : 'bi-plus-lg'"></i> {{ showUploadForm ? 'Close Setup' : 'Sell an Item' }}
      </button>
    </div>

    <div class="filter-scroll-wrapper mb-5 pb-2">
      <div class="d-flex gap-2 filter-scroll">
        <button v-for="cat in ['All', 'Food & Beverages', 'IT & Tech', 'Fashion & Clothing', 'Services', 'Textbooks', 'Raw Materials', 'Other']" :key="cat" 
          @click="selectedCategory = cat" class="btn rounded-pill px-4 fw-bold shadow-sm" :class="selectedCategory === cat ? 'btn-dark' : 'btn-white bg-white border'">
          {{ cat }}
        </button>
      </div>
    </div>

    <div v-if="['seller', 'admin'].includes(userRole) && showUploadForm" class="card shadow-lg border-0 rounded-4 mb-5 bg-white overflow-hidden">
      <div class="card-header bg-dark text-white p-4 border-0"><h5 class="fw-bold mb-0"><i class="bi bi-box-seam me-2"></i>New Listing Setup</h5></div>
      
      <div v-if="!hasActiveSubscription && userRole !== 'admin'" class="card-body p-5 text-center">
        <i class="bi bi-lock-fill text-danger fs-1 mb-3 d-block"></i>
        <h4 class="fw-bold">Storefront Locked</h4>
        <p class="text-muted mb-4">You need an active 30-day seller subscription to upload new merchandise.</p>
        <router-link to="/dashboard" class="btn btn-primary fw-bold rounded-pill px-5" style="background-color: #082b59; border: none;">Go to Verification Hub</router-link>
      </div>

      <div v-else class="card-body p-4 p-md-5">
        <form @submit.prevent="publishProduct" class="row g-4">
          <div class="col-md-6"><label class="fw-bold text-muted small text-uppercase">Product Title</label><input type="text" class="form-control form-control-lg bg-light border-0" v-model="newProduct.name" required></div>
          <div class="col-md-3"><label class="fw-bold text-muted small text-uppercase">Price (₦)</label><input type="number" class="form-control form-control-lg bg-light border-0" v-model="newProduct.price" required></div>
          <div class="col-md-3">
            <label class="fw-bold text-muted small text-uppercase">Category</label>
            <select class="form-select form-select-lg bg-light border-0" v-model="newProduct.category" required>
              <option>Food & Beverages</option><option>IT & Tech</option><option>Fashion & Clothing</option><option>Textbooks</option><option>Services</option><option>Other</option>
            </select>
          </div>
          <div class="col-md-6"><label class="fw-bold text-muted small text-uppercase">Upload Images</label><input type="file" class="form-control form-control-lg bg-light border-0" @change="e => imageFiles = Array.from(e.target.files)" accept="image/*" multiple required></div>
          <div class="col-md-6"><label class="fw-bold text-muted small text-uppercase">Search Tags (Comma separated)</label><input type="text" class="form-control form-control-lg bg-light border-0" v-model="newProduct.tagsStr" placeholder="e.g. macbook, laptop, used"></div>
          <div class="col-12"><label class="fw-bold text-muted small text-uppercase">Detailed Description</label><textarea class="form-control bg-light border-0" v-model="newProduct.description" rows="2" required></textarea></div>
          <div class="col-12 text-end"><button type="submit" class="btn btn-primary btn-lg fw-bold px-5 rounded-pill shadow" :disabled="isUploading" style="background-color: #082b59; border: none;">{{ isUploading ? 'Uploading...' : 'Push to Live Feed' }}</button></div>
        </form>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div></div>
    
    <div v-else-if="filteredProducts.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-search fs-1 mb-3 d-block"></i><h4>No items found for your search.</h4>
    </div>

    <div v-else class="row g-4">
      <div v-for="product in filteredProducts" :key="product.id" class="col-md-6 col-lg-4 col-xl-3">
        <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden product-card bg-white">
          <div :id="'carousel-' + product.id" class="carousel slide position-relative" data-bs-ride="false">
            <div class="carousel-inner">
              <div v-for="(img, idx) in product.image_urls" :key="idx" :class="['carousel-item', { active: idx === 0 }]"><img :src="img" class="d-block w-100 product-img"></div>
            </div>
            <button v-if="product.image_urls.length > 1" class="carousel-control-prev" type="button" :data-bs-target="'#carousel-' + product.id" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
            <button v-if="product.image_urls.length > 1" class="carousel-control-next" type="button" :data-bs-target="'#carousel-' + product.id" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
          </div>
          
          <div class="card-body d-flex flex-column p-4">
            <span class="badge bg-light text-secondary border mb-2 align-self-start">{{ product.category }}</span>
            <div class="d-flex justify-content-between align-items-start mb-1"><h5 class="card-title fw-bold mb-0 text-truncate pe-2 text-dark">{{ product.title }}</h5></div>
            <h4 class="text-danger fw-black mb-3" style="color: #800000 !important;">₦{{ product.price.toLocaleString() }}</h4>
            <p class="card-text text-muted small flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{ product.description }}</p>
            <router-link :to="`/product/${product.id}`" class="btn btn-outline-dark w-100 fw-bold mt-3 rounded-pill">View Details</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const products = ref([]); const isLoading = ref(true); const isUploading = ref(false)
const currentUser = ref(null); const userRole = ref('buyer'); const showUploadForm = ref(false)
const hasActiveSubscription = ref(false)
const newProduct = ref({ name: '', price: '', category: 'Other', description: '', tagsStr: '' }); const imageFiles = ref([])

const searchQuery = ref(''); const selectedCategory = ref('All')

const fetchProducts = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session) {
    currentUser.value = sessionData.session.user
    
    // FETCH EXPIRY DATE
    const { data: profile } = await supabase.from('profiles').select('role, is_subscribed, subscription_expires_at').eq('id', sessionData.session.user.id).single()
    if (profile) {
      userRole.value = profile.role
      
      // CHECK IF ACTIVE AND IN THE FUTURE
      hasActiveSubscription.value = profile.is_subscribed && profile.subscription_expires_at && (new Date(profile.subscription_expires_at) > new Date());
    }
  }
  const { data } = await supabase.from('products').select('*').eq('is_approved', true).order('created_at', { ascending: false })
  if (data) products.value = data
  isLoading.value = false
}

const filteredProducts = computed(() => {
  let filtered = products.value;
  if (selectedCategory.value !== 'All') filtered = filtered.filter(p => p.category === selectedCategory.value);
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q))));
  }
  return filtered;
})

const publishProduct = async () => {
  if (imageFiles.value.length === 0) return alert("Select at least one image.")
  isUploading.value = true
  try {
    let uploadedUrls = []
    for (const file of imageFiles.value) {
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${file.name.split('.').pop()}`
      await supabase.storage.from('product-images').upload(fileName, file)
      uploadedUrls.push(supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl)
    }
    
    const tagsArray = newProduct.value.tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    await supabase.from('products').insert([{ title: newProduct.value.name, price: Number(newProduct.value.price), category: newProduct.value.category, description: newProduct.value.description, tags: tagsArray, image_urls: uploadedUrls, seller_id: currentUser.value.id }])
    showUploadForm.value = false; alert("Listed! Waiting for Admin Approval.")
    await fetchProducts()
  } catch (error) { alert(error.message) } finally { isUploading.value = false }
}
onMounted(() => fetchProducts())
</script>

<style scoped>
.filter-scroll-wrapper { overflow-x: auto; scrollbar-width: none; }
.filter-scroll-wrapper::-webkit-scrollbar { display: none; }
.filter-scroll { white-space: nowrap; padding-bottom: 5px; }
.product-card { transition: all 0.3s ease; border: 1px solid rgba(0,0,0,0.05) !important; }
.product-card:hover { transform: translateY(-8px); box-shadow: 0 1rem 3rem rgba(0,0,0,0.1) !important; }
.product-img { height: 240px; object-fit: cover; background-color: #f8f9fa; }
</style>

