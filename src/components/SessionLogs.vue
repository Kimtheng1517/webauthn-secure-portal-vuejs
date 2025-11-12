<template>
  <div class="session-logs">
    <div class="logs-header">
      <h3>📊 Logs de Sessão e Auditoria</h3>
      <button @click="refreshLogs" :disabled="isLoading" class="refresh-button">
        {{ isLoading ? 'Atualizando...' : '🔄 Atualizar' }}
      </button>
    </div>

    <div class="logs-stats">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Total de Eventos</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.authSuccess }}</div>
        <div class="stat-label">Autenticações</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.authFailed }}</div>
        <div class="stat-label">Falhas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.registrations }}</div>
        <div class="stat-label">Registros</div>
      </div>
    </div>

    <div class="logs-container">
      <div v-if="isLoading" class="loading">Carregando logs...</div>
      
      <div v-else-if="logs.length === 0" class="empty-state">
        Nenhum log de sessão encontrado.
      </div>

      <div v-else class="logs-list">
        <div
          v-for="log in logs"
          :key="log.timestamp"
          class="log-item"
          :class="getLogTypeClass(log.type)"
        >
          <div class="log-icon">
            {{ getLogIcon(log.type) }}
          </div>
          <div class="log-content">
            <div class="log-header">
              <span class="log-type">{{ getLogTypeText(log.type) }}</span>
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            </div>
            <div class="log-user">Usuário: {{ log.user || 'N/A' }}</div>
            <div class="log-details" v-if="log.details">
              {{ parseDetails(log.details) }}
            </div>
            <div class="log-meta">
              <span class="log-ip">IP: {{ log.ip || 'unknown' }}</span>
              <span class="log-date">{{ formatDate(log.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="logs-actions">
      <button @click="exportLogs" class="export-button">
        📥 Exportar Logs
      </button>
      <button @click="clearLogs" class="clear-button" v-if="logs.length > 0">
        🗑️ Limpar Logs
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { secureDB } from '../utils/indexeddb'

export default {
  name: 'SessionLogs',
  setup() {
    const logs = ref([])
    const isLoading = ref(false)

    const stats = computed(() => {
      const total = logs.value.length
      const authSuccess = logs.value.filter(log => log.type === 'AUTH_SUCCESS').length
      const authFailed = logs.value.filter(log => log.type === 'AUTH_FAILED').length
      const registrations = logs.value.filter(log => log.type === 'REGISTRATION').length

      return { total, authSuccess, authFailed, registrations }
    })

    const loadLogs = async () => {
      isLoading.value = true
      try {
        logs.value = await secureDB.getSessionLogs(100)
      } catch (error) {
        console.error('Erro ao carregar logs:', error)
      } finally {
        isLoading.value = false
      }
    }

    const refreshLogs = () => {
      loadLogs()
    }

    const getLogTypeClass = (type) => {
      const typeMap = {
        'REGISTRATION': 'type-registration',
        'AUTH_SUCCESS': 'type-success',
        'AUTH_FAILED': 'type-failed',
        'SESSION_START': 'type-info',
        'SESSION_END': 'type-warning'
      }
      return typeMap[type] || 'type-default'
    }

    const getLogIcon = (type) => {
      const iconMap = {
        'REGISTRATION': '👤',
        'AUTH_SUCCESS': '✅',
        'AUTH_FAILED': '❌',
        'SESSION_START': '🚀',
        'SESSION_END': '🔚'
      }
      return iconMap[type] || '📝'
    }

    const getLogTypeText = (type) => {
      const textMap = {
        'REGISTRATION': 'Registro de Usuário',
        'AUTH_SUCCESS': 'Autenticação Bem-sucedida',
        'AUTH_FAILED': 'Falha na Autenticação',
        'SESSION_START': 'Sessão Iniciada',
        'SESSION_END': 'Sessão Finalizada'
      }
      return textMap[type] || type
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('pt-BR')
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('pt-BR')
    }

    const parseDetails = (details) => {
      try {
        const parsed = JSON.parse(details)
        return Object.entries(parsed)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      } catch {
        return details
      }
    }

    const exportLogs = () => {
      const dataStr = JSON.stringify(logs.value, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `session-logs-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    }

    const clearLogs = async () => {
      if (confirm('Tem certeza que deseja limpar todos os logs?')) {
        // Implementar limpeza de logs
        await loadLogs() // Recarregar lista vazia
      }
    }

    onMounted(() => {
      loadLogs()
    })

    return {
      logs,
      isLoading,
      stats,
      refreshLogs,
      getLogTypeClass,
      getLogIcon,
      getLogTypeText,
      formatTime,
      formatDate,
      parseDetails,
      exportLogs,
      clearLogs
    }
  }
}
</script>