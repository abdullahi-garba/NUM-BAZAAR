<template>
  <div class="container py-5 mt-4">
    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    
    <div v-else-if="!product" class="text-center py-5">
      <h3 class="fw-bold text-muted">Product Not Found</h3>
      <router-link to="/shop" class="btn btn-primary mt-3 rounded-pill px-4">Back to Feed</router-link>
    </div>

    <div v-else class="row g-5">
      <div class="col-lg-7">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
          <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
            
            <div class="carousel-indicators" v-if="product.image_urls.length > 1">
              <button v-for="(img, idx) in product.image_urls" :key="'ind-'+idx" type="button" data-bs-target="#productCarousel" :data-bs-slide-to="idx" :class="{ active: idx === 0 }"></button>
            </div>
            
            <div class="carousel-inner bg-light" style="height: 500px;">
              <div v-for="(img, idx) in product.image_urls" :key="idx" :class="['carousel-item h-100', { active: idx === 0 }]">
                <img :src="img" class="d-block w-100 h-100" style="object-fit: contain;">
              </div>
            </div>
            
            <button v-if="product.image_urls.length > 1" class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon bg-dark rounded-circle p-3 shadow"></span>
            </button>
            <button v-if="product.image_urls.length > 1" class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
              <span class="carousel-control-next-icon bg-dark rounded-circle p-3 shadow"></span>
            </button>
            
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <span class="badge bg-light text-secondary border px-3 py-2 mb-3 rounded-pill">{{ product.category }}</span>
        <h1 class="fw-black text-dark mb-2">{{ product.title }}</h1>
        <h2 class="fw-black mb-4" style="color: #800000;">₦{{ Number(product.price).toLocaleString() }}</h2>
        
        <p class="fs-6 text-muted mb-4" style="line-height: 1.8;">{{ product.description }}</p>

        <div class="d-flex flex-wrap gap-2 mb-5" v-if="product.tags && product.tags.length > 0">
          <span v-for="tag in product.tags" :key="tag" class="badge bg-light text-muted border">#{{ tag }}</span>
        </div>

        <button @click="addToCart" class="btn btn-primary btn-lg w-100 fw-bold rounded-pill py-3 shadow mb-4" style="background-color: #082b59; border: none;">
          <i class="bi bi-cart-plus-fill me-2"></i> Add to Escrow Cart
        </button>

        <div v-if="seller" class="card bg-light border-0 rounded-4 p-4 mt-4">
          <h6 class="fw-bold text-muted text-uppercase small mb-3">Sold By</h6>
          <div class="d-flex align-items-center mb-3">
            <img :src="seller.profile_image || 'https://via.placeholder.com/60'" class="rounded-circle me-3 border border-2 border-white shadow-sm" style="width: 60px; height: 60px; object-fit: cover;">
            <div>
              <h6 class="fw-bold mb-0 text-dark">{{ seller.business_name || seller.first_name }}</h6>
              <small class="text-muted">@{{ seller.username }}</small>
            </div>
          </div>
          <router-link :to="`/vendor/${seller.id}`" class="btn btn-outline-dark btn-sm fw-bold rounded-pill w-100">View Vendor Profile</router-link>
        </div>
      </div>
    </div>
    
    <div class="row mt-5 pt-4 border-top">
      <div class="col-12">
        <h4 class="fw-black mb-4"><i class="bi bi-star-half text-warning me-2"></i>Verified Reviews</h4>
        <div v-if="reviews.length === 0" class="text-muted bg-white p-5 rounded-4 shadow-sm text-center">
          No reviews for this item yet. Buyers can leave a review after escrow is cleared.
        </div>
        <div v-else class="row g-4">
          <div v-for="review in reviews" :key="review.id" class="col-md-6">
            <div class="card bg-white border-0 shadow-sm rounded-4 p-4 h-100">
              <div class="d-flex justify-content-between mb-2">
                <div class="text-warning fw-bold">
                  <span v-for="n in review.rating" :key="'s'+n">★</span><span v-for="n in (5 - review.rating)" :key="'e'+n" class="text-light">★</span>
                </div>
                <small class="text-muted">{{ new Date(review.created_at).toLocaleDateString() }}</small>
              </div>
              <p class="mb-0 text-dark">"{{ review.comment }}"</p>
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
const productId = route.params.id
const isLoading = ref(true)
const product = ref(null)
const seller = ref(null)
const reviews = ref([])

const fetchProductData = async () => {
  isLoading.value = true
  
  const { data: prodData } = await supabase.from('products').select('*').eq('id', productId).single()
  if (prodData) {
    product.value = prodData
    
    const { data: sellerData } = await supabase.from('profiles').select('*').eq('id', prodData.seller_id).single()
    seller.value = sellerData

    const { data: reviewData } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false })
    reviews.value = reviewData || []
  }
  
  isLoading.value = false
}

const addToCart = () => {
  let cart = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
  // Check if item already exists to prevent duplicates (optional, but good UX)
  if (cart.some(item => item.id === product.value.id)) {
    return alert("Item is already in your cart!")
  }
  cart.push(product.value)
  localStorage.setItem('num_bazaar_cart', JSON.stringify(cart))
  // Dispatch event so the navbar instantly updates the red badge
  window.dispatchEvent(new Event('storage'))
  alert('Added to Cart securely!')
}

onMounted(() => fetchProductData())
</script>