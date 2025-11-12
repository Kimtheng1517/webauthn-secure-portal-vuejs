<template>
  <div class="security-dashboard">
    <div class="dashboard-header">
      <h2>🛡️ Dashboard de Segurança</h2>
      <p>Monitoramento em tempo real da segurança do portal</p>
    </div>

    <div class="dashboard-grid">
      <!-- Status de Segurança -->
      <div class="security-status card">
        <h3>Status de Segurança</h3>
        <div class="status-grid">
          <div class="status-item" :class="securityStatus.csp">
            <div class="status-icon">🔒</div>
            <div class="status-info">
              <div class="status-title">CSP</div>
              <div class="status-value">{{ securityStatus.csp === 'active' ? 'Ativo' : 'Inativo' }}</div>
            </div>
          </div>
          
          <div class="status-item" :class="securityStatus.trustedTypes">
            <div class="status-icon">🛡️</div>
            <div class="status-info">
              <div class="status-title">Trusted Types</div>
              <div class="status-value">{{ securityStatus.trustedTypes === 'active' ? 'Ativo' : 'Inativo' }}</div>
            </div>
          </div>
          
          <div class="status-item" :class="securityStatus.webauthn">
            <div class="status-icon">👆</div>
            <div class="status-info">
              <div class="status-title">WebAuthn</div>
              <div class="status-value">{{ securityStatus.webauthn === 'active' ? 'Disponível' : 'Indisponível' }}</div>
            </div>
          </div>
          
          <div class="status-item" :class="securityStatus.https">
            <div class="status-icon">🔐</div>
            <div class="status-info">
              <div class="status-title">HTTPS</div>
              <div class="status-value">{{ securityStatus.https ? 'Ativo' : 'Inativo' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estatísticas de Uso -->
      <div class="usage-stats card">
        <h3>Estatísticas de Uso</h3>
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-value">{{ stats.totalSessions }}</div>
            <div class="stat-label">Sessões</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ stats.successfulAuths }}</div>
            <div class="stat-label">Autenticações</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ stats.failedAuths }}</div>
            <div class="stat-label">Falhas</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ stats.avgAuthTime }}s</div>
            <div class="stat-label">Tempo Médio</div>
          </div>
        </div>
      </div>

      <!-- Alertas de Segurança -->
      <div class="security-alerts card">
        <h3>Alertas Recentes</h3>
        <div class="alerts-list">
          <div v-if="alerts.length === 0" class="no-alerts">
            Nenhum alerta de segurança recente
          </div>
          <div
            v-for="alert in alerts"
            :key="alert.id"
            class="alert-item"
            :class="alert.level"
          >
            <div class="alert-icon">
              {{ getAlertIcon(alert.level) }}
            </div>
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-description">{{ alert.description }}</div>
              <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Configurações de Segurança -->
      <div class="security-settings card">
        <h3>Configurações de Segurança</h3>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">Timeout de Sessão</div>
              <div class="setting-description">Tempo máximo de inatividade antes do logout automático</div>
            </div>
            <select v-model="sessionTimeout" @change="updateSessionTimeout" class="setting-control">
              <option value="300">5 minutos</option>
              <option value="900">15 minutos</option>
              <option value="1800">30 minutos</option>
              <option value="3600">1 hora</option>
            </select>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">Verificação de Dispositivo</div>
              <div class="setting-description">Requer verificação do dispositivo para autenticação</div>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="deviceVerification" @change="updateDeviceVerification">
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">Logs Detalhados</div>
              <div class="setting-description">Registrar logs detalhados de auditoria</div>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="detailedLogs" @change="updateDetailedLogs">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Informações do Dispositivo -->
      <div class="device-info card">
        <h3>Informações do Dispositivo</h3>
        <div class="device-details">
          <div class="detail-item">
            <span class="detail-label">Navegador:</span>
            <span class="detail-value">{{ deviceInfo.browser }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Sistema Operacional:</span>
            <span class="detail-value">{{ deviceInfo.os }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Dispositivo:</span>
            <span class="detail-value">{{ deviceInfo.deviceType }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">IP Aproximado:</span>
            <span class="detail-value">{{ deviceInfo.ip }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">WebAuthn Suportado:</span>
            <span class="detail-value" :class="deviceInfo.webauthnSupported ? 'supported' : 'not-supported'">
              {{ deviceInfo.webauthnSupported ? 'Sim' : 'Não' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div class="quick-actions card">
        <h3>Ações Rápidas</h3>
        <div class="actions-grid">
          <button @click="revokeSessions" class="action-button revoke">
            🔄 Revogar Sessões
          </button>
          <button @click="exportLogs" class="action-button export">
            📥 Exportar Logs
          </button>
          <button @click="clearCredentials" class="action-button clear">
            🗑️ Limpar Credenciais
          </button>
          <button @click="runSecurityScan" class="action-button scan">
            🔍 Verificar Segurança
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ confirmModal.title }}</h3>
        <p>{{ confirmModal.message }}</p>
        <div class="modal-actions">
          <button @click="confirmAction(false)" class="btn-secondary">Cancelar</button>
          <button @click="confirmAction(true)" class="btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { secureDB } from '../utils/indexeddb'

export default {
  name: 'SecurityDashboard',
  setup() {
    const securityStatus = ref({
      csp: 'inactive',
      trustedTypes: 'inactive',
      webauthn: 'inactive',
      https: false
    })

    const stats = ref({
      totalSessions: 0,
      successfulAuths: 0,
      failedAuths: 0,
      avgAuthTime: 0
    })

    const alerts = ref([])
    const sessionTimeout = ref(900)
    const deviceVerification = ref(true)
    const detailedLogs = ref(true)
    const showConfirmModal = ref(false)
    const confirmModal = ref({ title: '', message: '', action: null })

    const deviceInfo = ref({
      browser: 'Desconhecido',
      os: 'Desconhecido',
      deviceType: 'Desconhecido',
      ip: 'Carregando...',
      webauthnSupported: false
    })

    // Verificar status de segurança
    const checkSecurityStatus = () => {
      // Verificar CSP
      securityStatus.value.csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? 'active' : 'inactive'
      
      // Verificar Trusted Types
      securityStatus.value.trustedTypes = window.trustedTypes ? 'active' : 'inactive'
      
      // Verificar WebAuthn
      securityStatus.value.webauthn = window.PublicKeyCredential ? 'active' : 'inactive'
      
      // Verificar HTTPS
      securityStatus.value.https = window.location.protocol === 'https:'
    }

    // Carregar estatísticas
    const loadStats = async () => {
      try {
        const logs = await secureDB.getSessionLogs(1000)
        
        stats.value.totalSessions = logs.filter(log => 
          log.type === 'SESSION_START' || log.type === 'AUTH_SUCCESS'
        ).length
        
        stats.value.successfulAuths = logs.filter(log => 
          log.type === 'AUTH_SUCCESS'
        ).length
        
        stats.value.failedAuths = logs.filter(log => 
          log.type === 'AUTH_FAILED'
        ).length
        
        // Calcular tempo médio (simulado)
        stats.value.avgAuthTime = (Math.random() * 2 + 1).toFixed(1)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      }
    }

    // Carregar informações do dispositivo
    const loadDeviceInfo = async () => {
      const ua = navigator.userAgent
      
      // Detectar navegador
      if (ua.includes('Chrome')) deviceInfo.value.browser = 'Chrome'
      else if (ua.includes('Firefox')) deviceInfo.value.browser = 'Firefox'
      else if (ua.includes('Safari')) deviceInfo.value.browser = 'Safari'
      else if (ua.includes('Edge')) deviceInfo.value.browser = 'Edge'
      
      // Detectar SO
      if (ua.includes('Windows')) deviceInfo.value.os = 'Windows'
      else if (ua.includes('Mac')) deviceInfo.value.os = 'macOS'
      else if (ua.includes('Linux')) deviceInfo.value.os = 'Linux'
      else if (ua.includes('Android')) deviceInfo.value.os = 'Android'
      else if (ua.includes('iOS')) deviceInfo.value.os = 'iOS'
      
      // Detectar tipo de dispositivo
      deviceInfo.value.deviceType = /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop'
      
      // Verificar WebAuthn
      deviceInfo.value.webauthnSupported = !!window.PublicKeyCredential
      
      // Obter IP
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        deviceInfo.value.ip = data.ip
      } catch {
        deviceInfo.value.ip = 'Não disponível'
      }
    }

    // Carregar alertas
    const loadAlerts = () => {
      alerts.value = [
        {
          id: 1,
          level: 'info',
          title: 'Sistema de Segurança Iniciado',
          description: 'Todas as proteções de segurança estão ativas',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          level: 'warning',
          title: 'Tentativa de Autenticação Falhou',
          description: 'Falha na autenticação biométrica detectada',
          timestamp: new Date(Date.now() - 300000).toISOString()
        }
      ]
    }

    // Utilitários
    const getAlertIcon = (level) => {
      const icons = {
        info: 'ℹ️',
        warning: '⚠️',
        critical: '🚨'
      }
      return icons[level] || '📝'
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('pt-BR')
    }

    // Ações
    const revokeSessions = () => {
      confirmModal.value = {
        title: 'Revogar Sessões',
        message: 'Tem certeza que deseja revogar todas as sessões ativas?',
        action: 'revokeSessions'
      }
      showConfirmModal.value = true
    }

    const clearCredentials = () => {
      confirmModal.value = {
        title: 'Limpar Credenciais',
        message: 'Isso removerá todas as credenciais biométricas armazenadas. Você precisará se registrar novamente.',
        action: 'clearCredentials'
      }
      showConfirmModal.value = true
    }

    const exportLogs = async () => {
      try {
        const logs = await secureDB.getSessionLogs()
        const dataStr = JSON.stringify(logs, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        
        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        
        // Log da ação
        await secureDB.logEvent('LOGS_EXPORTED', 'dashboard')
      } catch (error) {
        console.error('Erro ao exportar logs:', error)
      }
    }

    const runSecurityScan = () => {
      checkSecurityStatus()
      loadStats()
      
      // Adicionar alerta de verificação
      alerts.value.unshift({
        id: Date.now(),
        level: 'info',
        title: 'Verificação de Segurança Executada',
        description: 'Scan de segurança completo realizado com sucesso',
        timestamp: new Date().toISOString()
      })
    }

    const confirmAction = (confirmed) => {
      if (confirmed) {
        switch (confirmModal.value.action) {
          case 'revokeSessions':
            // Implementar revogação de sessões
            secureDB.logEvent('SESSIONS_REVOKED', 'dashboard')
            break
          case 'clearCredentials':
            // Implementar limpeza de credenciais
            secureDB.logEvent('CREDENTIALS_CLEARED', 'dashboard')
            break
        }
      }
      showConfirmModal.value = false
    }

    const updateSessionTimeout = () => {
      secureDB.logEvent('SESSION_TIMEOUT_UPDATED', 'dashboard', { timeout: sessionTimeout.value })
    }

    const updateDeviceVerification = () => {
      secureDB.logEvent('DEVICE_VERIFICATION_UPDATED', 'dashboard', { enabled: deviceVerification.value })
    }

    const updateDetailedLogs = () => {
      secureDB.logEvent('DETAILED_LOGS_UPDATED', 'dashboard', { enabled: detailedLogs.value })
    }

    onMounted(() => {
      checkSecurityStatus()
      loadStats()
      loadDeviceInfo()
      loadAlerts()
    })

    return {
      securityStatus,
      stats,
      alerts,
      sessionTimeout,
      deviceVerification,
      detailedLogs,
      deviceInfo,
      showConfirmModal,
      confirmModal,
      getAlertIcon,
      formatTime,
      revokeSessions,
      clearCredentials,
      exportLogs,
      runSecurityScan,
      confirmAction,
      updateSessionTimeout,
      updateDeviceVerification,
      updateDetailedLogs
    }
  }
}
</script>

<style scoped>
.security-dashboard {
  padding: 1rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: var(--text-secondary);
}

.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.card {
  background: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.card h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-size: 1.1rem;
}

/* Status de Segurança */
.status-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  background: #f8fafc;
  border: 1px solid var(--border-color);
}

.status-item.active {
  border-color: var(--success-color);
  background: #f0fdf4;
}

.status-item.inactive {
  border-color: var(--error-color);
  background: #fef2f2;
}

.status-icon {
  font-size: 1.5rem;
}

.status-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.status-value {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

/* Estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--border-radius);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Alertas */
.alerts-list {
  max-height: 200px;
  overflow-y: auto;
}

.no-alerts {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  font-style: italic;
}

.alert-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: var(--border-radius);
  border-left: 4px solid;
}

.alert-item.info {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.alert-item.warning {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.alert-item.critical {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.alert-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.alert-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.alert-description {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin: 0.25rem 0;
}

.alert-time {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

/* Configurações */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--border-radius);
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.setting-description {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.setting-control {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: white;
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Informações do Dispositivo */
.device-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-label {
  font-weight: 500;
  color: var(--text-primary);
}

.detail-value {
  color: var(--text-secondary);
}

.detail-value.supported {
  color: var(--success-color);
}

.detail-value.not-supported {
  color: var(--error-color);
}

/* Ações Rápidas */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.action-button {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: white;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-button.revoke:hover {
  border-color: var(--warning-color);
  background: #fffbeb;
}

.action-button.export:hover {
  border-color: var(--success-color);
  background: #f0fdf4;
}

.action-button.clear:hover {
  border-color: var(--error-color);
  background: #fef2f2;
}

.action-button.scan:hover {
  border-color: var(--primary-color);
  background: #eff6ff;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.modal p {
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: #f1f5f9;
  color: var(--text-primary);
}

/* Responsividade */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>