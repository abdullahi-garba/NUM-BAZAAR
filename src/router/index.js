import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import ShopView from '../views/ShopView.vue'
import AuthView from '../views/AuthView.vue'
import ProductView from '../views/ProductView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import CartView from '../views/CartView.vue'
import AboutView from '../views/AboutView.vue'
import AdminView from '../views/AdminView.vue'
import SupportView from '../views/SupportView.vue'
import TermsView from '../views/TermsView.vue'
import NotificationsView from '../views/NotificationsView.vue'

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
    { path: '/about', name: 'about', component: AboutView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/support', name: 'support', component: SupportView },
    { path: '/terms', name: 'terms', component: TermsView },
    { path: '/notifications', name: 'notifications', component: NotificationsView }
  ],
  scrollBehavior() { 
    return { top: 0 } 
  }
})

// Global App Gate Security
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (to.name !== 'auth' && to.name !== 'terms' && !session) {
    next({ name: 'auth' })
  } else if (to.name === 'auth' && session) {
    next({ name: 'shop' })
  } else if (to.name === 'admin' && session) {
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (data && data.role === 'admin') {
      next()
    } else {
      next({ name: 'shop' })
    }
  } else {
    next()
  }
})

export default router