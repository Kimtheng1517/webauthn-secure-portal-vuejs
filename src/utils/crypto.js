// Utilitários criptográficos para WebAuthn

// Gerar challenge aleatório
export function generateChallenge(length = 32) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return array
}

// Converter ArrayBuffer para Base64
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  return btoa(binary)
}

// Converter Base64 para ArrayBuffer
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Gerar nonce para CSP
export function generateNonce(length = 32) {
  return arrayBufferToBase64(generateChallenge(length))
}

// Hash de dados (SHA-256)
export async function sha256(data) {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  return arrayBufferToBase64(hashBuffer)
}

// Gerar ID único
export function generateId() {
  return arrayBufferToBase64(generateChallenge(16))
}

// Validar formato de credential ID
export function isValidCredentialId(id) {
  try {
    const decoded = atob(id)
    return decoded.length >= 16 && decoded.length <= 512
  } catch {
    return false
  }
}

// Codificar dados para WebAuthn
export function encodeWebAuthnData(data) {
  if (typeof data === 'string') {
    const encoder = new TextEncoder()
    return encoder.encode(data)
  }
  return data
}

// Decodificar dados do WebAuthn
export function decodeWebAuthnData(buffer) {
  if (buffer instanceof ArrayBuffer) {
    const decoder = new TextDecoder()
    return decoder.decode(buffer)
  }
  return buffer
}

// Verificar suporte a algoritmos
export async function checkAlgorithmSupport() {
  const algorithms = [
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    { name: 'ECDSA', namedCurve: 'P-256' },
    { name: 'ECDSA', namedCurve: 'P-384' }
  ]

  const supportedAlgorithms = []

  for (const algorithm of algorithms) {
    try {
      const key = await crypto.subtle.generateKey(
        algorithm,
        false,
        ['sign', 'verify']
      )
      supportedAlgorithms.push(algorithm)
    } catch {
      // Algoritmo não suportado
    }
  }

  return supportedAlgorithms
}

// Gerar par de chaves para assinatura
export async function generateKeyPair() {
  const algorithm = {
    name: 'ECDSA',
    namedCurve: 'P-256'
  }

  const keyPair = await crypto.subtle.generateKey(
    algorithm,
    true,
    ['sign', 'verify']
  )

  return keyPair
}

// Assinar dados
export async function signData(privateKey, data) {
  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' }
    },
    privateKey,
    data
  )

  return arrayBufferToBase64(signature)
}

// Verificar assinatura
export async function verifySignature(publicKey, signature, data) {
  const signatureBuffer = base64ToArrayBuffer(signature)
  const dataBuffer = encodeWebAuthnData(data)

  const isValid = await crypto.subtle.verify(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' }
    },
    publicKey,
    signatureBuffer,
    dataBuffer
  )

  return isValid
}

// Criptografar dados sensíveis
export async function encryptData(data, key) {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const algorithm = {
    name: 'AES-GCM',
    iv: iv
  }

  const encryptedBuffer = await crypto.subtle.encrypt(
    algorithm,
    key,
    dataBuffer
  )

  return {
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encryptedBuffer)
  }
}

// Descriptografar dados
export async function decryptData(encryptedData, key) {
  const iv = base64ToArrayBuffer(encryptedData.iv)
  const dataBuffer = base64ToArrayBuffer(encryptedData.data)

  const algorithm = {
    name: 'AES-GCM',
    iv: iv
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    algorithm,
    key,
    dataBuffer
  )

  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

// Derivação de chave a partir de senha
export async function deriveKeyFromPassword(password, salt) {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)
  const saltBuffer = encoder.encode(salt)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  )

  return key
}

// Utilitário para timing attack protection
export function constantTimeEqual(a, b) {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

// Sanitização de dados de entrada
export function sanitizeInput(input, maxLength = 255) {
  if (typeof input !== 'string') {
    return ''
  }

  // Limitar comprimento
  let sanitized = input.slice(0, maxLength)
  
  // Remover caracteres potencialmente perigosos
  sanitized = sanitized.replace(/[<>"'`]/g, '')
  
  // Normalizar espaços
  sanitized = sanitized.trim().replace(/\s+/g, ' ')
  
  return sanitized
}

// Validação de URL para CSP
export function isValidURL(url) {
  try {
    const parsed = new URL(url)
    return ['https:', 'http:', 'blob:', 'data:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Gerar fingerprint do navegador
export async function generateBrowserFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset()
  ].join('|')

  return await sha256(components)
}

// Cache seguro em memória
export class SecureCache {
  constructor(maxAge = 300000) { // 5 minutos padrão
    this.cache = new Map()
    this.maxAge = maxAge
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
    
    // Limpar entradas expiradas
    this.cleanup()
  }

  get(key) {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }

  delete(key) {
    this.cache.delete(key)
  }

  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key)
      }
    }
  }
}

export default {
  generateChallenge,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateNonce,
  sha256,
  generateId,
  isValidCredentialId,
  encodeWebAuthnData,
  decodeWebAuthnData,
  checkAlgorithmSupport,
  generateKeyPair,
  signData,
  verifySignature,
  encryptData,
  decryptData,
  deriveKeyFromPassword,
  constantTimeEqual,
  sanitizeInput,
  isValidURL,
  generateBrowserFingerprint
}