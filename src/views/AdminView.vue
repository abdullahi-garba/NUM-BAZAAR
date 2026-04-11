<template>
  <div class="container-fluid py-4 px-lg-5">
    
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 no-print">
      <h2 class="fw-bold mb-0" style="color: #082b59;">Admin Command Center</h2>
      <span class="badge rounded-pill px-3 py-2 text-uppercase" style="background-color: #b22b1d; letter-spacing: 0.05em;">Restricted Access</span>
    </div>

    <div v-if="isLoading" class="text-center py-5 no-print"><div class="spinner-border" style="color: #b22b1d;"></div></div>

    <div v-else-if="!isAdmin" class="text-center py-5 no-print">
      <i class="bi bi-exclamation-octagon-fill fs-1 mb-3 d-block" style="color: #b22b1d;"></i>
      <h3 class="fw-bold text-dark">Access Denied</h3>
    </div>

    <div v-else>
      <div class="row g-4 mb-5 no-print">
        <div class="col-md-4">
          <div class="p-4 bg-white shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); border-left: 4px solid #082b59;">
            <h6 class="text-secondary fw-bold text-uppercase mb-2">Total Users</h6>
            <h2 class="text-dark mb-0" style="font-weight: 900;">{{ stats.totalUsers }}</h2>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-4 bg-white shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); border-left: 4px solid #d97706;">
            <h6 class="text-secondary fw-bold text-uppercase mb-2">Escrow Locked</h6>
            <h2 class="text-dark mb-0" style="font-weight: 900;">₦{{ stats.totalEscrow.toLocaleString() }}</h2>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-4 bg-white shadow-sm" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); border-left: 4px solid #b22b1d;">
            <h6 class="text-secondary fw-bold text-uppercase mb-2">Pending Actions</h6>
            <h2 class="text-dark mb-0" style="font-weight: 900;">
              {{ pendingWithdrawals.length + pendingKYC.length + openTicketsCount + (allProducts.filter(p => !p.is_approved).length) }} 
              <span class="fs-6 text-danger ms-2 fw-bold" v-if="(pendingWithdrawals.length + pendingKYC.length + openTicketsCount + (allProducts.filter(p => !p.is_approved).length)) > 0">Action Required</span>
            </h2>
          </div>
        </div>
      </div>

      <div class="overflow-hidden bg-white shadow-sm mb-5" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
        
        <div class="d-flex overflow-auto border-bottom no-print" style="background-color: #f8f9fa; -ms-overflow-style: none; scrollbar-width: none;">
          <button @click="activeTab = 'payouts'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'payouts' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">
            Payout Desk <span v-if="pendingWithdrawals.length > 0" class="badge rounded-pill ms-2" style="background-color: #b22b1d;">{{ pendingWithdrawals.length }}</span>
          </button>
          
          <button @click="activeTab = 'approvals'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'approvals' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">
            Product Directory <span v-if="allProducts.filter(p => !p.is_approved).length > 0" class="badge rounded-pill ms-2" style="background-color: #b22b1d;">{{ allProducts.filter(p => !p.is_approved).length }}</span>
          </button>
          
          <button @click="activeTab = 'kyc'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'kyc' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">
            KYC Approvals <span v-if="pendingKYC.length > 0" class="badge rounded-pill ms-2" style="background-color: #b22b1d;">{{ pendingKYC.length }}</span>
          </button>
          
          <button @click="activeTab = 'users'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'users' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">User Management</button>
          
          <button @click="activeTab = 'tickets'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'tickets' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">
            Support Tickets <span v-if="openTicketsCount > 0" class="badge rounded-pill ms-2" style="background-color: #b22b1d;">{{ openTicketsCount }}</span>
          </button>
          
          <button @click="activeTab = 'broadcast'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'broadcast' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'"><i class="bi bi-megaphone-fill me-2"></i>Broadcast Desk</button>
          
          <button @click="clearLogFilter" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'logs' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">Audit Logs</button>
        </div>

        <div class="p-4" id="printable-area">
          
          <div v-if="activeTab === 'broadcast'" class="no-print">
            <h5 class="fw-bold mb-4 text-dark"><i class="bi bi-send-fill me-2"></i>Send Platform Announcements</h5>
            <div class="row">
              <div class="col-lg-8">
                <form @submit.prevent="sendBroadcast" class="bg-light p-4 rounded-4 border">
                  <div class="mb-3">
                    <label class="form-label fw-bold text-dark small text-uppercase">Target Audience</label>
                    <select v-model="broadcastForm.target" class="form-select bg-white border-0 fw-medium" required>
                      <option value="all">All Registered Users</option>
                      <option value="buyer">Buyers Only</option>
                      <option value="seller">Vendors (Sellers) Only</option>
                      <option value="specific">Specific User Email</option>
                    </select>
                  </div>
                  <div v-if="broadcastForm.target === 'specific'" class="mb-3">
                    <label class="form-label fw-bold text-dark small text-uppercase">Specific Email Address</label>
                    <input type="email" v-model="broadcastForm.specificEmail" class="form-control bg-white border-0" placeholder="user@newgate.edu">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold text-dark small text-uppercase">Subject / Title</label>
                    <input type="text" v-model="broadcastForm.subject" class="form-control bg-white border-0 fw-bold" placeholder="e.g., Important Security Update" required>
                  </div>
                  <div class="mb-4">
                    <label class="form-label fw-bold text-dark small text-uppercase">Message</label>
                    <textarea v-model="broadcastForm.message" class="form-control bg-white border-0" rows="6" placeholder="Type your announcement here..." required></textarea>
                  </div>
                  <div class="d-flex gap-4 mb-4 p-3 bg-white rounded-3 border">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" v-model="broadcastForm.sendInApp" id="inAppCheck">
                      <label class="form-check-label fw-bold text-dark" for="inAppCheck"><i class="bi bi-bell-fill text-warning me-1"></i> Send In-App Notification</label>
                    </div>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" v-model="broadcastForm.sendEmail" id="emailCheck">
                      <label class="form-check-label fw-bold text-dark" for="emailCheck"><i class="bi bi-envelope-fill text-primary me-1"></i> Send Email to Inbox</label>
                    </div>
                  </div>
                  <button type="submit" class="btn w-100 fw-bold py-3 rounded-pill shadow-sm" style="background-color: #082b59; color: white;" :disabled="isProcessing">
                    <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-rocket-takeoff-fill me-2"></i> Launch Broadcast
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'payouts'" class="no-print">
            <h5 class="fw-bold mb-4 text-dark">Action Required: Bank Transfers</h5>
            <div v-if="pendingWithdrawals.length === 0" class="text-center text-muted py-5"><i class="bi bi-check-circle fs-1 text-success mb-3 d-block"></i><h5 class="fw-bold">All clear! No pending payouts.</h5></div>
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead class="bg-light text-secondary small text-uppercase"><tr><th class="py-3 border-0 rounded-start">Vendor Info</th><th class="py-3 border-0">Amount</th><th class="py-3 border-0">Bank Details</th><th class="py-3 border-0 text-end rounded-end">Action</th></tr></thead>
                <tbody>
                  <tr v-for="req in pendingWithdrawals" :key="req.id">
                    <td class="py-3"><div class="fw-bold text-dark">{{ req.profiles?.business_name || req.profiles?.first_name || 'Unknown' }}</div><small class="text-secondary">@{{ req.profiles?.username || 'user' }}</small></td>
                    <td class="fw-bold" style="color: #b22b1d;">₦{{ Number(req.amount).toLocaleString() }}</td>
                    <td><div class="bg-light p-2 rounded small fw-medium text-dark">{{ req.description }}</div></td>
                    <td class="text-end"><button @click="markAsPaid(req)" class="btn btn-sm fw-bold rounded-pill px-3" style="background-color: #10b981; color: white;" :disabled="isProcessing"><i class="bi bi-check2-all me-1"></i> Mark Paid</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'approvals'" class="no-print">
            <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <h5 class="fw-bold mb-0 text-dark">Merchandise Directory</h5>
              <select class="form-select w-auto bg-light border-0 fw-bold text-dark" v-model="productFilter">
                <option value="pending">Pending Approvals</option>
                <option value="active">Active Products</option>
                <option value="delisted">De-listed / Hidden</option>
              </select>
            </div>
            <div v-if="filteredProducts.length === 0" class="text-center text-muted py-5"><h5 class="fw-bold">No products match this filter.</h5></div>
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead class="bg-light text-secondary small text-uppercase"><tr><th class="py-3 border-0 rounded-start">Product</th><th class="py-3 border-0">Details</th><th class="py-3 border-0">Status</th><th class="py-3 border-0 text-end rounded-end">Actions</th></tr></thead>
                <tbody>
                  <tr v-for="product in filteredProducts" :key="product.id">
                    <td class="py-3">
                      <div class="d-flex align-items-center">
                        <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/50'" class="rounded me-3 object-fit-cover" style="width: 50px; height: 50px;">
                        <div>
                          <span class="fw-bold d-block text-dark">{{ product.title }}</span>
                          <span class="small text-secondary">@{{ product.profiles?.business_name || 'Vendor' }}</span>
                        </div>
                      </div>
                    </td>
                    <td><div class="fw-bold" style="color: #b22b1d;">₦{{ Number(product.price).toLocaleString() }}</div><small class="text-secondary fw-medium">Stock: {{ product.stock }}</small></td>
                    <td>
                      <span v-if="!product.is_approved" class="badge bg-warning-subtle text-warning border">Pending</span>
                      <span v-else-if="!product.is_active" class="badge bg-danger-subtle text-danger border">De-listed</span>
                      <span v-else class="badge bg-success-subtle text-success border">Active</span>
                    </td>
                    <td class="text-end">
                      <div class="dropdown position-relative">
                        <button @click="toggleDropdown('prod_'+product.id, $event)" class="btn btn-sm btn-light border fw-bold rounded-pill dropdown-toggle" type="button" :disabled="isProcessing">Actions</button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0" :class="{ 'show d-block': openDropdownId === 'prod_'+product.id }" style="position: absolute; z-index: 1050; margin-top: 5px;">
                          <li><button v-if="!product.is_approved" @click="approveProduct(product)" class="dropdown-item text-success fw-bold py-2"><i class="bi bi-check-circle me-2"></i>Approve Listing</button></li>
                          <li><button v-if="product.is_approved && product.is_active" @click="toggleProductStatusAdmin(product)" class="dropdown-item text-warning fw-bold py-2"><i class="bi bi-eye-slash me-2"></i>Force De-list</button></li>
                          <li><button v-if="product.is_approved && !product.is_active" @click="toggleProductStatusAdmin(product)" class="dropdown-item text-primary fw-bold py-2"><i class="bi bi-eye me-2"></i>Re-list Product</button></li>
                          <li><hr class="dropdown-divider"></li>
                          <li><button @click="rejectProduct(product)" class="dropdown-item text-danger fw-bold py-2"><i class="bi bi-trash3-fill me-2"></i>Delete Permanently</button></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'kyc'" class="no-print">
            <h5 class="fw-bold mb-4 text-dark">Identity Verification (KYC)</h5>
            <div v-if="selectedKYCUser" class="p-4 mb-4" style="background-color: #f8f9fa; border-radius: 16px; border: 1px solid rgba(0,0,0,0.1);">
              <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h5 class="fw-bold m-0 text-dark">Reviewing Document for: <span style="color: #082b59;">{{ selectedKYCUser.first_name || selectedKYCUser.business_name }}</span></h5>
                <button class="btn-close" @click="selectedKYCUser = null"></button>
              </div>
              <div class="row g-4 align-items-stretch">
                <div class="col-lg-7 text-center">
                  <div class="bg-white p-2 border rounded" style="box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <img :src="selectedKYCUser.id_card_url" class="img-fluid rounded" style="max-height: 400px; object-fit: contain;">
                  </div>
                </div>
                <div class="col-lg-5 d-flex flex-column">
                  <div class="bg-white p-4 border rounded mb-4 flex-grow-1" style="box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <h6 class="fw-bold text-secondary text-uppercase mb-3" style="letter-spacing: 0.05em; font-size: 0.8rem;">User Information</h6>
                    <ul class="list-unstyled mb-0 d-flex flex-column gap-3">
                      <li><small class="text-secondary d-block">Username</small> <strong class="text-dark">@{{ selectedKYCUser.username }}</strong></li>
                      <li><small class="text-secondary d-block">Email Address</small> <strong class="text-dark">{{ selectedKYCUser.email || 'Not provided' }}</strong></li>
                      <li><small class="text-secondary d-block">Document Type</small> <strong class="text-dark text-uppercase badge bg-info text-dark border">{{ selectedKYCUser.kyc_doc_type || 'ID Card' }}</strong></li>
                    </ul>
                  </div>
                  <div class="d-flex gap-2">
                    <button @click="approveKYC(selectedKYCUser)" class="btn flex-grow-1 rounded-pill fw-bold py-2" style="background-color: #10b981; color: white;" :disabled="isProcessing">
                      <i class="bi bi-check-circle me-1"></i> Approve
                    </button>
                    <button @click="rejectKYC(selectedKYCUser)" class="btn btn-outline-danger flex-grow-1 rounded-pill fw-bold py-2" :disabled="isProcessing">
                      <i class="bi bi-x-circle me-1"></i> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="pendingKYC.length === 0 && !selectedKYCUser" class="text-center text-muted py-5">
              <i class="bi bi-shield-check fs-1 text-success mb-3 d-block"></i>
              <h5 class="fw-bold">All caught up! No pending KYC requests.</h5>
            </div>
            
            <div v-else-if="!selectedKYCUser" class="table-responsive">
              <table class="table align-middle">
                <thead class="bg-light text-secondary small text-uppercase"><tr><th class="py-3 border-0 rounded-start">User Info</th><th class="py-3 border-0">Role</th><th class="py-3 border-0">Status</th><th class="py-3 border-0 text-end rounded-end">Action</th></tr></thead>
                <tbody>
                  <tr v-for="user in pendingKYC" :key="user.id">
                    <td class="py-3"><div class="fw-bold text-dark">{{ user.first_name || user.business_name || 'Unknown' }}</div><small class="text-secondary">@{{ user.username }}</small></td>
                    <td><span class="badge" style="background-color: #082b59;">{{ user.role.toUpperCase() }}</span></td>
                    <td><span class="badge bg-warning-subtle text-warning border border-warning">Pending Review</span></td>
                    <td class="text-end"><button @click="selectedKYCUser = user" class="btn btn-sm text-white fw-bold rounded-pill px-4 py-2 shadow-sm" style="background-color: #082b59;">Review Document</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'users'" class="no-print">
            <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <h5 class="fw-bold mb-0 text-dark">User Database</h5>
              <select class="form-select w-auto bg-light border-0 fw-bold text-dark" v-model="userFilter">
                <option value="all">All Users</option><option value="buyer">Buyers Only</option><option value="seller">Sellers Only</option>
                <option value="suspended">Suspended/Banned</option><option value="kyc_pending">Pending KYC</option>
              </select>
            </div>
            
            <div class="table-responsive">
              <table class="table align-middle">
                <thead class="bg-light text-secondary small text-uppercase">
                  <tr>
                    <th class="py-3 border-0 rounded-start">User</th>
                    <th class="py-3 border-0">Role</th>
                    <th class="py-3 border-0">Balances</th>
                    <th class="py-3 border-0">Status</th>
                    <th class="py-3 border-0">KYC</th>
                    <th class="py-3 border-0 text-end rounded-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td class="py-3">
                      <div class="fw-bold text-dark" :class="{'text-decoration-line-through text-muted': user.status === 'deleted'}">{{ user.business_name || user.first_name || 'Anonymous' }}</div>
                      <small class="text-secondary fw-medium">@{{ user.username || 'user' }}</small>
                    </td>
                    <td><span class="badge" :style="user.role === 'seller' ? 'background-color: #082b59;' : 'background-color: #6b7280;'">{{ user.role.toUpperCase() }}</span></td>
                    
                    <td>
                      <div v-if="['seller', 'external'].includes(user.role)">
                        <div class="small fw-black text-success mb-1" style="font-size: 0.75rem;">W: ₦{{ Number(user.wallet_balance || 0).toLocaleString() }}</div>
                        <div class="small fw-black" style="color: #f59e0b; font-size: 0.75rem;">E: ₦{{ Number(user.escrow_balance || 0).toLocaleString() }}</div>
                      </div>
                      <span v-else class="text-muted small fw-medium">N/A</span>
                    </td>

                    <td>
                      <span v-if="user.status === 'active'" class="badge bg-success-subtle text-success">Active</span>
                      <div v-else-if="user.status === 'suspended'"><span class="badge bg-warning-subtle text-warning d-block mb-1">Suspended</span><small class="text-secondary" style="font-size: 0.65rem;" v-if="user.suspension_ends_at">Until: {{ new Date(user.suspension_ends_at).toLocaleDateString() }}</small></div>
                      <span v-else-if="user.status === 'banned'" class="badge bg-danger-subtle text-danger">Banned</span>
                      <span v-else-if="user.status === 'deleted'" class="badge bg-dark text-white">Deleted</span>
                    </td>
                    <td>
                      <span v-if="user.is_verified" class="text-success fw-bold small"><i class="bi bi-patch-check-fill me-1"></i>Verified</span>
                      <button v-else-if="user.id_card_url" @click="activeTab = 'kyc'; selectedKYCUser = user" class="btn btn-sm btn-outline-primary rounded-pill fw-bold" style="border-color: #082b59; color: #082b59;">Review ID</button>
                      <span v-else class="text-secondary small fw-medium">Not Submitted</span>
                    </td>
                    <td class="text-end">
                      <div class="dropdown position-relative" v-if="user.status !== 'deleted'">
                        <button @click="toggleDropdown(user.id, $event)" class="btn btn-sm btn-light border fw-bold rounded-pill dropdown-toggle" type="button" :disabled="isProcessing">Actions</button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0" :class="{ 'show d-block': openDropdownId === user.id }" style="position: absolute; z-index: 1050; margin-top: 5px;">
                          <li><button @click="viewUserLogs(user.username)" class="dropdown-item text-dark fw-bold py-2"><i class="bi bi-file-text-fill me-2"></i>View Activity Logs</button></li>
                          <li><hr class="dropdown-divider"></li>
                          
                          <li><button v-if="!user.is_verified" @click="forceVerifyUser(user)" class="dropdown-item text-primary fw-bold py-2"><i class="bi bi-shield-fill-check me-2"></i>Force Verify</button></li>
                          
                          <li><button v-if="user.status !== 'active'" @click="activateUser(user)" class="dropdown-item text-success fw-bold py-2"><i class="bi bi-check-circle me-2"></i>Activate / Unban</button></li>
                          <li><button v-if="user.status === 'active'" @click="suspendUser(user)" class="dropdown-item text-warning fw-bold py-2"><i class="bi bi-pause-circle me-2"></i>Suspend (Set Time)</button></li>
                          <li><button v-if="user.status !== 'banned'" @click="banUser(user)" class="dropdown-item text-danger fw-bold py-2"><i class="bi bi-slash-circle me-2"></i>Permanently Ban</button></li>
                          
                          <li><button @click="deleteUser(user)" class="dropdown-item text-dark fw-black py-2"><i class="bi bi-trash3-fill me-2"></i>Wipe Data & Account</button></li>
                        </ul>
                      </div>
                      <span v-else class="text-muted small fw-bold">Wiped</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'tickets'" class="no-print">
            <h5 class="fw-bold mb-4 text-dark">Support & Dispute Resolution</h5>
            <div v-if="tickets.length === 0" class="text-center text-muted py-5"><i class="bi bi-inbox fs-1 text-secondary mb-3 d-block"></i><h5 class="fw-bold">Inbox Empty</h5></div>
            <div v-else class="accordion" id="ticketsAccordion">
              <div v-for="(ticket, index) in tickets" :key="ticket.id" class="accordion-item border-0 mb-3 bg-light rounded-3 overflow-hidden shadow-sm">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed bg-white fw-bold text-dark d-flex justify-content-between align-items-center" type="button" data-bs-toggle="collapse" :data-bs-target="'#ticket-' + index" style="box-shadow: none;">
                    <span class="d-flex align-items-center gap-3 w-100 pe-3">
                      <span class="badge" :class="ticket.status === 'open' ? 'bg-danger' : 'bg-success'">{{ ticket.status.toUpperCase() }}</span>
                      <span class="text-truncate" style="max-width: 60%;">{{ ticket.subject }}</span>
                      <span class="small text-secondary ms-auto fw-normal">{{ new Date(ticket.created_at).toLocaleDateString() }}</span>
                    </span>
                  </button>
                </h2>
                <div :id="'ticket-' + index" class="accordion-collapse collapse" data-bs-parent="#ticketsAccordion">
                  <div class="accordion-body bg-white border-top">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p class="small text-secondary mb-0 fw-bold text-uppercase">Reported By</p>
                        <p class="fw-bold text-dark mb-0">@{{ ticket.profiles?.username || 'Unknown' }}</p>
                      </div>
                    </div>
                    <div class="p-3 bg-light rounded-3 mb-3"><p class="mb-0 fw-medium text-dark" style="white-space: pre-wrap;">{{ ticket.description }}</p></div>
                    <div class="d-flex justify-content-end gap-2">
                      <button v-if="ticket.status === 'open'" @click="resolveTicket(ticket.id)" class="btn" style="background-color: #10b981; color: white; font-weight: bold; border-radius: 999px; padding: 6px 20px;" :disabled="isProcessing">
                        <i class="bi bi-check-lg me-1"></i> Mark as Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'logs'">
            <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <h5 class="fw-bold text-dark mb-0">System Activity Log <span v-if="logFilterUsername" class="badge bg-secondary ms-2">Filtered: @{{ logFilterUsername }}</span></h5>
              <button @click="printLogs" class="btn btn-outline-dark btn-sm fw-bold rounded-pill no-print"><i class="bi bi-printer-fill me-1"></i> Print Report</button>
            </div>
            <div v-if="filteredLogs.length === 0" class="text-center text-secondary py-5 fw-medium no-print">No admin actions recorded yet.</div>
            <div v-else class="table-responsive">
              <div class="d-none print-only-header text-center mb-4"><h3 class="fw-black text-dark">NUM BAZAAR</h3><h4>Official Audit Report</h4><p>Generated on: {{ new Date().toLocaleString() }}</p><p v-if="logFilterUsername">Specific Query: User @{{ logFilterUsername }}</p><hr></div>
              <table class="table align-middle small table-bordered">
                <thead class="bg-light text-secondary text-uppercase"><tr><th class="py-3 border-0 rounded-start">Timestamp</th><th class="py-3 border-0">Action</th><th class="py-3 border-0">Details</th><th class="py-3 border-0 text-end rounded-end">Admin</th></tr></thead>
                <tbody>
                  <tr v-for="log in filteredLogs" :key="log.id">
                    <td class="text-secondary py-3 fw-medium">{{ new Date(log.created_at).toLocaleString() }}</td>
                    <td><span class="badge bg-dark fw-bold">{{ log.action }}</span></td>
                    <td class="fw-semibold text-dark">{{ log.details }}</td>
                    <td class="text-end"><span class="fw-bold" style="color: #082b59;">@{{ log.profiles?.username || 'admin' }}</span></td>
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

const activeTab = ref('payouts')
const openDropdownId = ref(null)

const stats = ref({ totalUsers: 0, totalEscrow: 0 })
const pendingWithdrawals = ref([])
const allProducts = ref([])
const allUsers = ref([])
const auditLogs = ref([])
const tickets = ref([]) 
const userFilter = ref('all')
const productFilter = ref('pending')
const logFilterUsername = ref(null)
const selectedKYCUser = ref(null)

const broadcastForm = ref({ target: 'all', specificEmail: '', subject: '', message: '', sendInApp: true, sendEmail: false })

const filteredUsers = computed(() => {
  if (userFilter.value === 'all') return allUsers.value
  if (userFilter.value === 'buyer') return allUsers.value.filter(u => u.role === 'buyer')
  if (userFilter.value === 'seller') return allUsers.value.filter(u => u.role === 'seller' || u.role === 'external')
  if (userFilter.value === 'suspended') return allUsers.value.filter(u => u.status === 'suspended' || u.status === 'banned')
  if (userFilter.value === 'kyc_pending') return allUsers.value.filter(u => u.id_card_url && !u.is_verified)
  return allUsers.value
})

const filteredProducts = computed(() => {
  if (productFilter.value === 'pending') return allProducts.value.filter(p => !p.is_approved)
  if (productFilter.value === 'active') return allProducts.value.filter(p => p.is_approved && p.is_active)
  if (productFilter.value === 'delisted') return allProducts.value.filter(p => p.is_approved && !p.is_active)
  return allProducts.value
})

const pendingKYC = computed(() => allUsers.value.filter(u => u.id_card_url && !u.is_verified))
const openTicketsCount = computed(() => tickets.value.filter(t => t.status === 'open').length)
const filteredLogs = computed(() => !logFilterUsername.value ? auditLogs.value : auditLogs.value.filter(log => log.details.includes(`@${logFilterUsername.value}`)))

const toggleDropdown = (id, event) => { event.stopPropagation(); openDropdownId.value = openDropdownId.value === id ? null : id }
const closeDropdown = () => { openDropdownId.value = null }
const logAdminAction = async (actionType, actionDetails) => { try { await supabase.from('admin_logs').insert([{ admin_id: currentAdminId.value, action: actionType, details: actionDetails }]) } catch (e) {} }

const fetchAdminData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) return router.push('/')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', sessionData.session.user.id).single()
  if (!profile || profile.role !== 'admin') { isAdmin.value = false; isLoading.value = false; return }
  
  isAdmin.value = true; currentAdminId.value = profile.id

  const { data: usersList, count: userCount } = await supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  allUsers.value = usersList || []
  stats.value.totalUsers = userCount || 0
  if (usersList) stats.value.totalEscrow = usersList.reduce((sum, p) => sum + Number(p.escrow_balance || 0), 0)

  const { data: withdrawals } = await supabase.from('transactions').select(`*, profiles(business_name, first_name, username, phone_number)`).eq('type', 'debit').eq('status', 'Pending').order('created_at', { ascending: true })
  pendingWithdrawals.value = withdrawals || []

  const { data: products } = await supabase.from('products').select(`*, profiles(business_name, first_name, phone_number)`).order('created_at', { ascending: false })
  allProducts.value = products || []

  const { data: logs } = await supabase.from('admin_logs').select(`*, profiles(username)`).order('created_at', { ascending: false }).limit(500)
  auditLogs.value = logs || []

  const { data: ticketsData } = await supabase.from('tickets').select('*, profiles(username, role)').order('created_at', { ascending: false })
  tickets.value = ticketsData || []

  isLoading.value = false
}

// Universal WhatsApp Redirection Helper with Fallback
const openUserWA = (phone, text) => {
  if (!phone) {
    alert("Action recorded successfully, but the user has not provided a phone number to notify via WhatsApp.");
    return;
  }
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1);
  if (cleanPhone.startsWith('+')) cleanPhone = cleanPhone.slice(1);
  
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  const newWin = window.open(waUrl, '_blank');
  
  // Fallback if browser's aggressive popup blocker stops window.open
  if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
    window.location.href = waUrl;
  }
}

const sendBroadcast = async () => {
  if (!broadcastForm.value.sendInApp && !broadcastForm.value.sendEmail) return alert("You must select at least one delivery method (In-App or Email).")
  
  isProcessing.value = true
  try {
    let targetUsers = []
    if (broadcastForm.value.target === 'all') targetUsers = allUsers.value
    else if (broadcastForm.value.target === 'buyer') targetUsers = allUsers.value.filter(u => u.role === 'buyer')
    else if (broadcastForm.value.target === 'seller') targetUsers = allUsers.value.filter(u => u.role === 'seller' || u.role === 'external')
    else if (broadcastForm.value.target === 'specific') {
      targetUsers = allUsers.value.filter(u => u.email === broadcastForm.value.specificEmail)
      if (targetUsers.length === 0) throw new Error("No user found with that email address.")
    }

    if (targetUsers.length === 0) throw new Error("No users found in the selected target group.")

    if (broadcastForm.value.sendInApp) {
      const inAppPayload = targetUsers.map(u => ({ user_id: u.id, title: broadcastForm.value.subject, message: broadcastForm.value.message }))
      const { error } = await supabase.from('in_app_notifications').insert(inAppPayload)
      if (error) throw error
    }

    if (broadcastForm.value.sendEmail) {
      const emailPayload = targetUsers.map(u => ({ email_address: u.email, subject: broadcastForm.value.subject, html_body: `<div style="font-family: sans-serif;"><h2>${broadcastForm.value.subject}</h2><p style="white-space: pre-wrap;">${broadcastForm.value.message}</p></div>` }))
      const { error } = await supabase.from('email_queue').insert(emailPayload)
      if (error) throw error
    }

    await logAdminAction('System Broadcast', `Sent broadcast to ${broadcastForm.value.target} (${targetUsers.length} users).`)
    alert(`Success! Broadcast dispatched to ${targetUsers.length} users.`)
    broadcastForm.value = { target: 'all', specificEmail: '', subject: '', message: '', sendInApp: true, sendEmail: false }

  } catch (error) { alert("Broadcast Error: " + error.message) } finally { isProcessing.value = false }
}

const viewUserLogs = (username) => { closeDropdown(); logFilterUsername.value = username; activeTab.value = 'logs'; }
const clearLogFilter = () => { logFilterUsername.value = null; activeTab.value = 'logs'; }
const printLogs = () => { window.print(); }

const resolveTicket = async (ticketId) => {
  if (!confirm("Close this ticket and mark it as resolved?")) return
  isProcessing.value = true
  try {
    await supabase.from('tickets').update({ status: 'resolved' }).eq('id', ticketId)
    await logAdminAction('Ticket Resolved', `Resolved support ticket ID: ${ticketId}`)
    alert("Ticket resolved successfully."); window.dispatchEvent(new Event('admin_action_completed')); await fetchAdminData()
  } catch (error) { alert("Error resolving ticket: " + error.message) } finally { isProcessing.value = false }
}
const approveKYC = async (user) => {
  if (!confirm(`Approve KYC for ${user.first_name || user.business_name}?`)) return;
  isProcessing.value = true
  try {
    await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id)
    await logAdminAction('KYC Verified', `Approved ${user.kyc_doc_type || 'ID Card'} for @${user.username}`)
    
    const msg = `🎉 *KYC APPROVED*\n\nHello ${user.business_name || user.first_name}, your identity document has been approved! You now have full verified access to NUM BAZAAR.`;
    openUserWA(user.phone_number, msg);

    selectedKYCUser.value = null; 
    window.dispatchEvent(new Event('admin_action_completed')); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}
const rejectKYC = async (user) => {
  if (!confirm(`Reject KYC for ${user.first_name || user.business_name}?`)) return;
  isProcessing.value = true
  try {
    await supabase.from('profiles').update({ id_card_url: null, kyc_doc_type: null }).eq('id', user.id)
    await logAdminAction('KYC Rejected', `Rejected Document for @${user.username}`)
    alert("KYC Rejected."); selectedKYCUser.value = null; window.dispatchEvent(new Event('admin_action_completed')); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

// FIXED PAYOUT REDIRECT AND DESCRIPTION RETENTION
const markAsPaid = async (req) => {
  if (!confirm("Are you sure you have physically transferred this money?")) return;
  isProcessing.value = true
  try {
    // Only update status to preserve the bank details in the description
    await supabase.from('transactions').update({ status: 'Completed' }).eq('id', req.id)
    await logAdminAction('Payout Completed', `Processed ₦${req.amount} payout for @${req.profiles?.username || 'user'}`)
    
    // Extract the original bank details string
    const bankDetails = req.description ? req.description.replace('Manual Payout - ', '') : 'your provided bank account';

    const msg = `💰 *PAYOUT PROCESSED*\n\nHello ${req.profiles?.business_name || req.profiles?.first_name},\n\nYour payout request of *₦${req.amount.toLocaleString()}* has been successfully processed and the funds have been sent to the following account details:\n\n${bankDetails}\n\nThank you for selling on NUM BAZAAR!`;
    openUserWA(req.profiles?.phone_number, msg);

    window.dispatchEvent(new Event('admin_action_completed')); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const approveProduct = async (product) => {
  closeDropdown();
  isProcessing.value = true
  try {
    await supabase.from('products').update({ is_approved: true, is_active: true }).eq('id', product.id)
    await logAdminAction('Product Approved', `Approved product: "${product.title}"`)
    
    const msg = `✅ *PRODUCT APPROVED*\n\nHello ${product.profiles?.business_name || product.profiles?.first_name}, your product "${product.title}" has been approved and is now live on NUM BAZAAR!`;
    openUserWA(product.profiles?.phone_number, msg);

    window.dispatchEvent(new Event('admin_action_completed')); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const toggleProductStatusAdmin = async (product) => {
  closeDropdown();
  const newStatus = !product.is_active;
  if (!confirm(`Are you sure you want to force ${newStatus ? 're-list' : 'de-list'} "${product.title}"?`)) return;
  isProcessing.value = true
  try {
    await supabase.from('products').update({ is_active: newStatus }).eq('id', product.id)
    await logAdminAction('Product Status Changed', `Admin forced ${newStatus ? 'Re-list' : 'De-list'} on: "${product.title}"`)
    window.dispatchEvent(new Event('admin_action_completed')); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const rejectProduct = async (product) => {
  closeDropdown();
  if (!confirm("Reject and delete this product permanently?")) return;
  isProcessing.value = true
  try {
    await supabase.from('products').delete().eq('id', product.id)
    await logAdminAction('Product Deleted', `Admin deleted product: "${product.title}"`)
    window.dispatchEvent(new Event('admin_action_completed')); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const forceVerifyUser = async (user) => {
  closeDropdown();
  if (!confirm(`Are you sure you want to bypass KYC and instantly verify ${user.business_name || user.first_name}?`)) return;
  isProcessing.value = true;
  try {
    await supabase.from('profiles').update({ 
      is_verified: true, 
      kyc_doc_type: 'Admin Bypass',
      id_card_url: 'https://via.placeholder.com/400x200.png?text=Verified+by+Admin' 
    }).eq('id', user.id);
    
    await logAdminAction('KYC Bypassed', `Force verified @${user.username} for exhibition access.`);
    
    const msg = `🎉 *ACCOUNT VERIFIED*\n\nHello ${user.business_name || user.first_name}, the Admin team has manually verified your account! You now have full access to NUM BAZAAR.`;
    openUserWA(user.phone_number, msg);

    alert("User successfully verified!"); window.dispatchEvent(new Event('admin_action_completed')); await fetchAdminData();
  } catch (error) { alert("Error: " + error.message); } finally { isProcessing.value = false; }
}

const activateUser = async (user) => {
  closeDropdown(); if (!confirm("Restore full access?")) return; isProcessing.value = true
  try {
    await supabase.from('profiles').update({ status: 'active', suspension_ends_at: null }).eq('id', user.id)
    await logAdminAction('Account Activated', `Restored access for @${user.username}`)
    alert("User activated."); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const suspendUser = async (user) => {
  closeDropdown(); const days = prompt("Enter number of days:", "7"); if (!days || isNaN(days)) return;
  const endDate = new Date(); endDate.setDate(endDate.getDate() + parseInt(days));
  isProcessing.value = true
  try {
    await supabase.from('profiles').update({ status: 'suspended', suspension_ends_at: endDate.toISOString() }).eq('id', user.id)
    await logAdminAction('Account Suspended', `Suspended @${user.username} for ${days} days.`)
    
    const msg = `⚠️ *ACCOUNT SUSPENDED*\n\nHello ${user.username}, your NUM BAZAAR account has been suspended for ${days} days due to a violation of our marketplace policies. Please contact support if you believe this is an error.`;
    openUserWA(user.phone_number, msg);

    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const banUser = async (user) => {
  closeDropdown(); if (!confirm("Permanently ban this user?")) return; isProcessing.value = true
  try {
    await supabase.from('profiles').update({ status: 'banned', suspension_ends_at: null }).eq('id', user.id)
    await logAdminAction('Account Banned', `Permanently banned @${user.username}.`)
    
    const msg = `🚫 *ACCOUNT BANNED*\n\nHello ${user.username}, your NUM BAZAAR account has been permanently banned due to severe violations of our terms of service.`;
    openUserWA(user.phone_number, msg);

    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const deleteUser = async (user) => {
  closeDropdown(); if (!confirm("CRITICAL WARNING: This will permanently delete ALL user products, transactions, tickets, and data. Proceed?")) return; 
  isProcessing.value = true
  try {
    await supabase.from('products').delete().eq('seller_id', user.id)
    await supabase.from('transactions').delete().eq('profile_id', user.id)
    await supabase.from('support_tickets').delete().eq('user_id', user.id)
    await supabase.from('reviews').delete().eq('reviewer_id', user.id)
    await supabase.from('in_app_notifications').delete().eq('user_id', user.id)
    
    await supabase.from('profiles').update({ 
      status: 'deleted', 
      business_name: 'Deleted User', 
      first_name: 'Deleted', 
      last_name: 'User', 
      username: 'deleted_' + user.id.substring(0,6), 
      profile_image: null, 
      cover_image: null,
      phone_number: null,
      email: 'deleted@numbazaar.com',
      id_card_url: null, 
      kyc_doc_type: null,
      is_verified: false,
      wallet_balance: 0,
      escrow_balance: 0
    }).eq('id', user.id)
    
    await logAdminAction('Account Deleted', `Wiped all data for @${user.username}.`)
    alert("User data completely wiped and session terminated."); 
    window.dispatchEvent(new Event('admin_action_completed')); 
    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

onMounted(() => { fetchAdminData(); document.addEventListener('click', closeDropdown) })
onUnmounted(() => { document.removeEventListener('click', closeDropdown) })
</script>

<style scoped>
@media print {
  body * { visibility: hidden; }
  .no-print { display: none !important; }
  #printable-area, #printable-area * { visibility: visible; }
  .print-only-header { display: block !important; margin-bottom: 20px; }
  #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
  .table { border-collapse: collapse !important; }
  .table td, .table th { background-color: #fff !important; border: 1px solid #dee2e6 !important; padding: 8px !important; }
}
</style>