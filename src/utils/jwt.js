import { secureDB } from './indexeddb'

// Chave secreta para JWT (em produção, use uma chave segura do ambiente)
const JWT_SECRET = 'portal-seguro-webauthn-jwt-secret-key-2024'
const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRES_IN = 3600 // 1 hora

// Codificar Base64 URL safe
function base64UrlEncode(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Decodificar Base64 URL safe
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return atob(str)
}

// Gerar signature JWT
async function generateSignature(header, payload, secret) {
  const data = `${header}.${payload}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(data)

  // Usando Web Crypto API para HMAC
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    messageData
  )

  // Converter ArrayBuffer para Base64 URL
  const signatureBytes = new Uint8Array(signature)
  let base64 = ''
  for (let i = 0; i < signatureBytes.length; i++) {
    base64 += String.fromCharCode(signatureBytes[i])
  }
  return btoa(base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Verificar signature JWT
async function verifySignature(header, payload, signature, secret) {
  const expectedSignature = await generateSignature(header, payload, secret)
  return constantTimeEqual(signature, expectedSignature)
}

// Comparação de tempo constante
function constantTimeEqual(a, b) {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

// Gerar JWT
export async function generateJWT(payload, expiresIn = JWT_EXPIRES_IN) {
  const header = {
    alg: JWT_ALGORITHM,
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + expiresIn

  const payloadWithExp = {
    ...payload,
    iat: now,
    exp: expiresAt,
    iss: 'portal-seguro',
    aud: 'webauthn-client'
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payloadWithExp))

  const signature = await generateSignature(encodedHeader, encodedPayload, JWT_SECRET)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Validar JWT
export async function validateJWT(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false
    }

    const [encodedHeader, encodedPayload, signature] = parts

    // Verificar signature
    const isValidSignature = await verifySignature(encodedHeader, encodedPayload, signature, JWT_SECRET)
    if (!isValidSignature) {
      return false
    }

    // Decodificar payload
    const payloadStr = base64UrlDecode(encodedPayload)
    const payload = JSON.parse(payloadStr)

    // Verificar expiração
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return false
    }

    // Verificar issuer
    if (payload.iss !== 'portal-seguro') {
      return false
    }

    // Verificar audience
    if (payload.aud !== 'webauthn-client') {
      return false
    }

    return payload
  } catch (error) {
    console.error('Erro ao validar JWT:', error)
    return false
  }
}

// Decodificar JWT sem validar (apenas para exibição)
export function decodeJWT(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const encodedPayload = parts[1]
    const payloadStr = base64UrlDecode(encodedPayload)
    return JSON.parse(payloadStr)
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error)
    return null
  }
}

// Refresh JWT
export async function refreshJWT(oldToken, expiresIn = JWT_EXPIRES_IN) {
  const payload = await validateJWT(oldToken)
  
  if (!payload) {
    throw new Error('Token inválido para refresh')
  }

  // Remover campos de tempo do payload original
  const { iat, exp, ...cleanPayload } = payload

  return generateJWT(cleanPayload, expiresIn)
}

// Revogar JWT
export async function revokeJWT(token) {
  try {
    const payload = decodeJWT(token)
    if (!payload) {
      return false
    }

    // Armazenar token revogado no IndexedDB
    await secureDB.logEvent('JWT_REVOKED', payload.userId || 'unknown', {
      tokenId: payload.jti || 'unknown',
      expiresAt: new Date(payload.exp * 1000).toISOString()
    })

    return true
  } catch (error) {
    console.error('Erro ao revogar JWT:', error)
    return false
  }
}

// Verificar se JWT está prestes a expirar
export function isTokenExpiringSoon(token, threshold = 300) { // 5 minutos
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return true
  }

  const now = Math.floor(Date.now() / 1000)
  return payload.exp - now <= threshold
}

// Gerenciador de tokens
export class TokenManager {
  constructor() {
    this.currentToken = null
    this.refreshPromise = null
  }

  // Definir token atual
  setToken(token) {
    this.currentToken = token
  }

  // Obter token atual
  getToken() {
    return this.currentToken
  }

  // Validar token atual
  async validateCurrentToken() {
    if (!this.currentToken) {
      return false
    }

    return await validateJWT(this.currentToken)
  }

  // Refresh automático do token
  async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        if (!this.currentToken) {
          throw new Error('Nenhum token para refresh')
        }

        const newToken = await refreshJWT(this.currentToken)
        this.currentToken = newToken

        // Armazenar novo token
        await secureDB.storeToken(newToken, JWT_EXPIRES_IN)

        return newToken
      } catch (error) {
        console.error('Erro ao fazer refresh do token:', error)
        throw error
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  // Verificar necessidade de refresh
  async shouldRefreshToken() {
    if (!this.currentToken) {
      return false
    }

    return isTokenExpiringSoon(this.currentToken)
  }

  // Limpar token
  clearToken() {
    this.currentToken = null
    this.refreshPromise = null
  }
}

// Instância global do gerenciador de tokens
export const tokenManager = new TokenManager()

// Middleware para automaticamente refrescar tokens
export function withAutoRefresh(apiCall) {
  return async (...args) => {
    if (await tokenManager.shouldRefreshToken()) {
      await tokenManager.refreshToken()
    }

    return apiCall(...args)
  }
}

// Hook Vue para gerenciamento de tokens
export function useToken() {
  const isValid = async () => {
    const token = await secureDB.getValidToken()
    if (!token) return false

    return await validateJWT(token)
  }

  const getTokenData = async () => {
    const token = await secureDB.getValidToken()
    if (!token) return null

    return decodeJWT(token)
  }

  const refreshIfNeeded = async () => {
    const token = await secureDB.getValidToken()
    if (!token) return null

    tokenManager.setToken(token)

    if (await tokenManager.shouldRefreshToken()) {
      try {
        const newToken = await tokenManager.refreshToken()
        return newToken
      } catch (error) {
        console.error('Falha ao refrescar token:', error)
        return null
      }
    }

    return token
  }

  return {
    isValid,
    getTokenData,
    refreshIfNeeded
  }
}

export default {
  generateJWT,
  validateJWT,
  decodeJWT,
  refreshJWT,
  revokeJWT,
  isTokenExpiringSoon,
  tokenManager,
  withAutoRefresh,
  useToken
}