<template>
  <div class="container shop-container pb-5 mt-4">
    
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 border-bottom pb-3">
      <div><h2 class="fw-black mb-0" style="color: #082b59; font-size: 2.2rem;">Campus Feed</h2></div>
    </div>

    <div class="row g-4">
      <div class="col-lg-3">
        <div class="card shadow-sm border-0 rounded-4 bg-white p-4 sticky-top" style="top: 100px;">
          <h5 class="fw-bold mb-4 border-bottom pb-2">Search & Filters</h5>
          
          <div class="mb-4">
            <label class="form-label fw-bold text-muted small text-uppercase">Keyword Search</label>
            <div class="input-group border border-2 rounded-pill overflow-hidden bg-light">
              <span class="input-group-text bg-light border-0 ps-3"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control bg-light border-0 shadow-none" placeholder="Laptops, food..." v-model="searchQuery">
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold text-muted small text-uppercase">Category</label>
            <select class="form-select border-2 bg-light rounded-3" v-model="selectedCategory">
              <option value="All">All Categories</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="IT & Tech">IT & Tech</option>
              <option value="Fashion & Clothing">Fashion & Clothing</option>
              <option value="Textbooks">Textbooks</option>
              <option value="Services">Services</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold text-muted small text-uppercase">Price Range (₦)</label>
            <div class="d-flex gap-2">
              <input type="number" class="form-control bg-light border-2 rounded-3" placeholder="Min" v-model="minPrice">
              <input type="number" class="form-control bg-light border-2 rounded-3" placeholder="Max" v-model="maxPrice">
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold text-muted small text-uppercase">Sort By</label>
            <select class="form-select border-2 bg-light rounded-3" v-model="sortBy">
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <button @click="clearFilters" class="btn btn-outline-danger w-100 fw-bold rounded-pill mt-2">Clear All Filters</button>
        </div>
      </div>

      <div class="col-lg-9">
        <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div></div>
        
        <div v-else-if="filteredProducts.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted bg-white">
          <i class="bi bi-search fs-1 mb-3 d-block"></i>
          <h4>No items match your filters.</h4>
          <p>Try broadening your search or clearing your filters.</p>
        </div>

        <div v-else class="row g-4">
          <div v-for="product in filteredProducts" :key="product.id" class="col-md-6 col-xl-4">
            <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden product-card bg-white position-relative">
              
              <div :id="'carousel-' + product.id" class="carousel slide position-relative" data-bs-ride="false">
                <div class="carousel-inner">
                  <div v-for="(img, idx) in product.image_urls" :key="idx" :class="['carousel-item', { active: idx === 0 }]">
                    <img :src="img" class="d-block w-100 product-img">
                  </div>
                </div>
                <button v-if="product.image_urls.length > 1" class="carousel-control-prev" type="button" :data-bs-target="'#carousel-' + product.id" data-bs-slide="prev" @click.stop><span class="carousel-control-prev-icon"></span></button>
                <button v-if="product.image_urls.length > 1" class="carousel-control-next" type="button" :data-bs-target="'#carousel-' + product.id" data-bs-slide="next" @click.stop><span class="carousel-control-next-icon"></span></button>
              </div>
              
              <div class="card-body d-flex flex-column p-4">
                <span class="badge bg-light text-secondary border mb-2 align-self-start">{{ product.category }}</span>
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <h5 class="card-title fw-bold mb-0 text-truncate pe-2 text-dark">{{ product.title }}</h5>
                </div>
                <h4 class="text-danger fw-black mb-3" style="color: #800000 !important;">₦{{ product.price.toLocaleString() }}</h4>
                <p class="card-text text-muted small flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{ product.description }}</p>
                
                <router-link :to="`/product/${product.id}`" class="btn btn-outline-dark w-100 fw-bold mt-3 rounded-pill position-relative" style="z-index: 2;">View Details</router-link>
              </div>

              <router-link :to="`/product/${product.id}`" class="position-absolute top-0 start-0 w-100 h-100" style="z-index: 1;"></router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const products = ref([]); const isLoading = ref(true);

const searchQuery = ref(''); const selectedCategory = ref('All'); 
const minPrice = ref(null); const maxPrice = ref(null); const sortBy = ref('newest')

const fetchProducts = async () => {
  isLoading.value = true
  const { data } = await supabase.from('products').select('*').eq('is_approved', true).order('created_at', { ascending: false })
  if (data) products.value = data
  isLoading.value = false
}

const filteredProducts = computed(() => {
  let result = products.value;
  if (selectedCategory.value !== 'All') result = result.filter(p => p.category === selectedCategory.value);
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => p.title.toLowerCase().includes(q) || (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q))));
  }
  if (minPrice.value !== null && minPrice.value !== '') result = result.filter(p => p.price >= Number(minPrice.value));
  if (maxPrice.value !== null && maxPrice.value !== '') result = result.filter(p => p.price <= Number(maxPrice.value));
  if (sortBy.value === 'newest') result = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  else if (sortBy.value === 'price_asc') result = result.sort((a, b) => a.price - b.price);
  else if (sortBy.value === 'price_desc') result = result.sort((a, b) => b.price - a.price);
  return result;
})

const clearFilters = () => {
  searchQuery.value = ''; selectedCategory.value = 'All'; minPrice.value = null; maxPrice.value = null; sortBy.value = 'newest';
}

onMounted(() => fetchProducts())
</script>

<style scoped>
.product-card { transition: all 0.3s ease; border: 1px solid rgba(0,0,0,0.05) !important; }
.product-card:hover { transform: translateY(-8px); box-shadow: 0 1rem 3rem rgba(0,0,0,0.1) !important; }
.product-img { height: 240px; object-fit: cover; background-color: #f8f9fa; }
</style>