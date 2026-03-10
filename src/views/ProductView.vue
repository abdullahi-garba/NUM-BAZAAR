<template>
  <div class="container py-5 mt-4">
    <div v-if="!product" class="text-center py-5"><div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div></div>

    <div v-else class="row g-5">
      <div class="col-lg-6">
        <div :id="'carousel-' + product.id" class="carousel slide shadow-lg rounded-5 overflow-hidden bg-white" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div v-for="(img, idx) in product.image_urls" :key="idx" :class="['carousel-item', { active: idx === 0 }]">
              <img :src="img" class="d-block w-100" style="height: 550px; object-fit: cover; background-color: #f8f9fa;">
            </div>
          </div>
          <button v-if="product.image_urls.length > 1" class="carousel-control-prev" type="button" :data-bs-target="'#carousel-' + product.id" data-bs-slide="prev"><span class="carousel-control-prev-icon bg-dark rounded-circle p-3 shadow"></span></button>
          <button v-if="product.image_urls.length > 1" class="carousel-control-next" type="button" :data-bs-target="'#carousel-' + product.id" data-bs-slide="next"><span class="carousel-control-next-icon bg-dark rounded-circle p-3 shadow"></span></button>
        </div>
      </div>

      <div class="col-lg-6 d-flex flex-column">
        <div class="mb-2 d-flex gap-2">
          <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill">{{ product.category }}</span>
          <span class="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill"><i class="bi bi-shield-check"></i> Escrow Ready</span>
        </div>
        
        <h1 class="fw-black mb-3 text-dark" style="font-size: 2.5rem; letter-spacing: -1px;">{{ product.title }}</h1>
        <h2 class="fw-black mb-4" style="color: #800000; font-size: 2.2rem;">₦{{ Number(product.price).toLocaleString() }}</h2>
        
        <div class="bg-white p-4 rounded-4 shadow-sm mb-4 border-0">
          <h6 class="fw-bold text-dark mb-3 border-bottom pb-2">Description</h6>
          <p class="text-muted fs-6 mb-0" style="line-height: 1.8;">{{ product.description }}</p>
        </div>

        <div class="d-flex align-items-center bg-light p-3 rounded-4 mb-5 border">
          <div class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" style="width: 50px; height: 50px; font-size: 1.5rem; background-color: #082b59 !important;">S</div>
          <div><h6 class="fw-bold mb-0 text-dark">Verified Seller</h6><small class="text-muted">100% Reliability Score</small></div>
        </div>

        <div class="mt-auto">
          <button @click="addToCart" class="btn btn-primary btn-lg w-100 fw-bold py-3 rounded-pill shadow-lg" style="background-color: #082b59; border: none; font-size: 1.2rem;">
            <i class="bi bi-cart-plus me-2"></i> Add to Escrow Cart
          </button>
        </div>
      </div>
    </div>

    <div v-if="product" class="row mt-5 pt-5 border-top">
      <div class="col-12"><h3 class="fw-black text-dark mb-4">Customer Reviews</h3></div>
      
      <div class="col-lg-4">
        <div class="card bg-white border-0 shadow-sm rounded-4 p-4 text-center sticky-top" style="top: 100px;">
          <h1 class="display-3 fw-black text-dark mb-0">{{ averageRating > 0 ? averageRating : 'N/A' }}</h1>
          <div class="text-warning fs-4 mb-2">
            <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-half"></i>
          </div>
          <p class="text-muted fw-bold">Based on {{ reviews.length }} verified purchases</p>
        </div>
      </div>
      
      <div class="col-lg-8">
        <div v-if="reviews.length === 0" class="text-center text-muted p-5 bg-light rounded-4">
           <i class="bi bi-chat-square-text fs-1 d-block mb-3"></i><h5>No reviews yet for this product.</h5>
        </div>
        
        <div v-else v-for="rev in reviews" :key="rev.id" class="card bg-white border-0 shadow-sm rounded-4 p-4 mb-3">
          <div class="d-flex justify-content-between mb-2">
            <span class="fw-bold text-dark d-flex align-items-center">
               <img :src="rev.profiles.profile_image || 'https://via.placeholder.com/30'" class="rounded-circle me-2" style="width: 30px; height: 30px; object-fit: cover;">
               {{ rev.profiles.first_name }} {{ rev.profiles.last_name }}
            </span>
            <span class="text-warning">
              <i v-for="n in rev.rating" :key="n" class="bi bi-star-fill"></i>
              <i v-for="n in (5 - rev.rating)" :key="'empty'+n" class="bi bi-star text-muted opacity-25"></i>
            </span>
          </div>
          <p class="text-muted mb-1">{{ rev.comment }}</p>
          <small class="text-muted" style="font-size: 0.75rem;">{{ new Date(rev.created_at).toLocaleDateString() }}</small>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'; 
import { useRoute, useRouter } from 'vue-router'; 
import { supabase } from '../lib/supabaseClient'

const route = useRoute(); const router = useRouter(); 
const product = ref(null); const reviews = ref([]);

onMounted(async () => {
  const { data: pData } = await supabase.from('products').select('*').eq('id', route.params.id).single()
  product.value = pData
  const { data: rData } = await supabase.from('reviews').select('*, profiles(first_name, last_name, profile_image)').eq('product_id', route.params.id).order('created_at', { ascending: false })
  if (rData) reviews.value = rData
})

const averageRating = computed(() => {
  if(reviews.value.length === 0) return 0;
  const sum = reviews.value.reduce((acc, rev) => acc + rev.rating, 0);
  return (sum / reviews.value.length).toFixed(1);
})

const addToCart = () => {
  let cart = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
  cart.push(product.value); localStorage.setItem('num_bazaar_cart', JSON.stringify(cart)); router.push('/cart')
}
</script>