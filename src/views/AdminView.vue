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

      <ul class="nav nav-tabs fw-bold mb-4 border-bottom-0 overflow-auto flex-nowrap" role="tablist">
        <li class="nav-item">
          <button class="nav-link active px-4 py-3 border-0 rounded-top-4 text-nowrap" data-bs-toggle="tab" data-bs-target="#withdrawals" type="button" style="background-color: #e9ecef; color: #082b59;">
            <i class="bi bi-bank me-2"></i> Payout Desk
            <span v-if="pendingWithdrawals.length > 0" class="badge bg-danger ms-2 rounded-pill">{{ pendingWithdrawals.length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link px-4 py-3 border-0 rounded-top-4 ms-2 text-nowrap" data-bs-toggle="tab" data-bs-target="#approvals" type="button" style="background-color: #e9ecef; color: #6c757d;">
            <i class="bi bi-bag-check me-2"></i> Product Approvals
            <span v-if="pendingProducts.length > 0" class="badge bg-danger ms-2 rounded-pill">{{ pendingProducts.length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link px-4 py-3 border-0 rounded-top-4 ms-2 text-nowrap" data-bs-toggle="tab" data-bs-target="#users" type="button" style="background-color: #e9ecef; color: #6c757d;">
            <i class="bi bi-people me-2"></i> User Management
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link px-4 py-3 border-0 rounded-top-4 ms-2 text-nowrap" data-bs-toggle="tab" data-bs-target="#logs" type="button" style="background-color: #e9ecef; color: #6c757d;">
            <i class="bi bi-journal-text me-2"></i> Audit Logs
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
                      <button @click="markAsPaid(req)" class="btn btn-success fw-bold rounded-pill px-4" :disabled="isProcessing">
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
                        <button @click="approveProduct(product)" class="btn btn-sm btn-success fw-bold rounded-pill px-3" :disabled="isProcessing"><i class="bi bi-check-lg"></i> Approve</button>
                        <button @click="rejectProduct(product)" class="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3" :disabled="isProcessing"><i class="bi bi-x-lg"></i> Reject</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="users" role="tabpanel">
          <div class="card shadow-sm border-0 rounded-4 bg-white p-4">
            <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-people-fill me-2"></i>User Database</h5>
              <select class="form-select w-auto bg-light border-0 fw-bold" v-model="userFilter">
                <option value="all">All Users</option>
                <option value="buyer">Buyers Only</option>
                <option value="seller">Sellers Only</option>
                <option value="suspended">Suspended/Banned</option>
                <option value="kyc_pending">Pending KYC</option>
              </select>
            </div>
            
            <div class="table-responsive" style="min-height: 300px;">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>KYC Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>
                      <div class="fw-bold text-dark" :class="{'text-decoration-line-through text-muted': user.status === 'deleted'}">
                        {{ user.business_name || user.first_name || 'Anonymous' }}
                      </div>
                      <small class="text-muted">@{{ user.username || 'user' }}</small>
                    </td>
                    <td>
                      <span class="badge" :class="user.role === 'seller' ? 'bg-primary' : 'bg-secondary'">{{ user.role.toUpperCase() }}</span>
                    </td>
                    <td>
                      <span v-if="user.status === 'active'" class="badge bg-success-subtle text-success border border-success">Active</span>
                      <div v-else-if="user.status === 'suspended'">
                        <span class="badge bg-warning-subtle text-warning border border-warning d-block mb-1">Suspended</span>
                        <small class="text-muted" style="font-size: 0.65rem;" v-if="user.suspension_ends_at">Until: {{ new Date(user.suspension_ends_at).toLocaleDateString() }}</small>
                      </div>
                      <span v-else-if="user.status === 'banned'" class="badge bg-danger-subtle text-danger border border-danger">Banned</span>
                      <span v-else-if="user.status === 'deleted'" class="badge bg-dark text-white border border-dark">Deleted</span>
                    </td>
                    <td>
                      <span v-if="user.is_verified" class="text-success fw-bold small"><i class="bi bi-patch-check-fill me-1"></i>Verified</span>
                      <button v-else-if="user.id_card_url" @click="viewAndVerifyKYC(user)" class="btn btn-sm btn-outline-primary rounded-pill fw-bold">Review ID Card</button>
                      <span v-else class="text-muted small">Not Submitted</span>
                    </td>
                    <td>
                      <div class="dropdown position-relative" v-if="user.status !== 'deleted'">
                        <button @click="toggleDropdown(user.id, $event)" class="btn btn-sm btn-dark fw-bold rounded-pill dropdown-toggle" type="button" :disabled="isProcessing">
                          Actions
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow" :class="{ 'show d-block': openDropdownId === user.id }" style="position: absolute; z-index: 1050; margin-top: 5px;">
                          <li><button v-if="user.status !== 'active'" @click="activateUser(user)" class="dropdown-item text-success fw-bold py-2"><i class="bi bi-check-circle me-2"></i>Activate / Unban</button></li>
                          <li><button v-if="user.status === 'active'" @click="suspendUser(user)" class="dropdown-item text-warning fw-bold py-2"><i class="bi bi-pause-circle me-2"></i>Suspend (Set Time)</button></li>
                          <li><hr class="dropdown-divider"></li>
                          <li><button v-if="user.status !== 'banned'" @click="banUser(user)" class="dropdown-item text-danger fw-bold py-2"><i class="bi bi-slash-circle me-2"></i>Permanently Ban</button></li>
                          <li><button @click="deleteUser(user)" class="dropdown-item text-dark fw-black py-2"><i class="bi bi-trash3-fill me-2"></i>Delete Data & Account</button></li>
                        </ul>
                      </div>
                      <span v-else class="text-muted small fw-bold">Wiped</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="logs" role="tabpanel">
          <div class="card shadow-sm border-0 rounded-4 bg-white p-4">
            <h5 class="fw-bold mb-4 border-bottom pb-3 text-dark"><i class="bi bi-journal-text me-2"></i>Admin Activity Log</h5>
            
            <div v-if="auditLogs.length === 0" class="text-center text-muted py-5">
              <h5>No admin actions recorded yet.</h5>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle small">
                <thead class="table-light">
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Admin Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in auditLogs" :key="log.id">
                    <td class="text-muted">{{ new Date(log.created_at).toLocaleString() }}</td>
                    <td>
                      <span class="badge bg-dark fw-bold">{{ log.action }}</span>
                    </td>
                    <td class="fw-semibold text-dark">{{ log.details }}</td>
                    <td><span class="text-primary fw-bold">@{{ log.profiles?.username || 'admin' }}</span></td>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const isLoading = ref(true)
const isProcessing = ref(false)
const isAdmin = ref(false)
const currentAdminId = ref(null)

// Native Dropdown State
const openDropdownId = ref(null)

const stats = ref({ totalUsers: 0, totalEscrow: 0 })
const pendingWithdrawals = ref([])
const pendingProducts = ref([])
const allUsers = ref([])
const auditLogs = ref([])
const userFilter = ref('all')

const filteredUsers = computed(() => {
  if (userFilter.value === 'all') return allUsers.value
  if (userFilter.value === 'buyer') return allUsers.value.filter(u => u.role === 'buyer')
  if (userFilter.value === 'seller') return allUsers.value.filter(u => u.role === 'seller')
  if (userFilter.value === 'suspended') return allUsers.value.filter(u => u.status === 'suspended' || u.status === 'banned')
  if (userFilter.value === 'kyc_pending') return allUsers.value.filter(u => u.id_card_url && !u.is_verified)
  return allUsers.value
})

const toggleDropdown = (id, event) => {
  event.stopPropagation()
  openDropdownId.value = openDropdownId.value === id ? null : id
}
const closeDropdown = () => { openDropdownId.value = null }

// =======================
// AUDIT LOG RECORDER
// =======================
const logAdminAction = async (actionType, actionDetails) => {
  try {
    await supabase.from('admin_logs').insert([{
      admin_id: currentAdminId.value,
      action: actionType,
      details: actionDetails
    }])
  } catch (error) {
    console.error("Failed to write to audit log:", error)
  }
}

const fetchAdminData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (!sessionData.session) return router.push('/')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', sessionData.session.user.id).single()
  if (!profile || profile.role !== 'admin') {
    isAdmin.value = false
    isLoading.value = false
    return
  }
  
  isAdmin.value = true
  currentAdminId.value = profile.id

  // Fetch Users
  const { data: usersList, count: userCount } = await supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  allUsers.value = usersList || []
  stats.value.totalUsers = userCount || 0
  if (usersList) stats.value.totalEscrow = usersList.reduce((sum, p) => sum + Number(p.escrow_balance || 0), 0)

  // Fetch Pending Data
  const { data: withdrawals } = await supabase.from('transactions').select(`*, profiles(business_name, first_name, username)`).eq('type', 'debit').eq('status', 'Pending').order('created_at', { ascending: true })
  pendingWithdrawals.value = withdrawals || []

  const { data: products } = await supabase.from('products').select(`*, profiles(business_name, first_name)`).eq('is_approved', false).order('created_at', { ascending: false })
  pendingProducts.value = products || []

  // Fetch Audit Logs
  const { data: logs } = await supabase.from('admin_logs').select(`*, profiles(username)`).order('created_at', { ascending: false }).limit(100)
  auditLogs.value = logs || []

  isLoading.value = false
}

// =======================
// MODERATION ACTIONS
// =======================
const markAsPaid = async (req) => {
  if (!confirm("Are you sure you have physically transferred this money?")) return;
  isProcessing.value = true
  try {
    const { error } = await supabase.from('transactions').update({ status: 'Completed', description: 'Paid via Bank Transfer' }).eq('id', req.id)
    if (error) throw error; 
    await logAdminAction('Payout Completed', `Processed ₦${req.amount} payout for @${req.profiles?.username || 'user'}`)
    alert("Success!"); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const approveProduct = async (product) => {
  isProcessing.value = true
  try {
    const { error } = await supabase.from('products').update({ is_approved: true }).eq('id', product.id)
    if (error) throw error; 
    await logAdminAction('Product Approved', `Approved product: "${product.title}" by @${product.profiles?.username || 'vendor'}`)
    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const rejectProduct = async (product) => {
  if (!confirm("Reject and delete this product?")) return;
  isProcessing.value = true
  try {
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) throw error; 
    await logAdminAction('Product Rejected', `Deleted rejected product: "${product.title}"`)
    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const activateUser = async (user) => {
  closeDropdown()
  if (!confirm("Restore full access to this user?")) return;
  isProcessing.value = true
  try {
    const { error } = await supabase.from('profiles').update({ status: 'active', suspension_ends_at: null }).eq('id', user.id)
    if (error) throw error; 
    await logAdminAction('Account Activated', `Restored access for @${user.username}`)
    alert("User activated."); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const suspendUser = async (user) => {
  closeDropdown()
  const days = prompt("Enter number of days to suspend this user:", "7");
  if (!days || isNaN(days)) return;
  const endDate = new Date(); endDate.setDate(endDate.getDate() + parseInt(days));

  isProcessing.value = true
  try {
    const { error } = await supabase.from('profiles').update({ status: 'suspended', suspension_ends_at: endDate.toISOString() }).eq('id', user.id)
    if (error) throw error; 
    await logAdminAction('Account Suspended', `Suspended @${user.username} for ${days} days.`)
    alert(`User suspended for ${days} days.`); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const banUser = async (user) => {
  closeDropdown()
  if (!confirm("Permanently ban this user? They will be locked out immediately.")) return;
  isProcessing.value = true
  try {
    const { error } = await supabase.from('profiles').update({ status: 'banned', suspension_ends_at: null }).eq('id', user.id)
    if (error) throw error; 
    await logAdminAction('Account Banned', `Permanently banned @${user.username}.`)
    alert("User banned."); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const deleteUser = async (user) => {
  closeDropdown()
  if (!confirm("CRITICAL WARNING: This will permanently wipe their profile data, hide their identity, and delete all their uploaded products. Proceed?")) return;
  
  isProcessing.value = true
  try {
    const { error: profErr } = await supabase.from('profiles').update({ 
      status: 'deleted', business_name: 'Deleted User', first_name: 'Deleted', last_name: 'User',
      username: 'deleted_' + user.id.substring(0,6), profile_image: null, bank_name: null, account_number: null,
      account_name: null, id_card_url: null, suspension_ends_at: null
    }).eq('id', user.id)
    if (profErr) throw profErr;

    await supabase.from('products').delete().eq('seller_id', user.id)
    
    await logAdminAction('Account Deleted', `Wiped all data and products for former user @${user.username}.`)
    alert("User data wiped and account marked as deleted."); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const viewAndVerifyKYC = async (user) => {
  window.open(user.id_card_url, '_blank');
  if (confirm(`Did the ID card match ${user.first_name || user.business_name}? Click OK to Verify.`)) {
    isProcessing.value = true
    try {
      const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id)
      if (error) throw error; 
      await logAdminAction('KYC Verified', `Approved ID Card for @${user.username}`)
      alert("User KYC Verified!"); await fetchAdminData()
    } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
  }
}

onMounted(() => {
  fetchAdminData()
  document.addEventListener('click', closeDropdown)
})
onUnmounted(() => { document.removeEventListener('click', closeDropdown) })
</script>

<style scoped>
.nav-tabs .nav-link.active {
  background-color: white !important;
  color: #082b59 !important;
  border-bottom: 3px solid #082b59 !important;
}
</style>