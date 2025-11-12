<template>
  <div class="biometric-auth">
    <div class="auth-container" :class="{ loading: isLoading }">
      <div class="auth-header">
        <h2>{{ isRegistered ? 'Autenticação Biométrica' : 'Registro Biométrico' }}</h2>
        <p class="subtitle">
          {{ isRegistered ? 'Use sua biometria para acessar o portal seguro' : 'Registre sua biometria para acesso seguro' }}
        </p>
      </div>

      <div v-if="!isSupported" class="error-message">
        <h3>Navegador Não Suportado</h3>
        <p>Seu navegador não suporta autenticação biométrica. Por favor, use um navegador moderno.</p>
      </div>

      <div v-else class="auth-content">
        <!-- Formulário de Registro -->
        <div v-if="!isRegistered" class="register-form">
          <div class="input-group">
            <label for="username">Usuário:</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Digite seu usuário"
              :disabled="isLoading"
            />
          </div>
          
          <div class="input-group">
            <label for="displayName">Nome de Exibição:</label>
            <input
              id="displayName"
              v-model="displayName"
              type="text"
              placeholder="Seu nome completo"
              :disabled="isLoading"
            />
          </div>

          <button
            @click="handleRegister"
            :disabled="!canRegister || isLoading"
            class="auth-button primary"
          >
            <span v-if="isLoading">Registrando...</span>
            <span v-else>Registrar Biometria</span>
          </button>
        </div>

        <!-- Autenticação -->
        <div v-else class="auth-actions">
          <div class="biometric-prompt">
            <div class="biometric-icon">
              <svg viewBox="0 0 24 24" width="64" height="64">
                <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,8.5A1.5,1.5 0 0,1 13.5,10A1.5,1.5 0 0,1 12,11.5A1.5,1.5 0 0,1 10.5,10A1.5,1.5 0 0,1 12,8.5M7.5,10.5A1.5,1.5 0 0,1 9,12A1.5,1.5 0 0,1 7.5,13.5A1.5,1.5 0 0,1 6,12A1.5,1.5 0 0,1 7.5,10.5M16.5,10.5A1.5,1.5 0 0,1 18,12A1.5,1.5 0 0,1 16.5,13.5A1.5,1.5 0 0,1 15,12A1.5,1.5 0 0,1 16.5,10.5M12,16C13.66,16 15,14.66 15,13C15,11.34 13.66,10 12,10C10.34,10 9,11.34 9,13C9,14.66 10.34,16 12,16Z"/>
              </svg>
            </div>
            <p>Clique abaixo para autenticar com biometria</p>
          </div>

          <button
            @click="handleAuthenticate"
            :disabled="isLoading"
            class="auth-button primary"
          >
            <span v-if="isLoading">Autenticando...</span>
            <span v-else>Autenticar com Biometria</span>
          </button>
        </div>

        <!-- Mensagens de Status -->
        <div v-if="error" class="error-message">
          <strong>Erro:</strong> {{ error }}
        </div>

        <div v-if="successMessage" class="success-message">
          <strong>Sucesso:</strong> {{ successMessage }}
        </div>
      </div>

      <!-- Informações de Segurança -->
      <div class="security-info">
        <h4>🔒 Segurança</h4>
        <ul>
          <li>Autenticação sem senha</li>
          <li>Dados biométricos armazenados localmente</li>
          <li>Criptografia de ponta a ponta</li>
          <li>Proteção contra phishing</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useWebAuthn } from '../composables/useWebAuthn'
import { secureDB } from '../utils/indexeddb'

export default {
  name: 'BiometricAuth',
  emits: ['authenticated'],
  setup(props, { emit }) {
    const { isSupported, isLoading, error, checkSupport, register, authenticate } = useWebAuthn()
    
    const username = ref('')
    const displayName = ref('')
    const isRegistered = ref(false)
    const successMessage = ref('')

    const canRegister = computed(() => 
      username.value.length >= 3 && 
      displayName.value.length >= 2
    )

    onMounted(async () => {
      checkSupport()
      await secureDB.init()
      
      // Verificar se já existem credenciais
      const credentials = await secureDB.getStoredCredentials()
      isRegistered.value = credentials.length > 0
    })

    const handleRegister = async () => {
      const result = await register(username.value, displayName.value)
      
      if (result.success) {
        successMessage.value = 'Biometria registrada com sucesso!'
        isRegistered.value = true
        await secureDB.logEvent('REGISTRATION', username.value, {
          credentialId: result.credential.id
        })
      }
    }

    const handleAuthenticate = async () => {
      const result = await authenticate()
      
      if (result.success) {
        successMessage.value = 'Autenticação bem-sucedida!'
        await secureDB.logEvent('AUTH_SUCCESS', 'user', {
          credentialId: result.credentialId
        })
        
        // Emitir evento de autenticação bem-sucedida
        emit('authenticated', {
          credentialId: result.credentialId,
          timestamp: new Date().toISOString()
        })
      } else {
        await secureDB.logEvent('AUTH_FAILED', 'user', {
          error: result.error
        })
      }
    }

    return {
      isSupported,
      isLoading,
      error,
      username,
      displayName,
      isRegistered,
      successMessage,
      canRegister,
      handleRegister,
      handleAuthenticate
    }
  }
}
</script>