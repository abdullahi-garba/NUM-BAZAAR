import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Bootstrap CSS & Icons
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Bootstrap JS (for dropdowns, toggles, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'