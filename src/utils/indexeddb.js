const DB_NAME = 'SecurePortalDB'
const DB_VERSION = 1
const STORE_CREDENTIALS = 'webauthn_credentials'
const STORE_TOKENS = 'jwt_tokens'
const STORE_LOGS = 'session_logs'

export class SecureDB {
  constructor() {
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Store para credenciais WebAuthn
        if (!db.objectStoreNames.contains(STORE_CREDENTIALS)) {
          const store = db.createObjectStore(STORE_CREDENTIALS, { keyPath: 'id' })
          store.createIndex('username', 'username', { unique: false })
        }

        // Store para tokens JWT
        if (!db.objectStoreNames.contains(STORE_TOKENS)) {
          const store = db.createObjectStore(STORE_TOKENS, { keyPath: 'id', autoIncrement: true })
          store.createIndex('token', 'token', { unique: true })
          store.createIndex('expires', 'expires', { unique: false })
        }

        // Store para logs de sessão
        if (!db.objectStoreNames.contains(STORE_LOGS)) {
          const store = db.createObjectStore(STORE_LOGS, { keyPath: 'timestamp' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('user', 'user', { unique: false })
        }
      }
    })
  }

  // Operações para credenciais
  async storeCredential(credential, username) {
    const transaction = this.db.transaction([STORE_CREDENTIALS], 'readwrite')
    const store = transaction.objectStore(STORE_CREDENTIALS)
    
    return store.add({
      ...credential,
      username,
      createdAt: new Date().toISOString()
    })
  }

  async getStoredCredentials() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_CREDENTIALS], 'readonly')
      const store = transaction.objectStore(STORE_CREDENTIALS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Operações para tokens JWT
  async storeToken(token, expiresIn = 3600) {
    const transaction = this.db.transaction([STORE_TOKENS], 'readwrite')
    const store = transaction.objectStore(STORE_TOKENS)
    
    const expires = new Date(Date.now() + expiresIn * 1000)
    
    return store.add({
      token,
      expires: expires.toISOString(),
      createdAt: new Date().toISOString()
    })
  }

  async getValidToken() {
    const tokens = await new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_TOKENS], 'readonly')
      const store = transaction.objectStore(STORE_TOKENS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const now = new Date()
    const validToken = tokens.find(token => new Date(token.expires) > now)
    
    return validToken ? validToken.token : null
  }

  // Operações para logs
  async logEvent(type, user, details = {}) {
    const transaction = this.db.transaction([STORE_LOGS], 'readwrite')
    const store = transaction.objectStore(STORE_LOGS)
    
    return store.add({
      type,
      user,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: await this.getClientIP()
    })
  }

  async getSessionLogs(limit = 50) {
    const logs = await new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_LOGS], 'readonly')
      const store = transaction.objectStore(STORE_LOGS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    return logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
  }

  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }
}

export const secureDB = new SecureDB()