<template>
  <div class="container py-5 mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h2 class="fw-black mb-0 text-dark"><i class="bi bi-bell-fill me-2"></i>Notifications</h2>
      <button v-if="notifications.length > 0" @click="markAllAsRead" class="btn btn-outline-dark btn-sm fw-bold rounded-pill">
        <i class="bi bi-check2-all me-1"></i> Mark All as Read
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else-if="notifications.length === 0" class="text-center py-5 bg-white shadow-sm rounded-4 border" style="border-color: rgba(0,0,0,0.05);">
      <i class="bi bi-bell-slash fs-1 text-secondary mb-3 d-block"></i>
      <h5 class="fw-bold text-dark">No new notifications</h5>
      <p class="text-secondary fw-medium">You're all caught up!</p>
    </div>

    <div v-else class="d-flex flex-column gap-3">
      <div v-for="note in notifications" :key="note.id" class="p-4 bg-white shadow-sm rounded-4 border d-flex gap-3" :style="note.is_read ? 'opacity: 0.7; border-color: rgba(0,0,0,0.05);' : 'border-left: 4px solid #b22b1d; border-color: rgba(0,0,0,0.05);'">
        <div class="mt-1">
          <i class="bi fs-4" :class="note.is_read ? 'bi-envelope-paper text-secondary' : 'bi-envelope-fill text-danger'"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h6 class="fw-bold text-dark mb-0">{{ note.title }}</h6>
            <small class="text-secondary fw-bold" style="font-size: 0.7rem;">{{ new Date(note.created_at).toLocaleString() }}</small>
          </div>
          <p class="text-secondary mb-0 fw-medium" style="white-space: pre-wrap;">{{ note.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const notifications = ref([])
const isLoading = ref(true)

const fetchNotifications = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return
  
  const { data } = await supabase.from('in_app_notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50)
    
  notifications.value = data || []
  isLoading.value = false

  // Mark them as read automatically after viewing
  const unreadIds = (data || []).filter(n => !n.is_read).map(n => n.id)
  if (unreadIds.length > 0) {
    await supabase.from('in_app_notifications').update({ is_read: true }).in('id', unreadIds)
    window.dispatchEvent(new Event('notifications_read'))
  }
}

const markAllAsRead = async () => {
  notifications.value.forEach(n => n.is_read = true)
  await fetchNotifications()
}

onMounted(() => fetchNotifications())
</script>