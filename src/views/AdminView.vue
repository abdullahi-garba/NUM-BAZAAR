<template>
  <div class="container-fluid py-4 px-lg-5">
    
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h2 class="fw-bold mb-0" style="color: #082b59;">Admin Command Center</h2>
      <span class="badge rounded-pill px-3 py-2 text-uppercase" style="background-color: #b22b1d; letter-spacing: 0.05em;">Restricted Access</span>
    </div>

    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border" style="color: #b22b1d;"></div></div>

    <div v-else-if="!isAdmin" class="text-center py-5">
      <i class="bi bi-exclamation-octagon-fill fs-1 mb-3 d-block" style="color: #b22b1d;"></i>
      <h3 class="fw-bold text-dark">Access Denied</h3>
      <p class="text-secondary fw-medium">You do not have the required clearance to view this page.</p>
    </div>

    <div v-else>
      <div class="row g-4 mb-5">
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
              {{ pendingWithdrawals.length + pendingKYC.length + openTicketsCount }} 
              <span class="fs-6 text-danger ms-2 fw-bold" v-if="(pendingWithdrawals.length + pendingKYC.length + openTicketsCount) > 0">Action Required</span>
            </h2>
          </div>
        </div>
      </div>

      <div class="overflow-hidden bg-white shadow-sm mb-5" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
        
        <div class="d-flex overflow-auto border-bottom" style="background-color: #f8f9fa; -ms-overflow-style: none; scrollbar-width: none;">
          <button @click="activeTab = 'payouts'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'payouts' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">Payout Desk</button>
          <button @click="activeTab = 'approvals'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'approvals' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">Product Approvals</button>
          
          <button @click="activeTab = 'kyc'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'kyc' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">
            KYC Approvals 
            <span v-if="pendingKYC.length > 0" class="badge rounded-pill ms-2" style="background-color: #b22b1d;">{{ pendingKYC.length }}</span>
          </button>
          
          <button @click="activeTab = 'users'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'users' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">User Management</button>
          
          <button @click="activeTab = 'tickets'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'tickets' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">
            Support Tickets
            <span v-if="openTicketsCount > 0" class="badge rounded-pill ms-2" style="background-color: #b22b1d;">{{ openTicketsCount }}</span>
          </button>

          <button @click="activeTab = 'team'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'team' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">Team Settings</button>
          <button @click="activeTab = 'logs'" class="btn rounded-0 px-4 py-3 fw-bold border-0 text-nowrap" :style="activeTab === 'logs' ? 'color: #082b59; border-bottom: 3px solid #082b59 !important; background: white;' : 'color: #6b7280;'">Audit Logs</button>
        </div>

        <div class="p-4">
          
          <div v-if="activeTab === 'payouts'">
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

          <div v-if="activeTab === 'approvals'">
            <h5 class="fw-bold mb-4 text-dark">Review New Merchandise</h5>
            <div v-if="pendingProducts.length === 0" class="text-center text-muted py-5"><h5 class="fw-bold">No pending products in the queue.</h5></div>
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead class="bg-light text-secondary small text-uppercase"><tr><th class="py-3 border-0 rounded-start">Product</th><th class="py-3 border-0">Details</th><th class="py-3 border-0">Seller</th><th class="py-3 border-0 text-end rounded-end">Actions</th></tr></thead>
                <tbody>
                  <tr v-for="product in pendingProducts" :key="product.id">
                    <td class="py-3">
                      <div class="d-flex align-items-center">
                        <img :src="product.image_urls?.[0] || 'https://via.placeholder.com/50'" class="rounded me-3 object-fit-cover" style="width: 50px; height: 50px;">
                        <div><span class="fw-bold d-block text-dark">{{ product.title }}</span><span class="badge bg-light text-secondary border mt-1">{{ product.category }}</span></div>
                      </div>
                    </td>
                    <td><div class="fw-bold" style="color: #b22b1d;">₦{{ Number(product.price).toLocaleString() }}</div><small class="text-secondary fw-medium">Stock: {{ product.stock }}</small></td>
                    <td><span class="fw-bold text-dark">{{ product.profiles?.business_name || product.profiles?.first_name || 'Vendor' }}</span></td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end gap-2">
                        <button @click="approveProduct(product)" class="btn btn-sm fw-bold rounded-pill px-3" style="background-color: #10b981; color: white;" :disabled="isProcessing">Approve</button>
                        <button @click="rejectProduct(product)" class="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3" :disabled="isProcessing">Reject</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'kyc'">
            <h5 class="fw-bold mb-4 text-dark">Identity Verification (KYC)</h5>
            
            <div v-if="selectedKYCUser" class="p-4 mb-4" style="background-color: #f8f9fa; border-radius: 16px; border: 1px solid rgba(0,0,0,0.1);">
              <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h5 class="fw-bold m-0 text-dark">Reviewing ID for: <span style="color: #082b59;">{{ selectedKYCUser.first_name || selectedKYCUser.business_name }}</span></h5>
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
                      <li><small class="text-secondary d-block">Account Role</small> <strong class="text-dark text-uppercase badge bg-light border text-secondary">{{ selectedKYCUser.role }}</strong></li>
                    </ul>
                  </div>
                  
                  <div class="d-flex gap-2">
                    <button @click="approveKYC(selectedKYCUser)" class="btn flex-grow-1 rounded-pill fw-bold py-2" style="background-color: #10b981; color: white;" :disabled="isProcessing">
                      <i class="bi bi-check-circle me-1"></i> Approve Identity
                    </button>
                    <button @click="rejectKYC(selectedKYCUser)" class="btn btn-outline-danger flex-grow-1 rounded-pill fw-bold py-2" :disabled="isProcessing">
                      <i class="bi bi-x-circle me-1"></i> Reject & Reset
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
                <thead class="bg-light text-secondary small text-uppercase">
                  <tr><th class="py-3 border-0 rounded-start">User Info</th><th class="py-3 border-0">Role</th><th class="py-3 border-0">Status</th><th class="py-3 border-0 text-end rounded-end">Action</th></tr>
                </thead>
                <tbody>
                  <tr v-for="user in pendingKYC" :key="user.id">
                    <td class="py-3">
                      <div class="fw-bold text-dark">{{ user.first_name || user.business_name || 'Unknown' }}</div>
                      <small class="text-secondary">@{{ user.username }}</small>
                    </td>
                    <td><span class="badge" style="background-color: #082b59;">{{ user.role.toUpperCase() }}</span></td>
                    <td><span class="badge bg-warning-subtle text-warning border border-warning">Pending Review</span></td>
                    <td class="text-end">
                      <button @click="selectedKYCUser = user" class="btn btn-sm text-white fw-bold rounded-pill px-4 py-2 shadow-sm" style="background-color: #082b59;">Review Document</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'users'">
            <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <h5 class="fw-bold mb-0 text-dark">User Database</h5>
              <select class="form-select w-auto bg-light border-0 fw-bold text-dark" v-model="userFilter">
                <option value="all">All Users</option><option value="buyer">Buyers Only</option><option value="seller">Sellers Only</option>
                <option value="suspended">Suspended/Banned</option><option value="kyc_pending">Pending KYC</option>
              </select>
            </div>
            
            <div class="table-responsive">
              <table class="table align-middle">
                <thead class="bg-light text-secondary small text-uppercase"><tr><th class="py-3 border-0 rounded-start">User</th><th class="py-3 border-0">Role</th><th class="py-3 border-0">Status</th><th class="py-3 border-0">KYC</th><th class="py-3 border-0 text-end rounded-end">Actions</th></tr></thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td class="py-3">
                      <div class="fw-bold text-dark" :class="{'text-decoration-line-through text-muted': user.status === 'deleted'}">{{ user.business_name || user.first_name || 'Anonymous' }}</div>
                      <small class="text-secondary fw-medium">@{{ user.username || 'user' }}</small>
                    </td>
                    <td><span class="badge" :style="user.role === 'seller' ? 'background-color: #082b59;' : 'background-color: #6b7280;'">{{ user.role.toUpperCase() }}</span></td>
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

          <div v-if="activeTab === 'tickets'">
            <h5 class="fw-bold mb-4 text-dark">Support & Dispute Resolution</h5>

            <div v-if="tickets.length === 0" class="text-center text-muted py-5">
              <i class="bi bi-inbox fs-1 text-secondary mb-3 d-block"></i>
              <h5 class="fw-bold">Inbox Empty</h5>
              <p class="text-secondary fw-medium">No active support tickets in the system.</p>
            </div>

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
                        <p class="small text-secondary mb-0 fw-bold text-uppercase" style="letter-spacing: 0.05em;">Reported By</p>
                        <p class="fw-bold text-dark mb-0">@{{ ticket.profiles?.username || 'Unknown' }} ({{ ticket.profiles?.role || 'user' }})</p>
                      </div>
                      <button @click="router.push(`/profile/${ticket.user_id}`)" class="btn btn-sm btn-outline-dark rounded-pill fw-bold">View Profile</button>
                    </div>
                    
                    <div class="p-3 bg-light rounded-3 mb-3">
                      <p class="mb-0 fw-medium text-dark" style="white-space: pre-wrap;">{{ ticket.description }}</p>
                    </div>

                    <div class="d-flex justify-content-end gap-2">
                      <button v-if="ticket.status === 'open'" @click="resolveTicket(ticket.id)" class="btn" style="background-color: #10b981; color: white; font-weight: bold; border-radius: 999px; padding: 6px 20px;" :disabled="isProcessing">
                        <i class="bi bi-check-lg me-1"></i> Mark as Resolved
                      </button>
                      <button v-else class="btn btn-secondary btn-sm rounded-pill fw-bold px-3" disabled><i class="bi bi-check-all me-1"></i> Resolved</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'team'">
            <h5 class="fw-bold mb-4 text-dark border-bottom pb-3">Add Team Member</h5>
            <form @submit.prevent="addTeamMember" class="row g-3 mb-5">
              <div class="col-md-6">
                <label class="form-label small fw-bold text-secondary">Full Name</label>
                <input type="text" class="form-control" v-model="newTeam.name" style="background-color: #f3f4f6; border: none; border-radius: 8px; padding: 10px 15px;" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold text-secondary">Role / Title</label>
                <input type="text" class="form-control" v-model="newTeam.role" placeholder="e.g. Lead Developer" style="background-color: #f3f4f6; border: none; border-radius: 8px; padding: 10px 15px;" required>
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold text-secondary">Professional Bio</label>
                <textarea class="form-control" v-model="newTeam.bio" rows="3" style="background-color: #f3f4f6; border: none; border-radius: 8px; padding: 10px 15px;" required></textarea>
              </div>
              <div class="col-md-12">
                <label class="form-label small fw-bold text-secondary">Profile Photo</label>
                <input type="file" class="form-control" accept="image/*" @change="e => teamImageFile = e.target.files[0]" style="background-color: #f3f4f6; border: none; border-radius: 8px;" required>
              </div>
              
              <div class="col-md-3">
                <label class="form-label small fw-bold text-secondary"><i class="bi bi-github me-1"></i>GitHub URL</label>
                <input type="url" class="form-control form-control-sm" v-model="newTeam.github_url" style="background-color: #f3f4f6; border: none; border-radius: 8px;">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold text-secondary"><i class="bi bi-linkedin me-1"></i>LinkedIn URL</label>
                <input type="url" class="form-control form-control-sm" v-model="newTeam.linkedin_url" style="background-color: #f3f4f6; border: none; border-radius: 8px;">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold text-secondary"><i class="bi bi-twitter-x me-1"></i>X (Twitter) URL</label>
                <input type="url" class="form-control form-control-sm" v-model="newTeam.twitter_url" style="background-color: #f3f4f6; border: none; border-radius: 8px;">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-bold text-secondary"><i class="bi bi-envelope me-1"></i>Email Address</label>
                <input type="email" class="form-control form-control-sm" v-model="newTeam.email" style="background-color: #f3f4f6; border: none; border-radius: 8px;">
              </div>

              <div class="col-12 text-end mt-4">
                <button type="submit" class="btn fw-bold rounded-pill px-5" :disabled="isUploadingTeam" style="background-color: #082b59; color: white; border: none;">
                  {{ isUploadingTeam ? 'Uploading...' : 'Publish to About Page' }}
                </button>
              </div>
            </form>

            <h5 class="fw-bold mb-4 border-bottom pb-3 text-dark">Current Roster</h5>
            <div v-if="teamList.length === 0" class="text-center text-secondary py-4 fw-medium">No team members added yet.</div>
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead class="bg-light text-secondary small text-uppercase"><tr><th class="py-3 border-0 rounded-start">Member</th><th class="py-3 border-0">Role</th><th class="py-3 border-0">Links</th><th class="py-3 border-0 text-end rounded-end">Action</th></tr></thead>
                <tbody>
                  <tr v-for="member in teamList" :key="member.id">
                    <td class="py-3">
                      <div class="d-flex align-items-center">
                        <img :src="member.image_url" class="rounded-circle me-3 object-fit-cover shadow-sm" style="width: 50px; height: 50px;">
                        <span class="fw-bold text-dark">{{ member.name }}</span>
                      </div>
                    </td>
                    <td><span class="badge" style="background-color: #082b59;">{{ member.role }}</span></td>
                    <td>
                      <div class="d-flex gap-3 text-secondary">
                        <i v-if="member.github_url" class="bi bi-github"></i>
                        <i v-if="member.linkedin_url" class="bi bi-linkedin"></i>
                        <i v-if="member.twitter_url" class="bi bi-twitter-x"></i>
                        <i v-if="member.email" class="bi bi-envelope"></i>
                      </div>
                    </td>
                    <td class="text-end">
                      <button @click="deleteTeamMember(member.id)" class="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3" :disabled="isProcessing">Remove</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'logs'">
            <h5 class="fw-bold mb-4 text-dark">Admin Activity Log</h5>
            <div v-if="auditLogs.length === 0" class="text-center text-secondary py-5 fw-medium">No admin actions recorded yet.</div>
            <div v-else class="table-responsive">
              <table class="table align-middle small">
                <thead class="bg-light text-secondary text-uppercase"><tr><th class="py-3 border-0 rounded-start">Timestamp</th><th class="py-3 border-0">Action</th><th class="py-3 border-0">Details</th><th class="py-3 border-0 text-end rounded-end">Admin</th></tr></thead>
                <tbody>
                  <tr v-for="log in auditLogs" :key="log.id">
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
const pendingProducts = ref([])
const allUsers = ref([])
const auditLogs = ref([])
const teamList = ref([])
const tickets = ref([]) // NEW: Support Tickets Array
const userFilter = ref('all')

const newTeam = ref({ name: '', role: '', bio: '', github_url: '', linkedin_url: '', twitter_url: '', email: '' })
const teamImageFile = ref(null)
const isUploadingTeam = ref(false)

// KYC Specific State
const selectedKYCUser = ref(null)

const filteredUsers = computed(() => {
  if (userFilter.value === 'all') return allUsers.value
  if (userFilter.value === 'buyer') return allUsers.value.filter(u => u.role === 'buyer')
  if (userFilter.value === 'seller') return allUsers.value.filter(u => u.role === 'seller')
  if (userFilter.value === 'suspended') return allUsers.value.filter(u => u.status === 'suspended' || u.status === 'banned')
  if (userFilter.value === 'kyc_pending') return allUsers.value.filter(u => u.id_card_url && !u.is_verified)
  return allUsers.value
})

const pendingKYC = computed(() => {
  return allUsers.value.filter(u => u.id_card_url && !u.is_verified)
})

// NEW: Computed count for Support Tickets
const openTicketsCount = computed(() => {
  return tickets.value.filter(t => t.status === 'open').length
})

const toggleDropdown = (id, event) => { event.stopPropagation(); openDropdownId.value = openDropdownId.value === id ? null : id }
const closeDropdown = () => { openDropdownId.value = null }

const logAdminAction = async (actionType, actionDetails) => {
  try { await supabase.from('admin_logs').insert([{ admin_id: currentAdminId.value, action: actionType, details: actionDetails }]) } catch (error) { console.error(error) }
}

const fetchAdminData = async () => {
  isLoading.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) return router.push('/')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', sessionData.session.user.id).single()
  if (!profile || profile.role !== 'admin') { isAdmin.value = false; isLoading.value = false; return }
  
  isAdmin.value = true
  currentAdminId.value = profile.id

  const { data: usersList, count: userCount } = await supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  allUsers.value = usersList || []
  stats.value.totalUsers = userCount || 0
  if (usersList) stats.value.totalEscrow = usersList.reduce((sum, p) => sum + Number(p.escrow_balance || 0), 0)

  const { data: withdrawals } = await supabase.from('transactions').select(`*, profiles(business_name, first_name, username)`).eq('type', 'debit').eq('status', 'Pending').order('created_at', { ascending: true })
  pendingWithdrawals.value = withdrawals || []

  const { data: products } = await supabase.from('products').select(`*, profiles(business_name, first_name)`).eq('is_approved', false).order('created_at', { ascending: false })
  pendingProducts.value = products || []

  const { data: logs } = await supabase.from('admin_logs').select(`*, profiles(username)`).order('created_at', { ascending: false }).limit(100)
  auditLogs.value = logs || []

  const { data: teamData } = await supabase.from('team_members').select('*').order('created_at', { ascending: true })
  teamList.value = teamData || []

  // NEW: Fetch Support Tickets
  const { data: ticketsData } = await supabase.from('tickets').select('*, profiles(username, role)').order('created_at', { ascending: false })
  tickets.value = ticketsData || []

  isLoading.value = false
}

// NEW: Resolve Ticket Function
const resolveTicket = async (ticketId) => {
  if (!confirm("Close this ticket and mark it as resolved?")) return
  isProcessing.value = true
  try {
    await supabase.from('tickets').update({ status: 'resolved' }).eq('id', ticketId)
    await logAdminAction('Ticket Resolved', `Resolved support ticket ID: ${ticketId}`)
    alert("Ticket resolved successfully.")
    await fetchAdminData()
  } catch (error) {
    alert("Error resolving ticket: " + error.message)
  } finally {
    isProcessing.value = false
  }
}

// KYC Approvals Logic
const approveKYC = async (user) => {
  if (!confirm(`Approve KYC for ${user.first_name || user.business_name}?`)) return;
  isProcessing.value = true
  try {
    await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id)
    await logAdminAction('KYC Verified', `Approved ID Card for @${user.username}`)
    alert("User Identity Verified successfully!"); 
    selectedKYCUser.value = null;
    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

const rejectKYC = async (user) => {
  if (!confirm(`Reject KYC for ${user.first_name || user.business_name}? They will need to re-upload their documents.`)) return;
  isProcessing.value = true
  try {
    await supabase.from('profiles').update({ id_card_url: null }).eq('id', user.id)
    await logAdminAction('KYC Rejected', `Rejected ID Card for @${user.username}`)
    alert("KYC Rejected. User must re-upload their document."); 
    selectedKYCUser.value = null;
    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

// Team Logic
const addTeamMember = async () => {
  if (!teamImageFile.value) return alert("Please select a profile picture.")
  isUploadingTeam.value = true
  try {
    const fileExt = teamImageFile.value.name.split('.').pop()
    const fileName = `team_${Date.now()}.${fileExt}`
    const { error: uploadErr } = await supabase.storage.from('team-photos').upload(fileName, teamImageFile.value)
    if (uploadErr) throw uploadErr

    const { data: publicUrlData } = supabase.storage.from('team-photos').getPublicUrl(fileName)

    const { error: dbErr } = await supabase.from('team_members').insert([{
      name: newTeam.value.name, role: newTeam.value.role, bio: newTeam.value.bio, image_url: publicUrlData.publicUrl,
      github_url: newTeam.value.github_url || null, linkedin_url: newTeam.value.linkedin_url || null, twitter_url: newTeam.value.twitter_url || null, email: newTeam.value.email || null
    }])
    if (dbErr) throw dbErr

    await logAdminAction('Team Updated', `Added new team member: ${newTeam.value.name}`)
    alert("Team Member added to the About Us page!")
    
    newTeam.value = { name: '', role: '', bio: '', github_url: '', linkedin_url: '', twitter_url: '', email: '' }
    teamImageFile.value = null
    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isUploadingTeam.value = false }
}

const deleteTeamMember = async (id) => {
  if (!confirm("Remove this team member?")) return;
  isProcessing.value = true
  try {
    await supabase.from('team_members').delete().eq('id', id)
    await logAdminAction('Team Updated', `Removed a team member.`)
    await fetchAdminData()
  } catch (error) { alert("Error deleting team member.") } finally { isProcessing.value = false }
}

// Global Logic
const markAsPaid = async (req) => {
  if (!confirm("Are you sure you have physically transferred this money?")) return;
  isProcessing.value = true
  try {
    await supabase.from('transactions').update({ status: 'Completed', description: 'Paid via Bank Transfer' }).eq('id', req.id)
    await logAdminAction('Payout Completed', `Processed ₦${req.amount} payout for @${req.profiles?.username || 'user'}`)
    alert("Success!"); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}
const approveProduct = async (product) => {
  isProcessing.value = true
  try {
    await supabase.from('products').update({ is_approved: true }).eq('id', product.id)
    await logAdminAction('Product Approved', `Approved product: "${product.title}"`)
    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}
const rejectProduct = async (product) => {
  if (!confirm("Reject and delete this product?")) return;
  isProcessing.value = true
  try {
    await supabase.from('products').delete().eq('id', product.id)
    await logAdminAction('Product Rejected', `Deleted rejected product: "${product.title}"`)
    await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
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
    alert(`User suspended.`); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}
const banUser = async (user) => {
  closeDropdown(); if (!confirm("Permanently ban this user?")) return; isProcessing.value = true
  try {
    await supabase.from('profiles').update({ status: 'banned', suspension_ends_at: null }).eq('id', user.id)
    await logAdminAction('Account Banned', `Permanently banned @${user.username}.`)
    alert("User banned."); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}
const deleteUser = async (user) => {
  closeDropdown(); if (!confirm("CRITICAL WARNING: Proceed?")) return; isProcessing.value = true
  try {
    await supabase.from('profiles').update({ status: 'deleted', business_name: 'Deleted User', first_name: 'Deleted', last_name: 'User', username: 'deleted_' + user.id.substring(0,6), profile_image: null, bank_name: null, account_number: null, account_name: null, id_card_url: null, suspension_ends_at: null }).eq('id', user.id)
    await supabase.from('products').delete().eq('seller_id', user.id)
    await logAdminAction('Account Deleted', `Wiped all data for @${user.username}.`)
    alert("User data wiped."); await fetchAdminData()
  } catch (error) { alert("Error: " + error.message) } finally { isProcessing.value = false }
}

onMounted(() => { fetchAdminData(); document.addEventListener('click', closeDropdown) })
onUnmounted(() => { document.removeEventListener('click', closeDropdown) })
</script>