<template>
  <div class="bg-light min-vh-100 py-5">
    <div class="container px-lg-5">
      
      <button @click="router.back()" class="btn btn-link text-dark text-decoration-none fw-bold px-0 mb-4">
        <i class="bi bi-arrow-left me-2"></i> Back to Feed
      </button>

      <div v-if="loading" class="text-center py-5"><div class="spinner-border" style="color: #b22b1d;"></div></div>
      
      <div v-else-if="!product" class="text-center py-5">
        <h3 class="fw-bold text-dark">Product Not Found</h3>
        <p class="text-secondary">This item may have been removed by the seller or admin.</p>
      </div>

      <div v-else class="row g-5">
        
        <div class="col-lg-6">
          <div class="bg-white p-2 shadow-sm rounded-4 border" style="border-color: rgba(0,0,0,0.05);">
            <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/600'" class="w-100 object-fit-cover rounded-3" style="height: 450px;">
          </div>
        </div>

        <div class="col-lg-6">
          <div class="mb-2 d-flex align-items-center gap-2">
            <span class="badge bg-white text-dark border border-secondary shadow-sm px-3 py-2 text-uppercase" style="letter-spacing: 0.05em; font-size: 0.7rem;">{{ product.category || 'General' }}</span>
            <span v-if="avgRating > 0" class="badge bg-warning text-dark px-3 py-2 fw-bold d-flex align-items-center" style="font-size: 0.8rem;">
              <i class="bi bi-star-fill me-1"></i> {{ avgRating }} ({{ reviews.length }} Reviews)
            </span>
          </div>

          <h1 class="fw-black text-dark mb-3" style="font-size: 2.5rem; letter-spacing: -0.02em;">{{ product.title }}</h1>
          
          <h2 class="fw-black mb-4" style="color: #b22b1d; font-size: 2rem;">
            ₦{{ Number(product.price).toLocaleString() }}
          </h2>

          <div class="mb-4">
            <h6 class="fw-bold text-dark text-uppercase small mb-2" style="letter-spacing: 0.05em;">Description</h6>
            <p class="text-secondary fw-medium" style="line-height: 1.7; font-size: 1.05rem;">
              {{ product.description || 'No description provided.' }}
            </p>
          </div>

          <div class="bg-white p-3 rounded-4 shadow-sm border d-flex align-items-center justify-content-between mb-4" style="border-color: rgba(0,0,0,0.05);">
            <div class="d-flex align-items-center gap-3">
              <img :src="product.profiles?.profile_image || `https://ui-avatars.com/api/?name=${product.profiles?.business_name || 'User'}&background=e9ecef&color=082b59`" class="rounded-circle object-fit-cover border border-2 border-white shadow-sm" style="width: 50px; height: 50px;">
              <div>
                <p class="mb-0 small text-secondary fw-bold text-uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">Sold By</p>
                <h6 class="mb-0 fw-bold text-dark">{{ product.profiles?.business_name || product.profiles?.first_name || 'Verified Vendor' }}</h6>
              </div>
            </div>
            <button @click="router.push(`/profile/${product.seller_id}`)" class="btn btn-sm btn-outline-dark rounded-pill fw-bold px-3">View Profile</button>
          </div>

          <div class="d-flex gap-3">
            <button @click="addToCart" class="btn flex-grow-1 fw-bold py-3 rounded-pill shadow-sm d-flex justify-content-center align-items-center gap-2" style="background-color: #082b59; color: white;" :disabled="product.stock <= 0 || product.seller_id === currentUser?.id">
              <i class="bi bi-cart-plus-fill fs-5"></i> 
              {{ product.seller_id === currentUser?.id ? "This is your item" : product.stock <= 0 ? "Sold Out" : "Add to Escrow Cart" }}
            </button>
            <button @click="router.push('/messages')" class="btn btn-light border fw-bold py-3 px-4 rounded-pill shadow-sm" :disabled="product.seller_id === currentUser?.id" title="Chat with Seller">
              <i class="bi bi-chat-dots-fill text-dark fs-5"></i>
            </button>
          </div>
          
          <p class="small text-center text-secondary fw-medium mt-3"><i class="bi bi-shield-check text-success me-1"></i> Payment secured in Escrow until delivery.</p>

        </div>
      </div>

      <div v-if="product" class="row mt-5 pt-5 border-top">
        <div class="col-lg-8 mx-auto">
          <h4 class="fw-bold text-dark mb-4 text-center">Student Reviews</h4>

          <div v-if="currentUser && currentUser.id !== product.seller_id" class="bg-white p-4 rounded-4 shadow-sm border mb-5" style="border-color: rgba(0,0,0,0.05);">
            <h6 class="fw-bold text-dark mb-3">Leave a Review</h6>
            <form @submit.prevent="submitReview">
              <div class="mb-3 d-flex gap-2">
                <i v-for="star in 5" :key="star" @click="newReview.rating = star" class="bi fs-4 cursor-pointer" :class="star <= newReview.rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'" style="cursor: pointer;"></i>
              </div>
              <div class="mb-3">
                <textarea v-model="newReview.comment" class="form-control bg-light border-0" rows="3" placeholder="What did you think of this item?..." required></textarea>
              </div>
              <div class="text-end">
                <button type="submit" class="btn fw-bold rounded-pill px-4" style="background-color: #b22b1d; color: white;" :disabled="isSubmittingReview || newReview.rating === 0">Post Review</button>
              </div>
            </form>
          </div>

          <div v-if="reviews.length === 0" class="text-center py-4 bg-white rounded-4 border shadow-sm" style="border-color: rgba(0,0,0,0.05);">
            <p class="text-secondary fw-medium mb-0">No reviews yet. Be the first to rate this item!</p>
          </div>

          <div v-else class="d-flex flex-column gap-3">
            <div v-for="review in reviews" :key="review.id" class="bg-white p-4 rounded-4 shadow-sm border" style="border-color: rgba(0,0,0,0.05);">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="d-flex align-items-center gap-2">
                  <div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center fw-bold" style="width: 35px; height: 35px; font-size: 0.8rem;">
                    {{ (review.profiles?.business_name || review.profiles?.first_name || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h6 class="fw-bold text-dark mb-0" style="font-size: 0.9rem;">{{ review.profiles?.business_name || review.profiles?.first_name || 'Anonymous Student' }}</h6>
                    <span class="small text-secondary" style="font-size: 0.7rem;">{{ new Date(review.created_at).toLocaleDateString() }}</span>
                  </div>
                </div>
                <div class="text-warning small">
                  <i v-for="n in review.rating" :key="n" class="bi bi-star-fill me-1"></i>
                </div>
              </div>
              <p class="text-dark fw-medium mb-0 mt-2" style="font-size: 0.95rem;">"{{ review.comment }}"</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const router = useRouter()
const loading = ref(true)

const product = ref(null)
const reviews = ref([])
const currentUser = ref(null)

// Review Form State
const newReview = ref({ rating: 0, comment: '' })
const isSubmittingReview = ref(false)

onMounted(async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session) currentUser.value = sessionData.session.user

  const productId = route.params.id

  // Fetch Product Data & Seller Info
  const { data: prodData } = await supabase
    .from('products')
    .select('*, profiles(id, business_name, first_name, profile_image)')
    .eq('id', productId)
    .single()
    
  product.value = prodData

  if (prodData) {
    // Fetch Reviews for this product
    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*, profiles(business_name, first_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      
    reviews.value = reviewData || []
  }
  
  loading.value = false
})

const avgRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, rev) => acc + rev.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const addToCart = () => {
  if (!currentUser.value) {
    alert("Please sign in to buy items.")
    router.push('/auth')
    return
  }
  
  const currentCart = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
  currentCart.push(product.value)
  localStorage.setItem('num_bazaar_cart', JSON.stringify(currentCart))
  
  // Trigger event to update Navbar Cart Badge
  window.dispatchEvent(new Event('storage'))
  
  alert("Added to Escrow Cart!")
  router.push('/cart')
}

const submitReview = async () => {
  if (!currentUser.value) return alert("Please sign in to leave a review.")
  
  isSubmittingReview.value = true
  try {
    const { data, error } = await supabase.from('reviews').insert([{
      product_id: product.value.id,
      reviewer_id: currentUser.value.id,
      rating: newReview.value.rating,
      comment: newReview.value.comment
    }]).select('*, profiles(business_name, first_name)').single()

    if (error) throw error

    // Instantly add the new review to the UI list
    reviews.value.unshift(data)
    newReview.value = { rating: 0, comment: '' } // reset form
    
  } catch (error) {
    alert("Error posting review: " + error.message)
  } finally {
    isSubmittingReview.value = false
  }
}
</script>