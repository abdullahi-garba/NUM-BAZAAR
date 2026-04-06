import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import ShopView from '../views/ShopView.vue'
import AuthView from '../views/AuthView.vue'
import ProductView from '../views/ProductView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import CartView from '../views/CartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/shop' },
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/product/:id', name: 'product', component: ProductView },
    { path: '/auth', name: 'auth', component: AuthView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/profile/:id', name: 'profile', component: ProfileView },
    { path: '/cart', name: 'cart', component: CartView }
  ],
  scrollBehavior() { return { top: 0 } }
})

// App Gate
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (to.name !== 'auth' && !session) next({ name: 'auth' })
  else if (to.name === 'auth' && session) next({ name: 'shop' })
  else next()
})

export default router