import { createRouter, createWebHistory } from 'vue-router'
import ShopView from '../views/ShopView.vue'
import AuthView from '../views/AuthView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminView from '../views/AdminView.vue'
import CartView from '../views/CartView.vue'
import SupportView from '../views/SupportView.vue'
import MessagesView from '../views/MessagesView.vue'
import AboutView from '../views/AboutView.vue'
import ProductView from '../views/ProductView.vue' // <-- IMPORTED PRODUCT PAGE

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/shop'
    },
    {
      path: '/shop',
      name: 'shop',
      component: ShopView
    },
    {
      // THE MISSING LINK! 
      path: '/product/:id',
      name: 'product',
      component: ProductView
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/profile/:id',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView
    },
    {
      path: '/support',
      name: 'support',
      component: SupportView
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessagesView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router