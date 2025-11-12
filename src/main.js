import { createApp } from 'vue'
import App from './App.vue'
import { setupCSP } from './composables/useCSP'
import { setupTrustedTypes } from './composables/useTrustedTypes'

// Configurar Trusted Types
const trustedTypesPolicy = setupTrustedTypes()

// Configurar CSP dinâmico
setupCSP(trustedTypesPolicy)

const app = createApp(App)

// Middleware global de segurança
app.config.globalProperties.$security = {
  sanitizeHTML: (html) => trustedTypesPolicy?.createHTML(html) || html
}

app.mount('#app')