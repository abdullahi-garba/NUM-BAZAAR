<template>
  <div class="container py-4 mt-3 h-100">
    <div class="card shadow-sm border-0 rounded-4 overflow-hidden bg-white" style="height: 80vh;">
      <div class="row g-0 h-100">
        
        <div class="col-md-4 col-lg-3 border-end h-100 d-flex flex-column bg-light">
          <div class="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
            <h5 class="fw-black mb-0" style="color: #082b59;"><i class="bi bi-chat-dots-fill me-2"></i> Messages</h5>
          </div>
          
          <div v-if="isLoadingContacts" class="p-4 text-center"><div class="spinner-border spinner-border-sm text-primary"></div></div>
          
          <div v-else-if="conversations.length === 0" class="p-4 text-center text-muted small">
            No conversations yet. Message a vendor from their product page!
          </div>

          <div v-else class="list-group list-group-flush overflow-auto flex-grow-1">
            <button 
              v-for="contact in conversations" :key="contact.id" 
              @click="selectChat(contact)"
              class="list-group-item list-group-item-action p-3 border-bottom text-start"
              :class="{ 'bg-primary-subtle border-primary': activeChat?.id === contact.id }"
            >
              <div class="d-flex align-items-center">
                <img :src="contact.profile_image || 'https://via.placeholder.com/40'" class="rounded-circle me-3 object-fit-cover" style="width: 45px; height: 45px;">
                <div class="overflow-hidden w-100">
                  <h6 class="fw-bold mb-1 text-truncate text-dark">{{ contact.business_name || contact.first_name }}</h6>
                  <p class="mb-0 text-muted small text-truncate">@{{ contact.username }}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="col-md-8 col-lg-9 h-100 d-flex flex-column position-relative">
          
          <div v-if="!activeChat" class="d-flex flex-column justify-content-center align-items-center h-100 text-muted bg-white">
            <i class="bi bi-chat-square-text fs-1 mb-3 opacity-50"></i>
            <h5>Select a conversation</h5>
            <p>Choose a contact from the left to start chatting.</p>
          </div>

          <template v-else>
            <div class="p-3 border-bottom bg-white shadow-sm z-1 d-flex align-items-center">
              <img :src="activeChat.profile_image || 'https://via.placeholder.com/40'" class="rounded-circle me-3 object-fit-cover" style="width: 40px; height: 40px;">
              <div>
                <h6 class="fw-bold mb-0">{{ activeChat.business_name || activeChat.first_name }}</h6>
                <router-link :to="`/vendor/${activeChat.id}`" class="small text-decoration-none text-primary">View Profile</router-link>
              </div>
            </div>

            <div class="flex-grow-1 overflow-auto p-4 bg-light" id="chat-box" style="scroll-behavior: smooth;">
              <div v-if="isLoadingMessages" class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div></div>
              
              <div v-else class="d-flex flex-column gap-3">
                <div v-for="msg in activeMessages" :key="msg.id" 
                     class="d-flex flex-column" 
                     :class="msg.sender_id === currentUser.id ? 'align-items-end' : 'align-items-start'">
                  
                  <div class="p-3 rounded-4 shadow-sm" 
                       :style="msg.sender_id === currentUser.id ? 'background-color: #082b59; color: white; max-width: 75%; border-bottom-right-radius: 4px !important;' : 'background-color: white; color: #333; max-width: 75%; border-bottom-left-radius: 4px !important;'">
                    {{ msg.content }}
                  </div>
                  <small class="text-muted mt-1" style="font-size: 0.7rem;">
                    {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </small>
                </div>
              </div>
            </div>

            <div class="p-3 bg-white border-top">
              <form @submit.prevent="sendMessage" class="d-flex gap-2">
                <input type="text" v-model="newMessage" class="form-control rounded-pill bg-light border-0 px-4 py-2" placeholder="Type your message..." required autocomplete="off">
                <button type="submit" class="btn btn-primary rounded-pill px-4" :disabled="isSending" style="background-color: #082b59; border: none;">
                  <i class="bi bi-send-fill"></i>
                </button>
              </form>
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const currentUser = ref(null)
const conversations = ref([])
const activeChat = ref(null)
const activeMessages = ref([])
const newMessage = ref('')

const isLoadingContacts = ref(true)
const isLoadingMessages = ref(false)
const isSending = ref(false)

let realtimeChannel = null

const scrollToBottom = async () => {
  await nextTick()
  const box = document.getElementById('chat-box')
  if (box) box.scrollTop = box.scrollHeight
}

const loadConversations = async () => {
  isLoadingContacts.value = true
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) return;
  currentUser.value = sessionData.session.user

  // Fetch all messages involving this user to figure out who they've talked to
  const { data: msgs } = await supabase.from('messages')
    .select('sender_id, receiver_id')
    .or(`sender_id.eq.${currentUser.value.id},receiver_id.eq.${currentUser.value.id}`)
  
  if (msgs) {
    // Extract unique user IDs that are NOT the current user
    const contactIds = [...new Set(msgs.map(m => m.sender_id === currentUser.value.id ? m.receiver_id : m.sender_id))]
    
    if (contactIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', contactIds)
      conversations.value = profiles || []
    }
  }

  // If a user ID was passed in the URL (e.g. from clicking "Message Vendor"), open that chat immediately
  if (route.query.new_chat) {
    const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', route.query.new_chat).single()
    if (newProfile) {
      // Add to list if not there
      if (!conversations.value.find(c => c.id === newProfile.id)) {
        conversations.value.unshift(newProfile)
      }
      selectChat(newProfile)
    }
  }

  isLoadingContacts.value = false
}

const selectChat = async (contact) => {
  activeChat.value = contact
  isLoadingMessages.value = true
  
  // Fetch message history with this specific person
  const { data } = await supabase.from('messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUser.value.id},receiver_id.eq.${contact.id}),and(sender_id.eq.${contact.id},receiver_id.eq.${currentUser.value.id})`)
    .order('created_at', { ascending: true })
    
  activeMessages.value = data || []
  isLoadingMessages.value = false
  scrollToBottom()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeChat.value) return;
  isSending.value = true
  
  const msgText = newMessage.value
  newMessage.value = '' // clear input instantly for good UX

  await supabase.from('messages').insert([{
    sender_id: currentUser.value.id,
    receiver_id: activeChat.value.id,
    content: msgText
  }])
  
  isSending.value = false
}

const setupRealtime = () => {
  realtimeChannel = supabase.channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const newMsg = payload.new
      // If the incoming message belongs to the currently active chat, push it to the screen
      if (activeChat.value && 
         ((newMsg.sender_id === currentUser.value.id && newMsg.receiver_id === activeChat.value.id) || 
          (newMsg.sender_id === activeChat.value.id && newMsg.receiver_id === currentUser.value.id))) {
        activeMessages.value.push(newMsg)
        scrollToBottom()
      } else if (newMsg.receiver_id === currentUser.value.id) {
         // If we get a message from someone else, refresh the contact list to show them
         loadConversations()
      }
    })
    .subscribe()
}

onMounted(() => {
  loadConversations()
  setupRealtime()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
.list-group-item { cursor: pointer; transition: background-color 0.2s; }
.list-group-item:hover { background-color: #f8f9fa; }
/* Custom scrollbar for chat box */
#chat-box::-webkit-scrollbar { width: 6px; }
#chat-box::-webkit-scrollbar-track { background: transparent; }
#chat-box::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 10px; }
</style>