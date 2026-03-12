<template>
  <div class="container py-5 mt-4">
    
    <button @click="router.back()" class="btn btn-light fw-bold rounded-pill mb-4 shadow-sm px-4">
      <i class="bi bi-arrow-left me-2"></i>Back to Feed
    </button>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
    </div>

    <div v-else-if="!product" class="text-center py-5">
      <i class="bi bi-exclamation-circle text-danger fs-1 mb-3 d-block"></i>
      <h3 class="fw-bold">Product Not Found</h3>
      <p class="text-muted">This item may have been deleted or removed by the admin.</p>
    </div>

    <div v-else class="row g-5">
      
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white sticky-top" style="top: 100px;">
          <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/600'" class="w-100 object-fit-cover" style="height: 500px;" alt="Product Image">
        </div>
      </div>

      <div class="col-lg-6">
        <div class="mb-2">
          <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill fw-bold">{{ product.category }}</span>
          <span v-if="product.stock > 0" class="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill fw-bold ms-2">In Stock: {{ product.stock }}</span>
          <span v-else class="badge bg-danger-subtle text-danger border border-danger px-3 py-2 rounded-pill fw-bold ms-2">Out of Stock</span>
        </div>
        
        <h1 class="fw-black text-dark mb-3" style="font-size: 2.5rem;">{{ product.title }}</h1>
        <h2 class="fw-black text-danger mb-4">₦{{ Number(product.price).toLocaleString() }}</h2>
        
        <p class="text-muted lead mb-4" style="white-space: pre-line;">{{ product.description }}</p>

        <div class="card bg-light border-0 rounded-4 p-4 mb-4">
          <h6 class="fw-bold text-muted text-uppercase mb-3 small">Sold By</h6>
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <img :src="product.profiles?.profile_image || 'https://via.placeholder.com/50'" class="rounded-circle object-fit-cover shadow-sm me-3 border border-2 border-white" style="width: 50px; height: 50px;">
              <div>
                <h6 class="fw-bold mb-0 text-dark">{{ product.profiles?.business_name || product.profiles?.first_name || 'Verified Vendor' }}</h6>
                <router-link :to="`/profile/${product.seller_id}`" class="text-primary small text-decoration-none fw-bold">@{{ product.profiles?.username || 'vendor' }}</router-link>
              </div>
            </div>
            <router-link :to="`/messages?user=${product.seller_id}`" class="btn btn-outline-dark btn-sm rounded-pill fw-bold px-3">
              <i class="bi bi-chat-dots-fill me-1"></i> Message
            </router-link>
          </div>
        </div>

        <button @click="addToCart" class="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow py-3 mt-2" :disabled="product.stock < 1" style="background-color: #082b59; border: none;">
          <i class="bi bi-cart-plus-fill me-2 fs-5"></i>
          {{ product.stock > 0 ? 'Add to Escrow Cart' : 'Currently Unavailable' }}
        </button>

        <div class="alert alert-warning mt-4 rounded-4 border-0 bg-warning-subtle text-warning-emphasis fw-bold text-center">
          <i class="bi bi-shield-lock-fill me-2"></i>
          Your money is protected by Escrow until you confirm delivery.
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const router = useRouter()
const product = ref(null)
const isLoading = ref(true)

const fetchProduct = async () => {
  isLoading.value = true
  try {
    const productId = route.params.id
    const { data, error } = await supabase
      .from('products')
      .select(`*, profiles(username, business_name, first_name, profile_image)`)
      .eq('id', productId)
      .single()
      
    if (error) throw error
    product.value = data
  } catch (error) {
    console.error("Error fetching product:", error)
  } finally {
    isLoading.value = false
  }
}

const addToCart = () => {
  try {
    // Get existing cart from local storage
    let cart = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
    
    // Check if product is already in the cart
    const exists = cart.some(item => item.id === product.value.id)
    if (exists) {
      alert("This item is already in your cart!")
      return router.push('/cart')
    }

    // Add to cart and save
    cart.push(product.value)
    localStorage.setItem('num_bazaar_cart', JSON.stringify(cart))
    
    // Trigger a window event so the Navbar cart counter updates instantly
    window.dispatchEvent(new Event('storage'))
    
    // Redirect to Cart page
    router.push('/cart')
  } catch (error) {
    alert("Could not add item to cart. Please ensure you have local storage enabled.")
  }
}

onMounted(() => {
  fetchProduct()
})
</script>