<template>
  <div class="container py-5 mt-4">
    <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
      <h2 class="fw-black mb-0" style="color: #082b59;"><i class="bi bi-cart3 me-2"></i>My Cart</h2>
      <span class="badge bg-success-subtle text-success fs-6 border border-success rounded-pill px-3 py-2">
        <i class="bi bi-shield-lock-fill me-1"></i> Escrow Protected
      </span>
    </div>

    <div v-if="cartItems.length === 0" class="text-center py-5 bg-white shadow-sm rounded-4 border-0">
      <i class="bi bi-cart-x text-muted" style="font-size: 4rem;"></i>
      <h4 class="fw-bold mt-3 text-dark">Your cart is empty</h4>
      <RouterLink to="/shop" class="btn btn-primary fw-bold px-5 py-2 mt-3 rounded-pill" style="background-color: #082b59; border: none;">Start Shopping</RouterLink>
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-8">
        <div class="card shadow-sm border-0 rounded-4 mb-3 bg-white" v-for="(item, index) in cartItems" :key="index">
          <div class="card-body p-4 d-flex align-items-center">
            <img :src="item.image_urls[0]" class="rounded-4 me-4 shadow-sm" style="width: 100px; height: 100px; object-fit: cover;" />
            <div class="flex-grow-1">
              <h5 class="fw-bold mb-1 text-dark">{{ item.title }}</h5>
              <h5 class="fw-black mb-0" style="color: #800000;">₦{{ item.price.toLocaleString() }}</h5>
            </div>
            <button @click="removeItem(index)" class="btn btn-light text-danger rounded-circle p-2 shadow-sm" style="width: 45px; height: 45px;"><i class="bi bi-trash3-fill fs-5"></i></button>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card shadow-lg border-0 rounded-4 p-4 bg-white sticky-top" style="top: 100px;">
          <h5 class="fw-bold border-bottom pb-3 mb-4 text-dark">Order Summary</h5>
          <div class="d-flex justify-content-between mb-2"><span class="text-muted fw-semibold">Subtotal ({{ cartItems.length }} items)</span><span class="fw-bold text-dark">₦{{ subtotal.toLocaleString() }}</span></div>
          <div class="d-flex justify-content-between mb-3 pb-3 border-bottom"><span class="text-muted fw-semibold">Platform Fee</span><span class="fw-bold text-dark">₦{{ platformFee.toLocaleString() }}</span></div>
          <div class="d-flex justify-content-between mb-4"><span class="fw-black fs-5 text-dark">Total Amount</span><span class="fw-black fs-4" style="color: #082b59;">₦{{ grandTotal.toLocaleString() }}</span></div>

          <button @click="processMultiCheckout" class="btn btn-primary w-100 fw-bold py-3 rounded-pill shadow mb-3" :disabled="isProcessing" style="background-color: #082b59; border: none; font-size: 1.1rem;">
            {{ isProcessing ? 'Securing Payment...' : 'Pay Securely Now' }}
          </button>
          <div class="text-center text-muted small fw-semibold"><i class="bi bi-shield-check text-success fs-5 d-block mb-1"></i>Funds held securely in Escrow until delivery.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'; 
import { useRouter } from 'vue-router'; 
import { supabase } from '../lib/supabaseClient'

const router = useRouter(); 
const cartItems = ref([]); 
const currentUser = ref(null);
const isProcessing = ref(false);

onMounted(async () => { 
  cartItems.value = JSON.parse(localStorage.getItem('num_bazaar_cart') || '[]'); 
  const { data } = await supabase.auth.getSession(); 
  currentUser.value = data.session?.user 
})

const subtotal = computed(() => cartItems.value.reduce((total, item) => total + Number(item.price), 0))
const platformFee = computed(() => subtotal.value === 0 ? 0 : subtotal.value < 5000 ? 100 : subtotal.value < 20000 ? 200 : 400)
const grandTotal = computed(() => subtotal.value + platformFee.value)
const removeItem = (i) => { cartItems.value.splice(i, 1); localStorage.setItem('num_bazaar_cart', JSON.stringify(cartItems.value)) }

const processMultiCheckout = () => {
  if (!currentUser.value) return alert("Please sign in to checkout!");
  if (!window.PaystackPop) return alert("Payment system is loading.");
  isProcessing.value = true;

  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: currentUser.value.email,
    amount: grandTotal.value * 100, 
    currency: 'NGN',
    ref: 'NUM_' + Math.floor(Math.random() * 1000000000),
    // FIX: Standard function
    callback: function(response) {
      const splitFee = platformFee.value / cartItems.value.length; 
      
      // Map over items and create an array of database promises
      const orderPromises = cartItems.value.map(item => {
        return supabase.from('orders').insert([{ 
          buyer_id: currentUser.value.id, seller_id: item.seller_id, product_id: item.id, 
          product_name: item.title, product_image: item.image_urls[0], product_price: item.price, 
          platform_fee: splitFee, total_amount: item.price + splitFee, 
          status: 'Paid (In Escrow)', paystack_reference: response.reference 
        }])
        .then(() => {
          return supabase.from('profiles').select('escrow_balance').eq('id', item.seller_id).single()
            .then(({ data: seller }) => {
               return supabase.from('profiles').update({ escrow_balance: Number(seller.escrow_balance || 0) + Number(item.price) }).eq('id', item.seller_id);
            });
        })
        .then(() => {
           return supabase.from('transactions').insert([{
             profile_id: item.seller_id, amount: item.price, type: 'credit', description: `Funds locked in Escrow - ${item.title}`
           }]);
        });
      });

      // Execute all database updates, then finish
      Promise.all(orderPromises)
        .then(() => {
          localStorage.removeItem('num_bazaar_cart'); 
          alert("Payment successful! Funds secured in Escrow.");
          isProcessing.value = false;
          router.push(`/profile/${currentUser.value.id}`);
        })
        .catch(err => {
          alert("Error saving order. Contact support with Ref: " + response.reference);
          isProcessing.value = false;
        });
    },
    onClose: function() { 
      isProcessing.value = false; 
      alert('Payment cancelled.'); 
    }
  });
  handler.openIframe();
}

  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: currentUser.value.email,
    amount: grandTotal.value * 100, // Paystack uses Kobo
    currency: 'NGN',
    ref: 'NUM_' + Math.floor(Math.random() * 1000000000),
    callback: async function(response) {
      try {
        const splitFee = platformFee.value / cartItems.value.length; // Spread fee across orders for records
        
        for (const item of cartItems.value) {
          // 1. Create Order
          await supabase.from('orders').insert([{ 
            buyer_id: currentUser.value.id, seller_id: item.seller_id, product_id: item.id, 
            product_name: item.title, product_image: item.image_urls[0], product_price: item.price, 
            platform_fee: splitFee, total_amount: item.price + splitFee, 
            status: 'Paid (In Escrow)', paystack_reference: response.reference 
          }]);

          // 2. Lock money in Seller's Escrow Account
          const { data: seller } = await supabase.from('profiles').select('escrow_balance').eq('id', item.seller_id).single();
          await supabase.from('profiles').update({ escrow_balance: Number(seller.escrow_balance || 0) + Number(item.price) }).eq('id', item.seller_id);

          // 3. Log Financial Transaction Ledger
          await supabase.from('transactions').insert([{
            profile_id: item.seller_id, amount: item.price, type: 'credit', description: `Funds locked in Escrow - ${item.title}`
          }]);
        }
        
        localStorage.removeItem('num_bazaar_cart'); 
        alert("Payment successful! Funds secured in Escrow.");
        router.push(`/profile/${currentUser.value.id}`); // Send to profile to see the Escrow purchases
      } catch (err) { alert("Error saving order. Contact support with Ref: " + response.reference); }
    },
    onClose: function() { isProcessing.value = false; alert('Payment cancelled.'); }
  });
  handler.openIframe();

</script>