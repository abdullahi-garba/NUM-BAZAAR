<template>
  <div class="container py-5 mt-4">
    <div class="d-flex align-items-center mb-4 border-bottom pb-3">
      <h2 class="fw-black mb-0" style="color: #800000;"><i class="bi bi-shield-lock-fill me-2"></i>Admin Command Center</h2>
    </div>

    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-danger"></div></div>

    <div v-else-if="!isAdmin" class="text-center py-5">
      <i class="bi bi-exclamation-octagon-fill text-danger fs-1 mb-3 d-block"></i>
      <h3 class="fw-bold">Access Denied</h3>
      <p class="text-muted">You do not have the required clearance to view this page.</p>
    </div>

    <div v-else>
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 border-primary border-start border-4">
            <h6 class="fw-bold text-muted text-uppercase mb-2">Total Registered Users</h6>
            <h2 class="fw-black text-dark mb-0"><i class="bi bi-people-fill text-primary me-2"></i>{{ stats.totalUsers }}</h2>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 border-warning border-start border-4">
            <h6 class="fw-bold text-muted text-uppercase mb-2">Total Locked in Escrow</h6>
            <h2 class="fw-black text-dark mb-0"><i class="bi bi-safe2-fill text-warning me-2"></i>₦{{ stats.totalEscrow.toLocaleString() }}</h2>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 border-success border-start border-4">
            <h6 class="fw-bold text-muted text-uppercase mb-2">Pending Withdrawals</h6>
            <h2 class="fw-black text-dark mb-0"><i class="bi bi-cash-stack text-success me-2"></i>{{ pendingWithdrawals.length }}</h2>
          </div>
        </div>
      </div>

      <ul class="nav nav-tabs fw-bold mb-4 border-bottom-0" role="tablist">
        <li class="nav-item">
          <button class="nav-link active px-4 py-3 border-0 rounded-top-4" data-bs-toggle="tab" data-bs-target="#withdrawals" type="button" style="background-color: #e9ecef; color: #082b59;">
            <i class="bi bi-bank me-2"></i> Payout Desk
            <span v-if="pendingWithdrawals.length > 0" class="badge bg-danger ms-2 rounded-pill">{{ pendingWithdrawals.length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link px-4 py-3 border-0 rounded-top-4 ms-2" data-bs-toggle="tab" data-bs-target="#approvals" type="button" style="background-color: #e9ecef; color: #6c757d;">
            <i class="bi bi-bag-check me-2"></i> Product Approvals
            <span v-if="pendingProducts.length > 0" class="badge bg-danger ms-2 rounded-pill">{{ pendingProducts.length }}</span>
          </button>
        </li>
      </ul>

      <div class="tab-content">
        
        <div class="tab-pane fade show active" id="withdrawals" role="tabpanel">
          <div class="card shadow-sm border-0 rounded-4 bg-white p-4">
            <h5 class="fw-bold mb-4 border-bottom pb-3 text-dark"><i class="bi bi-cash-coin me-2"></i>Action Required: Bank Transfers</h5>
            
            <div v-if="pendingWithdrawals.length === 0" class="text-center text-muted py-5">
              <i class="bi bi-check-circle fs-1 text-success mb-3 d-block"></i>
              <h5>All clear! No pending payouts.</h5>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Seller Info</th>
                    <th>Amount to Pay</th>
                    <th>Bank Details</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="req in pendingWithdrawals" :key="req.id">
                    <td>
                      <div class="fw-bold text-dark">{{ req.profiles?.business_name || req.profiles?.first_name || 'Unknown Seller' }}</div>
                      <small class="text-muted">@{{ req.profiles?.username || 'user' }}</small>
                    </td>
                    <td class="fw-black text-danger">₦{{ Number(req.amount).toLocaleString() }}</td>
                    <td>
                      <div class="bg-light p-2 rounded-3 small fw-semibold text-dark" style="max-width: 300px;">
                        {{ req.description }}
                      </div>
                    </td>
                    <td>
                      <button @click="markAsPaid(req.id)" class="btn btn-success fw-bold rounded-pill px-4" :disabled="isProcessing">
                        <i class="bi bi-check2-all me-1"></i> Mark as Paid
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="approvals" role="tabpanel">
          <div class="card shadow-sm border-0 rounded-4 bg-white p-4">
            <h5 class="fw-bold mb-4 border-bottom pb-3 text-dark"><i class="bi bi-clipboard-check me-2"></i>Review New Merchandise</h5>
            
            <div v-if="pendingProducts.length === 0" class="text-center text-muted py-5">
              <h5>No pending products in the queue.</h5>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Price & Stock</th>
                    <th>Seller</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in pendingProducts" :key="product.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/50'" class="rounded-3 me-3" style="width: 50px; height: 50px; object-fit: cover;">
                        <div>
                          <span class="fw-bold d-block text-dark">{{ product.title }}</span>
                          <span class="badge bg-light text-secondary border">{{ product.category }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="fw-bold text-danger">₦{{ Number(product.price).toLocaleString() }}</div>
                      <small class="text-muted">Stock: {{ product.stock }}</small>
                    </td>
                    <td>
                      <span class="fw-semibold text-dark">{{ product.profiles?.business_name || product.profiles?.first_name || 'Vendor' }}</span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button @click="approveProduct(product.id)" class="btn btn-sm btn-success fw-bold rounded-pill px-3" :disabled="isProcessing"><i class="bi bi-check-lg"></i> Approve</button>
                        <button @click="rejectProduct(product.id)" class="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3" :disabled="isProcessing"><i class="bi bi-x-lg"></i> Reject</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const isLoading = ref(true)
const isProcessing = ref(false)
const isAdmin = ref(false)

const stats = ref({ totalUsers: 0, totalEscrow: 0 })
const pendingWithdrawals = ref([])
const pendingProducts = ref([])

const fetchAdminData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (!sessionData.session) {
    router.push('/')
    return
  }

  // 1. Verify Admin Status
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', sessionData.session.user.id).single()
  if (!profile || profile.role !== 'admin') {
    isAdmin.value = false
    isLoading.value = false
    return
  }
  
  isAdmin.value = true

  // 2. Fetch Platform Stats
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  stats.value.totalUsers = userCount || 0

  const { data: allProfiles } = await supabase.from('profiles').select('escrow_balance')
  if (allProfiles) {
    stats.value.totalEscrow = allProfiles.reduce((sum, p) => sum + Number(p.escrow_balance || 0), 0)
  }

  // 3. Fetch Pending Withdrawals (Transactions marked as Pending Debits, joining with the profiles table to get seller info)
  const { data: withdrawals } = await supabase.from('transactions')
    .select(`*, profiles(business_name, first_name, username)`)
    .eq('type', 'debit')
    .eq('status', 'Pending')
    .order('created_at', { ascending: true })
  pendingWithdrawals.value = withdrawals || []

  // 4. Fetch Pending Products (Products where is_approved is false)
  const { data: products } = await supabase.from('products')
    .select(`*, profiles(business_name, first_name)`)
    .eq('is_approved', false)
    .order('created_at', { ascending: false })
  pendingProducts.value = products || []

  isLoading.value = false
}

// ACTION: Mark Withdrawal as Paid
const markAsPaid = async (transactionId) => {
  if (!confirm("Are you sure you have physically transferred this money to the seller's bank account?")) return;
  
  isProcessing.value = true
  try {
    const { error } = await supabase.from('transactions').update({ status: 'Completed', description: 'Paid via Bank Transfer' }).eq('id', transactionId)
    if (error) throw error
    alert("Success! Transaction marked as completed.")
    await fetchAdminData() // Refresh the dashboard
  } catch (error) {
    alert("Error updating transaction: " + error.message)
  } finally {
    isProcessing.value = false
  }
}

// ACTION: Approve Product
const approveProduct = async (productId) => {
  isProcessing.value = true
  try {
    const { error } = await supabase.from('products').update({ is_approved: true }).eq('id', productId)
    if (error) throw error
    alert("Product approved! It is now live on the Campus Feed.")
    await fetchAdminData()
  } catch (error) {
    alert("Error approving product: " + error.message)
  } finally {
    isProcessing.value = false
  }
}

// ACTION: Reject Product (Deletes it completely)
const rejectProduct = async (productId) => {
  if (!confirm("Are you sure you want to reject and delete this product?")) return;
  isProcessing.value = true
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) throw error
    await fetchAdminData()
  } catch (error) {
    alert("Error rejecting product: " + error.message)
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => fetchAdminData())
</script>

<style scoped>
.nav-tabs .nav-link.active {
  background-color: white !important;
  color: #082b59 !important;
  border-bottom: 3px solid #082b59 !important;
}
</style>