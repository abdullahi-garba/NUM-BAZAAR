<template>
  <div class="container py-5 mt-4">
    <h2 class="fw-black mb-4 text-dark"><i class="bi bi-cart3 me-2"></i>Escrow Cart</h2>
    
    <div class="row g-4">
      
      <div class="col-lg-8">
        <div v-if="cartItems.length === 0" class="card shadow-sm border-0 rounded-4 p-5 text-center bg-white h-100 d-flex justify-content-center align-items-center">
          <div>
            <i class="bi bi-cart-x fs-1 text-muted mb-3 d-block"></i>
            <h5 class="fw-bold text-muted">Your cart is empty.</h5>
            <router-link to="/shop" class="btn btn-primary mt-4 rounded-pill px-5 fw-bold" style="background-color: #082b59; border: none;">Browse Campus Feed</router-link>
          </div>
        </div>
        
        <div v-else class="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
          <ul class="list-group list-group-flush">
            <li v-for="(item, index) in cartItems" :key="index" class="list-group-item p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div class="d-flex align-items-center">
                <img :src="item.image_urls?.[0] || 'https://via.placeholder.com/80'" class="rounded-3 me-3 object-fit-cover shadow-sm" style="width: 80px; height: 80px;">
                <div>
                  <h6 class="fw-bold mb-1 text-dark">{{ item.title }}</h6>
                  <span class="badge bg-light text-secondary border mb-2">{{ item.category }}</span>
                </div>
              </div>
              <div class="d-flex align-items-center justify-content-between w-100 w-md-auto gap-4">
                <h5 class="fw-black text-danger mb-0">₦{{ Number(item.price).toLocaleString() }}</h5>
                <button @click="removeFromCart(index)" class="btn btn-outline-danger rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-lg-4" v-if="cartItems.length > 0">
        <div class="card shadow-sm border-0 rounded-4 bg-white p-4 sticky-top" style="top: 100px;">
          <h5 class="fw-bold mb-4 border-bottom pb-3"><i class="bi bi-receipt me-2"></i>Order Summary</h5>
          
          <div class="d-flex justify-content-between mb-3">
            <span class="text-muted fw-semibold">Subtotal ({{ cartItems.length }} items)</span>
            <span class="fw-bold text-dark">₦{{ cartTotal.toLocaleString() }}</span>
          </div>

          <div class="d-flex justify-content-between mb-4 pb-3 border-bottom">
            <span class="text-muted fw-semibold">Platform Fee (2%)</span>
            <span class="fw-bold text-dark">₦{{ platformFee.toLocaleString() }}</span>
          </div>
          
          <div class="d-flex justify-content-between mb-4">
            <h5 class="fw-black text-dark">Total</h5>
            <h4 class="fw-black text-danger">₦{{ finalTotal.toLocaleString() }}</h4>
          </div>
          
          <button @click="processCheckout" class="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow" :disabled="isProcessing" style="background-color: #082b59; border: none;">
            <i class="bi" :class="isProcessing ? 'bi-hourglass-split' : 'bi-lock-fill'"></i>
            {{ isProcessing ? 'Processing...' : 'Secure Checkout' }}
          </button>
          
          <div class="text-center mt-4 text-muted small bg-light p-3 rounded-4">
            <i class="bi bi-shield-check text-success fs-5 d-block mb-1"></i>
            Funds are locked securely in Escrow until you confirm physical delivery of your items.
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const cartItems = ref([])
const isProcessing = ref(false)
const currentUser = ref(null)

const loadCart = () => {
  try {
    cartItems.value = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]')
  } catch (e) {
    cartItems.value = []
  }
}

// Math for the checkout totals
const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + Number(item.price), 0)
})

const platformFee = computed(() => {
  return Math.round(cartTotal.value * 0.02) 
})

const finalTotal = computed(() => {
  return cartTotal.value + platformFee.value
})

const removeFromCart = (index) => {
  cartItems.value.splice(index, 1)
  localStorage.setItem('num_bazaar_cart', JSON.stringify(cartItems.value))
  window.dispatchEvent(new Event('storage')) 
}

const processCheckout = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (!sessionData.session) {
    alert("Security Check: You must be logged in to access the Escrow Checkout.")
    return router.push('/auth')
  }
  
  currentUser.value = sessionData.session.user
  isProcessing.value = true

  try {
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      throw new Error("Missing VITE_PAYSTACK_PUBLIC_KEY in your .env file!")
    }

    const userEmail = currentUser.value.email

    if (typeof window.PaystackPop === 'undefined') {
      throw new Error("Paystack script is not loaded in your index.html file!")
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, 
      email: userEmail,
      amount: finalTotal.value * 100, 
      currency: 'NGN',
      ref: 'NUM_' + Math.floor((Math.random() * 1000000000) + 1), 
      
      callback: function(response) {
        
        const completeDatabaseUpdates = async () => {
          try {
            // A. Create the Order Records in Escrow
            const ordersToInsert = cartItems.value.map(item => {
              const itemFee = Math.round(Number(item.price) * 0.02);
              const itemTotal = Number(item.price) + itemFee; // Calculate the total for this specific item
              
              return {
                buyer_id: currentUser.value.id,
                seller_id: item.seller_id,
                product_id: item.id,
                product_name: item.title,
                product_price: item.price, 
                product_image: item.image_urls[0],
                status: 'Paid (In Escrow)',
                paystack_reference: response.reference,
                platform_fee: itemFee,
                total_amount: itemTotal // FIX: Added the missing total_amount column
              }
            })
            
            const { error: orderError } = await supabase.from('orders').insert(ordersToInsert)
            if (orderError) throw new Error("Order Insert Failed: " + orderError.message)

            // B. INVENTORY & ESCROW ALGORITHM
            for (const item of cartItems.value) {
              
              // 1. Deplete Stock
              const { data: currentProduct } = await supabase.from('products').select('stock').eq('id', item.id).single()
              if (currentProduct && currentProduct.stock > 0) {
                const { error: stockErr } = await supabase.from('products').update({ stock: currentProduct.stock - 1 }).eq('id', item.id)
                if (stockErr) throw new Error("Stock Update Failed: " + stockErr.message)
              }

              // 2. Update Seller's Escrow Balance
              const { data: seller } = await supabase.from('profiles').select('escrow_balance').eq('id', item.seller_id).single()
              if (seller) {
                const newEscrow = Number(seller.escrow_balance || 0) + Number(item.price)
                const { error: escrowErr } = await supabase.from('profiles').update({ escrow_balance: newEscrow }).eq('id', item.seller_id)
                if (escrowErr) throw new Error("Escrow Update Failed: " + escrowErr.message)
              }
            }

            // C. Clear the Cart securely
            localStorage.removeItem('num_bazaar_cart')
            cartItems.value = []
            window.dispatchEvent(new Event('storage'))

            alert("Payment Successful! Your funds are securely locked in Escrow. Redirecting to your Profile...")
            router.push(`/profile/${currentUser.value.id}`)
            
          } catch (error) {
            console.error("Database Error Post-Payment:", error)
            alert("Database Error: " + error.message)
          } finally {
            isProcessing.value = false
          }
        }

        completeDatabaseUpdates()
      },
      onClose: function() {
        isProcessing.value = false;
      }
    });

    handler.openIframe();
    
  } catch (error) {
    console.error("Initialization Error:", error)
    alert(`Checkout Error: ${error.message}`)
    isProcessing.value = false
  }
}

onMounted(() => loadCart())
</script>

<style scoped>
.list-group-item {
  transition: background-color 0.2s ease;
}
.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>