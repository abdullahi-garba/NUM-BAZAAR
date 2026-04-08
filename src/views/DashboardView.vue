<template>
  <div class="bg-light min-vh-100 pb-5">
    
    <div style="background-color: #082b59; color: white; padding: 60px 0 40px 0;">
      <div class="container px-lg-5">
        <h2 class="fw-black mb-1">Vendor Dashboard</h2>
        <p class="text-white-50 fw-medium mb-0">Manage your storefront, upload products, and withdraw your earnings.</p>
      </div>
    </div>

    <div class="container px-lg-5" style="margin-top: -30px;">
      
      <div v-if="isLoading" class="text-center py-5 bg-white shadow-sm rounded-4"><div class="spinner-border" style="color: #b22b1d;"></div></div>
      
      <div v-else-if="profile">

        <div v-if="!hasActiveSubscription" class="bg-white p-5 text-center shadow-sm mx-auto" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); max-width: 700px;">
          <div class="rounded-circle d-inline-flex justify-content-center align-items-center mb-4" style="width: 80px; height: 80px; background-color: #fef2f2; color: #b22b1d;">
            <i class="bi bi-shop fs-1"></i>
          </div>
          <h3 class="fw-bold text-dark">Activate Your Storefront</h3>
          <p class="text-secondary fw-medium mx-auto mb-4">
            NUM BAZAAR is a premium, scam-free campus marketplace. To post products and access the Escrow system, vendors pay a standard 30-day subscription fee.
          </p>
          
          <div class="bg-light p-4 rounded-4 mx-auto mb-4 d-flex justify-content-between align-items-center" style="max-width: 400px; border: 1px solid rgba(0,0,0,0.05);">
            <div class="text-start">
              <h5 class="fw-bold text-dark mb-0">30-Day Pass</h5>
            </div>
            <h2 class="fw-black mb-0" style="color: #082b59;">₦2,000</h2>
          </div>

          <button @click="processSubscription" class="btn fw-bold py-3 px-5 rounded-pill shadow-sm d-inline-flex align-items-center gap-2 w-100" style="max-width: 400px; background-color: #082b59; color: white; font-size: 1.1rem;" :disabled="isProcessing">
            <span v-if="isProcessing" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-credit-card-fill"></i>
            {{ isProcessing ? 'Loading Secure Payment...' : 'Pay with Paystack' }}
          </button>
        </div>

        <div v-else class="row g-4">
          
          <div class="col-12">
            <div class="bg-white px-4 py-3 shadow-sm d-flex justify-content-between align-items-center" style="border-radius: 12px; border-left: 4px solid #10b981;">
              <div>
                <span class="fw-bold text-dark"><i class="bi bi-check-circle-fill text-success me-2"></i> Storefront Active</span>
                <span class="text-secondary small ms-3">Subscription renews on: <strong>{{ new Date(profile.subscription_ends_at).toLocaleDateString() }}</strong></span>
              </div>
              <button @click="router.push(`/profile/${currentUser.id}`)" class="btn btn-sm btn-outline-dark fw-bold rounded-pill px-4">View Public Store</button>
            </div>
          </div>

          <div class="col-md-6">
            <div class="bg-white p-4 shadow-sm h-100 position-relative overflow-hidden" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
              <div class="position-absolute top-0 end-0 p-3 opacity-25"><i class="bi bi-wallet2" style="font-size: 4rem; color: #10b981;"></i></div>
              <h6 class="fw-bold text-secondary text-uppercase small mb-2" style="letter-spacing: 0.05em;">Available Wallet Balance</h6>
              <h1 class="fw-black mb-1" style="color: #10b981; font-size: 2.5rem;">₦{{ Number(profile.wallet_balance || 0).toLocaleString() }}</h1>
              <p class="small text-secondary fw-medium mb-0">Funds ready for bank withdrawal.</p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="bg-white p-4 shadow-sm h-100 position-relative overflow-hidden" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
              <div class="position-absolute top-0 end-0 p-3 opacity-25"><i class="bi bi-shield-lock" style="font-size: 4rem; color: #f59e0b;"></i></div>
              <h6 class="fw-bold text-secondary text-uppercase small mb-2" style="letter-spacing: 0.05em;">Pending in Escrow</h6>
              <h1 class="fw-black mb-1" style="color: #f59e0b; font-size: 2.5rem;">₦{{ Number(profile.escrow_balance || 0).toLocaleString() }}</h1>
              <p class="small text-secondary fw-medium mb-0">Funds locked until buyers confirm delivery.</p>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="bg-white p-4 shadow-sm mb-4 h-100" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
              <h5 class="fw-bold text-dark mb-4 border-bottom pb-3"><i class="bi bi-plus-circle-fill me-2" style="color: #082b59;"></i> Post New Product</h5>
              
              <div v-if="!profile.is_verified" class="alert alert-warning border-0 small fw-medium mb-4">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> Your identity is not verified yet. You can post products, but they may be hidden until an Admin verifies your Student ID.
              </div>

              <form @submit.prevent="submitProduct">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label small fw-bold text-dark">Product Title</label>
                    <input type="text" v-model="newProduct.title" class="form-control" placeholder="e.g. MacBook Pro M1 2020" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-dark">Price (₦)</label>
                    <input type="number" v-model="newProduct.price" class="form-control" placeholder="0.00" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" required>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-dark">Category</label>
                    <select v-model="newProduct.category" class="form-select" :class="{'mb-2': newProduct.category === 'Other'}" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" required>
                      <option value="Electronics & Tech">Electronics & Tech</option>
                      <option value="Textbooks & Notes">Textbooks & Notes</option>
                      <option value="Dormitory & Furniture">Dormitory & Furniture</option>
                      <option value="Fashion & Wearables">Fashion & Wearables</option>
                      <option value="Services & Tutoring">Services & Tutoring</option>
                      <option value="Other">Other (Specify)</option>
                    </select>
                    <input v-if="newProduct.category === 'Other'" type="text" v-model="newProduct.customCategory" class="form-control" placeholder="Type category name" style="background-color: #e9ecef; border: 1px solid #dee2e6; border-radius: 12px; padding: 10px 15px; font-weight: 500;" required>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-dark">Condition</label>
                    <select v-model="newProduct.condition" class="form-select" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" required>
                      <option value="New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-dark">Stock Quantity</label>
                    <input type="number" v-model="newProduct.stock" min="1" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" required>
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-bold text-dark">Description</label>
                    <textarea v-model="newProduct.description" class="form-control" rows="3" placeholder="Describe the item, flaws, and meet-up preferences..." style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" required></textarea>
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-bold text-dark">Product Image</label>
                    <input type="file" @change="e => productImageFile = e.target.files[0]" class="form-control" accept="image/*" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 10px 15px; font-weight: 500;" required>
                  </div>
                </div>

                <div class="mt-4 text-end">
                  <button type="submit" class="btn fw-bold px-5 py-2 rounded-pill shadow-sm" style="background-color: #082b59; color: white;" :disabled="isPosting">
                    <span v-if="isPosting" class="spinner-border spinner-border-sm me-2"></span> 
                    {{ isPosting ? 'Uploading...' : 'Submit for Approval' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="bg-white p-4 shadow-sm mb-4 h-100" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
              <h5 class="fw-bold text-dark mb-4 border-bottom pb-3"><i class="bi bi-bank2 me-2" style="color: #b22b1d;"></i> Request Bank Payout</h5>
              
              <form @submit.prevent="requestWithdrawal">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-dark">Amount to Withdraw (₦)</label>
                  <input type="number" v-model="withdrawForm.amount" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" :max="profile.wallet_balance" required>
                </div>
                
                <div class="mb-3">
                  <label class="form-label small fw-bold text-dark">Select Bank</label>
                  <select v-model="withdrawForm.bankName" class="form-select" :class="{'mb-2': withdrawForm.bankName === 'Other'}" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" required>
                    <option value="" disabled>Choose...</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="GTBank">GTBank</option>
                    <option value="UBA">UBA</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="First Bank">First Bank</option>
                    <option value="Moniepoint">Moniepoint</option>
                    <option value="Kuda Bank">Kuda Bank</option>
                    <option value="Opay">Opay</option>
                    <option value="Palmpay">Palmpay</option>
                    <option value="Other">Other Bank (Specify)</option>
                  </select>
                  <input v-if="withdrawForm.bankName === 'Other'" type="text" v-model="withdrawForm.customBankName" class="form-control" placeholder="Type your bank name" style="background-color: #e9ecef; border: 1px solid #dee2e6; border-radius: 12px; padding: 10px 15px; font-weight: 500;" required>
                </div>
                
                <div class="mb-4">
                  <label class="form-label small fw-bold text-dark">10-Digit Account Number</label>
                  <input type="text" v-model="withdrawForm.accountNumber" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" maxlength="10" required>
                </div>
                
                <button type="submit" class="btn w-100 fw-bold py-3 rounded-pill shadow-sm" style="background-color: #10b981; color: white;" :disabled="isWithdrawing || profile.wallet_balance <= 0">
                  <span v-if="isWithdrawing" class="spinner-border spinner-border-sm me-2"></span> 
                  {{ isWithdrawing ? 'Submitting Request...' : 'Request Payout to Bank' }}
                </button>
                <p class="text-center text-secondary small fw-medium mt-3 mb-0"><i class="bi bi-info-circle me-1"></i> Admin will manually process payouts within 12 hours.</p>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)
const profile = ref(null)

const isLoading = ref(true)
const isProcessing = ref(false)
const isWithdrawing = ref(false)
const isPosting = ref(false)

// Added customBankName to track manual inputs
const withdrawForm = ref({ amount: '', bankName: '', customBankName: '', accountNumber: '' })

// Added customCategory to track manual inputs
const newProduct = ref({
  title: '', price: '', category: 'Electronics & Tech', customCategory: '', condition: 'New', stock: 1, description: ''
})
const productImageFile = ref(null)

// Computed property to check if the 30-day MRR subscription is valid
const hasActiveSubscription = computed(() => {
  if (!profile.value || !profile.value.subscription_ends_at) return false;
  return new Date(profile.value.subscription_ends_at) > new Date();
})

onMounted(async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (sessionData.session) {
    currentUser.value = sessionData.session.user
    
    // Fetch profile to check subscription & balances
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.value.id)
      .single()
      
    profile.value = userProfile
  } else {
    router.push('/auth')
  }
  isLoading.value = false
})

// ==========================================
// 1. POST NEW PRODUCT LOGIC
// ==========================================
const submitProduct = async () => {
  if (!productImageFile.value) return alert("Please select an image for your product.");
  
  // Resolve which category to use based on selection
  const finalCategory = newProduct.value.category === 'Other' 
    ? newProduct.value.customCategory 
    : newProduct.value.category;

  if (!finalCategory.trim()) return alert("Please specify your custom category.");

  isPosting.value = true;
  try {
    // 1. Upload Image to Supabase Storage bucket
    const fileExt = productImageFile.value.name.split('.').pop()
    const fileName = `product_${currentUser.value.id}_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, productImageFile.value)
      
    if (uploadError) throw new Error("Image upload failed: " + uploadError.message)

    // Get the public URL for the image
    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName)

    // 2. Insert into the Database with the dynamically resolved category
    const { error: dbError } = await supabase.from('products').insert([{
      seller_id: currentUser.value.id,
      title: newProduct.value.title,
      description: newProduct.value.description,
      price: newProduct.value.price,
      category: finalCategory, // <-- Using the custom or default category
      condition: newProduct.value.condition,
      stock: newProduct.value.stock,
      image_urls: [publicUrlData.publicUrl],
      is_approved: false // Sends it to Admin Command Center
    }])

    if (dbError) throw new Error("Failed to post product: " + dbError.message)

    alert("Success! Your product has been submitted and is pending Admin approval.")
    
    // Reset Form
    newProduct.value = { title: '', price: '', category: 'Electronics & Tech', customCategory: '', condition: 'New', stock: 1, description: '' }
    productImageFile.value = null
    
  } catch (error) {
    console.error("Posting Error:", error)
    alert(error.message)
  } finally {
    isPosting.value = false
  }
}

// ==========================================
// 2. 30-DAY MRR PAYSTACK SUBSCRIPTION
// ==========================================
const processSubscription = () => {
  isProcessing.value = true; 

  if (window.PaystackPop) {
    launchPaystack();
    return;
  }

  const script = document.createElement('script');
  script.src = "https://js.paystack.co/v1/inline.js";
  script.async = true;
  script.onload = () => launchPaystack();
  script.onerror = () => {
    alert("Failed to load secure payment gateway. Please check your internet connection.");
    isProcessing.value = false;
  };
  document.body.appendChild(script);
};

// Extracted the database logic into its own safe async function
const verifyAndSaveSubscription = async (reference) => {
  alert('Subscription Successful! Ref: ' + reference);
  try {
    // Calculate the date 30 days from right now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await supabase.from('profiles')
      .update({ subscription_ends_at: expiryDate.toISOString() })
      .eq('id', currentUser.value.id);
      
    window.location.reload();
  } catch(err) {
    console.error("Database update failed:", err);
    alert("Payment was successful, but we couldn't update your profile. Please contact support.");
    isProcessing.value = false;
  }
};

const launchPaystack = () => {
  const handler = window.PaystackPop.setup({
    key: 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY', // <-- REPLACE WITH YOUR KEY
    email: currentUser.value.email,
    amount: 2000 * 100, // ₦2,000 in kobo
    currency: 'NGN',
    callback: function(response) {
      verifyAndSaveSubscription(response.reference);
    },
    onClose: function() {
      alert('Transaction window was closed.');
      isProcessing.value = false; 
    }
  });
  handler.openIframe();
};

// ==========================================
// 3. MANUAL WITHDRAWAL LOGIC
// ==========================================
const requestWithdrawal = async () => {
  if (withdrawForm.value.amount > profile.value.wallet_balance) {
    return alert("You cannot withdraw more than your available balance.");
  }
  if (withdrawForm.value.amount < 100) {
    return alert("Minimum withdrawal amount is ₦100.");
  }

  // Resolve which Bank Name to use based on selection
  const finalBankName = withdrawForm.value.bankName === 'Other' 
    ? withdrawForm.value.customBankName 
    : withdrawForm.value.bankName;

  if (!finalBankName.trim()) return alert("Please specify your bank name.");

  isWithdrawing.value = true;
  
  try {
    const newBalance = Number(profile.value.wallet_balance) - Number(withdrawForm.value.amount);
    
    // 1. Deduct funds instantly
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', currentUser.value.id);

    if (updateError) throw updateError;

    // 2. Create a pending transaction for the Admin
    const { error: txError } = await supabase
      .from('transactions')
      .insert([{
        profile_id: currentUser.value.id,
        amount: withdrawForm.value.amount,
        type: 'debit',
        status: 'Pending',
        // Using the dynamically resolved Bank Name
        description: `Manual Payout - ${finalBankName} (${withdrawForm.value.accountNumber})`
      }]);

    if (txError) throw txError;

    alert("Withdrawal requested successfully! The Admin team will review and process your transfer shortly.");
    profile.value.wallet_balance = newBalance;
    withdrawForm.value = { amount: '', bankName: '', customBankName: '', accountNumber: '' };

  } catch (error) {
    console.error("Payout Error:", error);
    alert("Withdrawal request failed: " + error.message);
  } finally {
    isWithdrawing.value = false;
  }
};
</script>

<style scoped>
input, select, textarea { font-size: 15px !important; }
</style>