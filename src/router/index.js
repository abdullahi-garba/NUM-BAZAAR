import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import ShopView from '../views/ShopView.vue'
import AuthView from '../views/AuthView.vue'
import ProductView from '../views/ProductView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import CartView from '../views/CartView.vue'
import MessagesView from '../views/MessagesView.vue'
import AboutView from '../views/AboutView.vue'
import AdminView from '../views/AdminView.vue'
import SupportView from '../views/SupportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/shop' },
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/product/:id', name: 'product', component: ProductView },
    { path: '/auth', name: 'auth', component: AuthView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/profile/:id', name: 'profile', component: ProfileView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/messages', name: 'messages', component: MessagesView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/support', name: 'support', component: SupportView }
  ],
  scrollBehavior() { 
    return { top: 0 } 
  }
})

// Global App Gate Security
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  // Force login for protected routes
  if (to.name !== 'auth' && !session) {
    next({ name: 'auth' })
  } 
  // Prevent logged-in users from seeing login screen
  else if (to.name === 'auth' && session) {
    next({ name: 'shop' })
  } 
  // Admin Route Protection
  else if (to.name === 'admin' && session) {
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (data && data.role === 'admin') {
      next()
    } else {
      next({ name: 'shop' }) // Kick non-admins back to the feed
    }
  }
  // Allow normal navigation
  else {
    next()
  }
})

export default router