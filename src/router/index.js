import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

// We will build/update these views one by one
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import ShopView from '../views/ShopView.vue'
import ProductView from '../views/ProductView.vue'
import CartView from '../views/CartView.vue'
import DashboardView from '../views/DashboardView.vue' // Seller Hub & Wallet
import ProfileView from '../views/ProfileView.vue'     // Universal Profile & Buyer Orders
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/auth', name: 'auth', component: AuthView },
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/product/:id', name: 'product', component: ProductView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue')},
    { path: '/admin', name: 'admin', component: AdminView },
    {
      path: '/vendor/:id',
      name: 'vendorProfile',
      component: () => import('../views/VendorProfileView.vue')
    },
    {
      path: '/product/:id',
      name: 'productDetail',
      component: () => import('../views/ProductView.vue')
    },
  ]
})

// Keep the security guard
router.beforeEach(async (to, from) => {
  const { data: { session } } = await supabase.auth.getSession()
  const protectedRoutes = ['shop', 'cart', 'dashboard', 'admin', 'profile']

  if (protectedRoutes.includes(to.name) && !session) {
    return '/auth' 
  }
  return true
})

export default router