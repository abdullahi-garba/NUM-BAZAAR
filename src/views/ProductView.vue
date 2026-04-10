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
            <img :src="product.image_urls?.[activeImageIndex] || 'https://via.placeholder.com/600'" class="w-100 object-fit-cover rounded-3 mb-2" style="height: 450px; transition: opacity 0.3s ease;">
            
            <div v-if="product.image_urls?.length > 1" class="d-flex gap-2 overflow-auto pb-1" style="-ms-overflow-style: none; scrollbar-width: none;">
              <img v-for="(img, idx) in product.image_urls" :key="idx" 
                   :src="img" 
                   @click="activeImageIndex = idx" 
                   class="rounded-3 object-fit-cover border" 
                   :class="activeImageIndex === idx ? 'border-primary border-2 opacity-100' : 'border-light opacity-50'" 
                   style="width: 80px; height: 80px; cursor: pointer; transition: all 0.2s ease;">
            </div>
          </div>
        </div>

        <div class="col-lg-6 d-flex flex-column">
          <div class="mb-2 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-white text-dark border border-secondary shadow-sm px-3 py-2 text-uppercase" style="letter-spacing: 0.05em; font-size: 0.7rem;">{{ product.category || 'General' }}</span>
              <span v-if="avgRating > 0" class="badge bg-warning text-dark px-3 py-2 fw-bold d-flex align-items-center" style="font-size: 0.8rem;">
                <i class="bi bi-star-fill me-1"></i> {{ avgRating }} ({{ reviews.length }} Reviews)
              </span>
            </div>
            
            <span class="badge px-3 py-2 text-uppercase fw-bold shadow-sm" :class="product.stock > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-dark text-white'">
              {{ product.stock > 0 ? `In Stock: ${product.stock}` : 'Sold Out' }}
            </span>
          </div>

          <h1 class="fw-black text-dark mb-3" style="font-size: 2.5rem; letter-spacing: -0.02em;">{{ product.title }}</h1>
          
          <h2 class="fw-black mb-4" style="color: #b22b1d; font-size: 2rem;">
            ₦{{ Number(product.price).toLocaleString() }}
          </h2>

          <div class="mb-4">
            <h6 class="fw-bold text-dark text-uppercase small mb-2" style="letter-spacing: 0.05em;">Description</h6>
            <p class="text-secondary fw-medium" style="line-height: 1.7; font-size: 1.05rem; white-space: pre-wrap;">
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

          <div class="mt-auto">
            <div v-if="product.stock > 0 && product.seller_id !== currentUser?.id">
              <label class="form-label small fw-bold text-dark text-uppercase mb-2">Quantity</label>
              
              <div class="d-flex align-items-center gap-3 mb-4">
                <div class="d-flex align-items-center bg-white rounded-pill border shadow-sm" style="padding: 4px;">
                  <button @click="selectedQuantity > 1 ? selectedQuantity-- : null" class="btn btn-sm rounded-circle d-flex justify-content-center align-items-center bg-light" style="width: 35px; height: 35px; border: none;">
                    <i class="bi bi-dash fw-bold text-dark"></i>
                  </button>
                  <span class="fw-bold px-4 text-dark">{{ selectedQuantity }}</span>
                  <button @click="selectedQuantity < product.stock ? selectedQuantity++ : null" class="btn btn-sm rounded-circle d-flex justify-content-center align-items-center bg-light" style="width: 35px; height: 35px; border: none;">
                    <i class="bi bi-plus fw-bold text-dark"></i>
                  </button>
                </div>

                <button @click="addToCart" class="btn flex-grow-1 fw-bold py-3 rounded-pill shadow-sm d-flex justify-content-center align-items-center gap-2" style="background-color: #082b59; color: white; border: none;">
                  <i class="bi bi-cart-plus-fill fs-5"></i> Add to Escrow
                </button>
              </div>

              <button @click="showWhatsappModal = true" class="btn w-100 fw-bold rounded-pill py-3 d-flex justify-content-center align-items-center gap-2 shadow-sm" style="background-color: #25D366; color: white; border: none;">
                <i class="bi bi-whatsapp fs-5"></i> Chat with Vendor
              </button>
            </div>

            <div v-else>
               <button class="btn w-100 fw-bold py-3 rounded-pill" style="background-color: #e9ecef; color: #6b7280; border: none;" disabled>
                 <i class="bi bi-lock-fill me-2"></i>
                 {{ product.seller_id === currentUser?.id ? "This is your item" : "Sold Out" }}
               </button>
            </div>
            
            <p class="small text-center text-secondary fw-medium mt-3"><i class="bi bi-shield-check text-success me-1"></i> Payment secured in Escrow until delivery.</p>
          </div>

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

    <div v-if="showWhatsappModal" class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1060; display: flex; justify-content: center; align-items: center;">
      <div class="bg-white p-4 rounded-4 shadow-lg w-100" style="max-width: 400px; margin: 0 15px;">
        <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
          <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-whatsapp text-success me-2"></i>Send Message</h5>
          <button @click="showWhatsappModal = false" class="btn-close"></button>
        </div>
        
        <p class="small text-secondary fw-medium mb-3">Select a quick response or type your own message to send directly to the vendor's WhatsApp.</p>
        
        <div class="d-flex flex-column gap-2 mb-3">
          <button @click="whatsappTemplate = 'Is this item still available?'" class="btn btn-light border text-start small fw-medium rounded-3 py-2" :class="whatsappTemplate === 'Is this item still available?' ? 'border-success bg-success-subtle' : ''">Is this item still available?</button>
          <button @click="whatsappTemplate = 'Can the price be negotiated?'" class="btn btn-light border text-start small fw-medium rounded-3 py-2" :class="whatsappTemplate === 'Can the price be negotiated?' ? 'border-success bg-success-subtle' : ''">Can the price be negotiated?</button>
          <button @click="whatsappTemplate = 'custom'" class="btn btn-light border text-start small fw-medium rounded-3 py-2" :class="whatsappTemplate === 'custom' ? 'border-success bg-success-subtle' : ''">Custom Message...</button>
        </div>

        <textarea v-if="whatsappTemplate === 'custom'" v-model="customWhatsappText" class="form-control mb-3 bg-light border-0" rows="3" placeholder="Type your message..."></textarea>

        <button @click="routeToWhatsapp" class="btn w-100 fw-bold rounded-pill py-2 shadow-sm" style="background-color: #25D366; color: white; border: none;">
          Open WhatsApp <i class="bi bi-box-arrow-up-right ms-1"></i>
        </button>
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

const activeImageIndex = ref(0) // State for Image Gallery
const selectedQuantity = ref(1)
const showWhatsappModal = ref(false)
const whatsappTemplate = ref('Is this item still available?')
const customWhatsappText = ref('')

const newReview = ref({ rating: 0, comment: '' })
const isSubmittingReview = ref(false)

onMounted(async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session) currentUser.value = sessionData.session.user

  const productId = route.params.id

  const { data: prodData } = await supabase
    .from('products')
    .select('*, profiles(id, business_name, first_name, profile_image, phone_number)')
    .eq('id', productId)
    .single()
    
  product.value = prodData

  if (prodData) {
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
  // Push the product along with the precise quantity selected by the user
  currentCart.push({ ...product.value, cartQuantity: selectedQuantity.value })
  
  localStorage.setItem('num_bazaar_cart', JSON.stringify(currentCart))
  window.dispatchEvent(new Event('storage'))
  
  alert(`${selectedQuantity.value}x added to Escrow Cart!`)
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

    reviews.value.unshift(data)
    newReview.value = { rating: 0, comment: '' } 
    
  } catch (error) {
    alert("Error posting review: " + error.message)
  } finally {
    isSubmittingReview.value = false
  }
}

const routeToWhatsapp = () => {
  let phone = product.value?.profiles?.phone_number
  if (!phone) return alert("This vendor has not provided a phone number on their profile.")
  
  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1)
  if (cleanPhone.startsWith('+')) cleanPhone = cleanPhone.slice(1)

  const messageText = whatsappTemplate.value === 'custom' ? customWhatsappText.value : whatsappTemplate.value;
  const finalMessage = `Hello, I saw your item *${product.value.title}* on NUM BAZAAR. \n\n${messageText}`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;
  window.open(waUrl, '_blank');
  showWhatsappModal.value = false;
}
</script>