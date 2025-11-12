<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V10.7C15.4,10.9 16,11.3 16.5,11.9C17.4,13.4 17.3,15.3 16.2,16.6C15.8,17.1 15.2,17.5 14.6,17.7C14.3,17.9 14,18 13.7,18.1C13.4,18.2 13.1,18.2 12.8,18.3C12.5,18.4 12.3,18.4 12,18.4C11.7,18.4 11.5,18.4 11.2,18.3C10.9,18.2 10.6,18.2 10.3,18.1C10,18 9.7,17.9 9.4,17.7C8.8,17.5 8.2,17.1 7.8,16.6C6.7,15.3 6.6,13.4 7.5,11.9C8,11.3 8.6,10.9 9.2,10.7V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V10.7C10.2,10.9 10,11.1 9.8,11.4C9.3,12 9.1,12.7 9.1,13.5C9.1,14.2 9.3,14.9 9.8,15.5C10.3,16.1 11,16.5 11.8,16.5C12.6,16.5 13.3,16.1 13.8,15.5C14.3,14.9 14.5,14.2 14.5,13.5C14.5,12.7 14.3,12 13.8,11.4C13.6,11.1 13.4,10.9 13.1,10.7V9.5C13.1,8.7 12.8,8.2 12,8.2Z"/>
          </svg>
          Portal Seguro
        </div>
        <div class="header-status" v-if="isAuthenticated">
          <span class="status-indicator"></span>
          Autenticado
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="grid-container">
        <!-- Área de Autenticação -->
        <BiometricAuth 
          @authenticated="handleAuthentication"
          v-if="!isAuthenticated"
        />

        <!-- Dashboard após autenticação -->
        <div v-else class="dashboard">
          <div class="welcome-section">
            <h1>Bem-vindo ao Portal Seguro!</h1>
            <p>Autenticação biométrica realizada com sucesso.</p>
            <button @click="logout" class="logout-button">
              Sair
            </button>
          </div>
        </div>

        <!-- Logs de Sessão (sempre visível) -->
        <SessionLogs />
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import BiometricAuth from './components/BiometricAuth.vue'
import SessionLogs from './components/SessionLogs.vue'
import { secureDB } from './utils/indexeddb'

export default {
  name: 'App',
  components: {
    BiometricAuth,
    SessionLogs
  },
  setup() {
    const isAuthenticated = ref(false)

    const handleAuthentication = (authData) => {
      isAuthenticated.value = true
      console.log('Autenticação bem-sucedida:', authData)
    }

    const logout = () => {
      isAuthenticated.value = false
      secureDB.logEvent('LOGOUT', 'user')
    }

    onMounted(async () => {
      await secureDB.init()
    })

    return {
      isAuthenticated,
      handleAuthentication,
      logout
    }
  }
}
</script>

<style scoped>
.dashboard {
  background: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 2rem;
  text-align: center;
}

.welcome-section h1 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.welcome-section p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.logout-button {
  background: var(--error-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.logout-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.header-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--success-color);
  font-weight: 500;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>