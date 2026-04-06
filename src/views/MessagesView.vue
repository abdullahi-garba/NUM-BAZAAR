<template>
  <div class="container-fluid py-4 px-lg-5" style="height: calc(100vh - 80px);">
    <div class="row h-100 g-4">
      
      <div class="col-12 col-md-4 col-lg-3 h-100">
        <div class="h-100 d-flex flex-column overflow-hidden" style="background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
            <h4 class="mb-0 fw-bold" style="color: #111827;">Messages</h4>
            <button class="btn btn-sm btn-light rounded-circle"><i class="bi bi-pencil-square text-dark"></i></button>
          </div>

          <div class="p-3 border-bottom">
            <div class="position-relative">
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input type="text" class="form-control ps-5" placeholder="Search chats..." style="background-color: #f3f4f6; border: none; border-radius: 12px; font-weight: 500;">
            </div>
          </div>

          <div v-if="isLoadingContacts" class="p-4 text-center"><div class="spinner-border spinner-border-sm" style="color: #082b59;"></div></div>
          
          <div v-else-if="conversations.length === 0" class="p-4 text-center text-muted small fw-medium">
            No conversations yet. Message a vendor from their product page!
          </div>

          <div v-else class="overflow-auto flex-grow-1">
            <div v-for="contact in conversations" :key="contact.id" 
                 @click="selectChat(contact)"
                 class="d-flex align-items-center p-3 border-bottom" 
                 style="cursor: pointer; transition: background-color 0.2s;"
                 :style="activeChat?.id === contact.id ? 'border-left: 3px solid #b22b1d; background-color: #f8f9fa;' : 'background-color: transparent; border-left: 3px solid transparent;'">
              
              <div class="position-relative me-3">
                <img :src="contact.profile_image || `https://ui-avatars.com/api/?name=${contact.business_name || contact.first_name}&background=e9ecef&color=111827`" class="rounded-circle object-fit-cover" width="45" height="45">
                <span v-if="activeChat?.id === contact.id" class="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"></span>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <h6 class="mb-0 fw-bold text-dark text-truncate">{{ contact.business_name || contact.first_name }}</h6>
                </div>
                <p class="mb-0 text-secondary text-truncate" style="font-size: 0.85rem;">@{{ contact.username }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="col-12 col-md-8 col-lg-9 h-100 d-flex flex-column position-relative d-none d-md-block">
        
        <div v-if="!activeChat" class="h-100 d-flex flex-column justify-content-center align-items-center" style="background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          <div class="rounded-circle d-flex justify-content-center align-items-center mb-3" style="width: 80px; height: 80px; background-color: #f3f4f6; color: #9ca3af;">
            <i class="bi bi-chat-square-text fs-1"></i>
          </div>
          <h4 class="fw-bold" style="color: #111827;">Select a conversation</h4>
          <p class="text-secondary fw-medium">Choose a contact from the left to start chatting.</p>
        </div>

        <div v-else class="h-100 d-flex flex-column" style="background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <div class="p-3 border-bottom d-flex justify-content-between align-items-center" style="background-color: #082b59; border-top-left-radius: 16px; border-top-right-radius: 16px;">
            <div class="d-flex align-items-center">
              <img :src="activeChat.profile_image || `https://ui-avatars.com/api/?name=${activeChat.business_name || activeChat.first_name}&background=fff&color=082b59`" class="rounded-circle me-3 object-fit-cover" width="40" height="40">
              <div>
                <h6 class="mb-0 fw-bold text-white">{{ activeChat.business_name || activeChat.first_name }} <span class="badge ms-2" style="background-color: rgba(255,255,255,0.2); font-size: 0.6rem;">VERIFIED</span></h6>
                <router-link :to="`/vendor/${activeChat.id}`" class="text-white-50 text-decoration-none" style="font-size: 0.75rem;">View Profile</router-link>
              </div>
            </div>
            <div class="d-flex gap-3 text-white">
              <i class="bi bi-telephone-fill" style="cursor: pointer;"></i>
              <i class="bi bi-three-dots-vertical" style="cursor: pointer;"></i>
            </div>
          </div>

          <div class="flex-grow-1 overflow-auto p-4" id="chat-box" style="background: url('https://www.transparenttextures.com/patterns/cubes.png') #f8f9fa; scroll-behavior: smooth;">
            <div v-if="isLoadingMessages" class="text-center"><div class="spinner-border spinner-border-sm" style="color: #082b59;"></div></div>
            
            <div v-else class="d-flex flex-column gap-3">
              <div v-for="msg in activeMessages" :key="msg.id" class="d-flex flex-column" :class="msg.sender_id === currentUser.id ? 'align-items-end' : 'align-items-start'">
                
                <div class="d-flex align-items-start" :class="msg.sender_id === currentUser.id ? 'w-100 justify-content-end' : 'w-75'">
                  <img v-if="msg.sender_id !== currentUser.id" :src="activeChat.profile_image || `https://ui-avatars.com/api/?name=${activeChat.business_name || activeChat.first_name}&background=082b59&color=fff`" class="rounded-circle me-2 mt-auto" width="30" height="30">
                  
                  <div class="p-3" :style="msg.sender_id === currentUser.id ? 'background-color: #082b59; color: #ffffff; border-radius: 20px; border-bottom-right-radius: 4px;' : 'background-color: #e9ecef; color: #111827; border-radius: 20px; border-bottom-left-radius: 4px;'">
                    <p class="mb-1" style="font-weight: 500;">{{ msg.content }}</p>
                    <div :class="msg.sender_id === currentUser.id ? 'text-end' : 'text-start'">
                      <span :class="msg.sender_id === currentUser.id ? 'text-white-50' : 'text-secondary'" style="font-size: 0.7rem;">
                        {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} 
                        <i v-if="msg.sender_id === currentUser.id" class="bi bi-check2-all ms-1"></i>
                      </span>
                    </div>
                  </div>

                  <img v-if="msg.sender_id === currentUser.id" :src="`https://ui-avatars.com/api/?name=You&background=b22b1d&color=fff`" class="rounded-circle ms-2 mt-auto" width="30" height="30">
                </div>
              </div>
            </div>
          </div>

          <div class="p-3 border-top bg-white" style="border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
            <form @submit.prevent="sendMessage" class="d-flex align-items-center bg-light p-2" style="border-radius: 999px;">
              <button type="button" class="btn btn-light rounded-circle text-secondary border-0"><i class="bi bi-plus-lg"></i></button>
              <input type="text" v-model="newMessage" class="form-control border-0 bg-transparent shadow-none" placeholder="Type a secure message..." style="font-weight: 500;" required autocomplete="off">
              <button type="submit" class="btn rounded-circle d-flex justify-content-center align-items-center" :disabled="isSending" style="background-color: #b22b1d; color: white; width: 45px; height: 45px; border: none;">
                <i class="bi bi-send-fill"></i>
              </button>
            </form>
            <div class="text-center mt-2">
              <span class="text-secondary fw-bold" style="font-size: 0.65rem; letter-spacing: 0.05em;"><i class="bi bi-lock-fill"></i> END-TO-END ENCRYPTED STUDENT CHANNEL</span>
            </div>
          </div>

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

  const { data: msgs } = await supabase.from('messages')
    .select('sender_id, receiver_id')
    .or(`sender_id.eq.${currentUser.value.id},receiver_id.eq.${currentUser.value.id}`)
  
  if (msgs) {
    const contactIds = [...new Set(msgs.map(m => m.sender_id === currentUser.value.id ? m.receiver_id : m.sender_id))]
    if (contactIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', contactIds)
      conversations.value = profiles || []
    }
  }

  if (route.query.new_chat) {
    const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', route.query.new_chat).single()
    if (newProfile) {
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
  newMessage.value = ''

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
      if (activeChat.value && 
         ((newMsg.sender_id === currentUser.value.id && newMsg.receiver_id === activeChat.value.id) || 
          (newMsg.sender_id === activeChat.value.id && newMsg.receiver_id === currentUser.value.id))) {
        activeMessages.value.push(newMsg)
        scrollToBottom()
      } else if (newMsg.receiver_id === currentUser.value.id) {
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
#chat-box::-webkit-scrollbar { width: 6px; }
#chat-box::-webkit-scrollbar-track { background: transparent; }
#chat-box::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 10px; }
</style>