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
                  <div class="small fw-bold text-dark">Qty: {{ item.cartQuantity || 1 }}</div>
                </div>
              </div>
              <div class="d-flex align-items-center justify-content-between w-100 w-md-auto gap-4">
                <h5 class="fw-black text-danger mb-0">₦{{ (Number(item.price) * (item.cartQuantity || 1)).toLocaleString() }}</h5>
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
            <span class="text-muted fw-semibold">Subtotal</span>
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
            <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-lock-fill me-2"></i>
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
  try { cartItems.value = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]') } 
  catch (e) { cartItems.value = [] }
}

const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + (Number(item.price) * (item.cartQuantity || 1)), 0)
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
  if (!sessionData.session) return router.push('/auth')
  
  currentUser.value = sessionData.session.user
  isProcessing.value = true

  try {
    const userEmail = currentUser.value.email
    const launchPaystack = () => {
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, 
        email: userEmail,
        amount: finalTotal.value * 100, 
        currency: 'NGN',
        ref: 'NUM_' + Math.floor((Math.random() * 1000000000) + 1), 
        
        callback: function(response) {
          
          const completeDatabaseUpdates = async () => {
            try {
              // 1. Calculate and Insert Orders
              const ordersToInsert = cartItems.value.map(item => {
                const qty = item.cartQuantity || 1;
                const basePriceTotal = Number(item.price) * qty;
                const itemFee = Math.round(basePriceTotal * 0.02);
                
                return {
                  buyer_id: currentUser.value.id,
                  seller_id: item.seller_id,
                  product_id: item.id,
                  product_name: `${qty}x ${item.title}`,
                  product_price: basePriceTotal, 
                  product_image: item.image_urls[0],
                  status: 'Paid (In Escrow)',
                  paystack_reference: response.reference,
                  platform_fee: itemFee,
                  total_amount: basePriceTotal + itemFee 
                }
              })
              
              await supabase.from('orders').insert(ordersToInsert)

              // 2. Deplete Stock & Add Escrow Balance based on Qty Selected
              for (const item of cartItems.value) {
                const qty = item.cartQuantity || 1;
                const { data: currentProduct } = await supabase.from('products').select('stock').eq('id', item.id).single()
                if (currentProduct) {
                  await supabase.from('products').update({ stock: Math.max(0, currentProduct.stock - qty) }).eq('id', item.id)
                }

                const { data: seller } = await supabase.from('profiles').select('escrow_balance').eq('id', item.seller_id).single()
                if (seller) {
                  const newEscrow = Number(seller.escrow_balance || 0) + (Number(item.price) * qty)
                  await supabase.from('profiles').update({ escrow_balance: newEscrow }).eq('id', item.seller_id)
                }
              }

              // 3. Prepare Auto-WhatsApp Redirect for the Primary Vendor
              const primaryVendorPhone = cartItems.value[0]?.profiles?.phone_number;
              const primaryItemTitle = cartItems.value[0]?.title;
              
              localStorage.removeItem('num_bazaar_cart')
              cartItems.value = []
              window.dispatchEvent(new Event('storage'))

              alert("Payment Successful! Routing you to the vendor's WhatsApp to coordinate delivery...")
              
              if (primaryVendorPhone) {
                let cleanPhone = primaryVendorPhone.replace(/\D/g, '')
                if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1)
                if (cleanPhone.startsWith('+')) cleanPhone = cleanPhone.slice(1)
                
                const msg = `🧾 *NUM BAZAAR RECEIPT*\n\nHello, I have just secured the Escrow payment for: *${primaryItemTitle}*. \n\nRef: ${response.reference}\n\nWhen can we meet up for delivery?`
                window.location.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
              } else {
                router.push(`/profile/${currentUser.value.id}`)
              }
              
            } catch (error) {
              alert("Database Error: " + error.message)
            } finally {
              isProcessing.value = false
            }
          }
          completeDatabaseUpdates()
        },
        onClose: function() { isProcessing.value = false; }
      });
      handler.openIframe();
    };

    if (window.PaystackPop) launchPaystack();
    else {
      const script = document.createElement('script');
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => launchPaystack();
      script.onerror = () => { alert("Failed to load secure gateway."); isProcessing.value = false; };
      document.body.appendChild(script);
    }
  } catch (error) {
    alert(`Checkout Error: ${error.message}`); isProcessing.value = false
  }
}
onMounted(() => loadCart())
</script>