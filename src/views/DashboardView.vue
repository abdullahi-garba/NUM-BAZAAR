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
                    <label class="form-label small fw-bold text-dark">Product Images (Up to 5)</label>
                    <div class="p-3 bg-light rounded-4 border text-center position-relative" style="border-style: dashed !important; border-width: 2px !important;">
                      <i class="bi bi-cloud-arrow-up-fill fs-2 text-secondary mb-1 d-block"></i>
                      <p class="fw-bold text-dark small mb-0">Click to upload images</p>
                      <input type="file" multiple accept="image/*" @change="handleFileSelect" class="position-absolute top-0 start-0 w-100 h-100 opacity-0" style="cursor: pointer;" required>
                    </div>
                    
                    <div v-if="imagePreviews.length > 0" class="d-flex gap-2 mt-3 overflow-auto pb-2">
                      <div v-for="(img, index) in imagePreviews" :key="index" class="position-relative">
                        <img :src="img" class="rounded-3 object-fit-cover border" style="width: 70px; height: 70px;">
                        <button type="button" @click.prevent="removeImage(index)" class="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle rounded-circle p-0 d-flex justify-content-center align-items-center" style="width: 20px; height: 20px;">
                          <i class="bi bi-x" style="font-size: 0.8rem;"></i>
                        </button>
                        <span v-if="index === 0" class="position-absolute bottom-0 start-50 translate-middle-x badge bg-dark w-100" style="font-size: 0.55rem; border-radius: 0 0 8px 8px;">COVER</span>
                      </div>
                    </div>
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
                
                <div class="mb-3">
                  <label class="form-label small fw-bold text-dark">10-Digit Account Number</label>
                  <input type="text" v-model="withdrawForm.accountNumber" class="form-control" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" maxlength="10" required>
                </div>
                
                <div class="mb-4">
                  <label class="form-label small fw-bold text-dark">Account Name</label>
                  <input type="text" v-model="withdrawForm.accountName" class="form-control" placeholder="John Doe" style="background-color: #e9ecef; border: none; border-radius: 12px; padding: 12px 15px; font-weight: 500;" required>
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

const ADMIN_WA_NUMBER = '2348133874906' 

const router = useRouter()
const currentUser = ref(null)
const profile = ref(null)

const isLoading = ref(true)
const isProcessing = ref(false)
const isWithdrawing = ref(false)
const isPosting = ref(false)

const withdrawForm = ref({ amount: '', bankName: '', customBankName: '', accountNumber: '', accountName: '' })

const selectedFiles = ref([])
const imagePreviews = ref([])
const newProduct = ref({ title: '', price: '', category: 'Electronics & Tech', customCategory: '', condition: 'New', stock: 1, description: '' })

const hasActiveSubscription = computed(() => {
  if (!profile.value || !profile.value.subscription_ends_at) return false;
  return new Date(profile.value.subscription_ends_at) > new Date();
})

onMounted(async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (sessionData.session) {
    currentUser.value = sessionData.session.user
    const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', currentUser.value.id).single()
    profile.value = userProfile
  } else {
    router.push('/auth')
  }
  isLoading.value = false
})

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  if (files.length + selectedFiles.value.length > 5) return alert("You can only upload a maximum of 5 images per product.")
  
  files.forEach(file => {
    selectedFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (e) => imagePreviews.value.push(e.target.result)
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  selectedFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

const submitProduct = async () => {
  if (selectedFiles.value.length === 0) return alert("Please upload at least one image.");
  const finalCategory = newProduct.value.category === 'Other' ? newProduct.value.customCategory : newProduct.value.category;
  if (!finalCategory.trim()) return alert("Please specify your custom category.");

  isPosting.value = true;
  try {
    let uploadedUrls = []
    for (const file of selectedFiles.value) {
      const fileExt = file.name.split('.').pop()
      const fileName = `product_${currentUser.value.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)
      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
      uploadedUrls.push(publicUrlData.publicUrl)
    }

    const { error: dbError } = await supabase.from('products').insert([{
      seller_id: currentUser.value.id,
      title: newProduct.value.title,
      description: newProduct.value.description,
      price: newProduct.value.price,
      category: finalCategory,
      condition: newProduct.value.condition,
      stock: newProduct.value.stock,
      image_urls: uploadedUrls,
      is_approved: false
    }])

    if (dbError) throw new Error("Failed to post product: " + dbError.message)

    alert("Product submitted! Sending notification to Admin...")
    
    const msg = `Hello Admin, I just uploaded a new product titled *${newProduct.value.title}* for approval. \n\nMy username is @${profile.value.username}.`;
    window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    
    newProduct.value = { title: '', price: '', category: 'Electronics & Tech', customCategory: '', condition: 'New', stock: 1, description: '' }
    selectedFiles.value = []
    imagePreviews.value = []
    
  } catch (error) { alert(error.message) } finally { isPosting.value = false }
}

const processSubscription = () => {
  isProcessing.value = true; 
  if (window.PaystackPop) return launchPaystack();
  const script = document.createElement('script');
  script.src = "https://js.paystack.co/v1/inline.js";
  script.async = true;
  script.onload = () => launchPaystack();
  script.onerror = () => { alert("Failed to load secure payment gateway."); isProcessing.value = false; };
  document.body.appendChild(script);
};

const verifyAndSaveSubscription = async (reference) => {
  alert('Subscription Successful! Ref: ' + reference);
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    await supabase.from('profiles').update({ subscription_ends_at: expiryDate.toISOString() }).eq('id', currentUser.value.id);
    window.location.reload();
  } catch(err) { alert("Payment was successful, but we couldn't update your profile."); isProcessing.value = false; }
};

const launchPaystack = () => {
  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, 
    email: currentUser.value.email,
    amount: 2000 * 100, 
    currency: 'NGN',
    callback: function(response) { verifyAndSaveSubscription(response.reference); },
    onClose: function() { isProcessing.value = false; }
  });
  handler.openIframe();
};

const requestWithdrawal = async () => {
  // STRICT MATHEMATICAL VALIDATION
  const reqAmount = Number(withdrawForm.value.amount);
  const currentBal = Number(profile.value.wallet_balance || 0);

  if (reqAmount > currentBal) return alert("You cannot withdraw more than your available balance.");
  if (reqAmount < 100) return alert("Minimum withdrawal amount is ₦100.");

  const finalBankName = withdrawForm.value.bankName === 'Other' ? withdrawForm.value.customBankName : withdrawForm.value.bankName;
  if (!finalBankName.trim()) return alert("Please specify your bank name.");
  if (!withdrawForm.value.accountName.trim()) return alert("Please provide your account name.");

  isWithdrawing.value = true;
  try {
    const newBalance = currentBal - reqAmount;
    const { error: updateError } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', currentUser.value.id);
    if (updateError) throw updateError;

    const { error: txError } = await supabase.from('transactions').insert([{
      profile_id: currentUser.value.id,
      amount: reqAmount,
      type: 'debit',
      status: 'Pending',
      description: `Manual Payout - ${finalBankName} | Acct: ${withdrawForm.value.accountNumber} | Name: ${withdrawForm.value.accountName}`
    }]);

    if (txError) throw txError;
    
    alert("Withdrawal requested successfully! Notifying Admin...");
    
    const msg = `Hello Admin, I have requested a payout of *₦${reqAmount.toLocaleString()}* to ${finalBankName} (${withdrawForm.value.accountNumber} - ${withdrawForm.value.accountName}). \n\nMy username is @${profile.value.username}.`;
    window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    
    profile.value.wallet_balance = newBalance;
    withdrawForm.value = { amount: '', bankName: '', customBankName: '', accountNumber: '', accountName: '' };
  } catch (error) { alert("Withdrawal request failed: " + error.message); } finally { isWithdrawing.value = false; }
};
</script>

<style scoped>
input, select, textarea { font-size: 15px !important; }
</style>