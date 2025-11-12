## 🙋‍♂️ Autor

<div align="center">
  <img src="https://avatars.githubusercontent.com/ninomiquelino" width="100" height="100" style="border-radius: 50%">
  <br>
  <strong>Onivaldo Miquelino</strong>
  <br>
  <a href="https://github.com/ninomiquelino">@ninomiquelino</a>
</div>

---

# 🔒 Portal Seguro com WebAuthn + CSP + Trusted Types

![Vue.js](https://img.shields.io/badge/Vue.js-3.3-4FC08D?logo=vuedotjs)
![WebAuthn](https://img.shields.io/badge/WebAuthn-Compliant-green)
![CSP](https://img.shields.io/badge/CSP-Level_3-orange)
![Security](https://img.shields.io/badge/Security-Hardened-red)
![License](https://img.shields.io/badge/License-MIT-blue)

Sistema moderno de autenticação biométrica implementando as mais avançadas práticas de segurança web, incluindo WebAuthn, Content Security Policy (CSP), Trusted Types e auditoria completa.

## ✨ Características Principais

### 🔐 Autenticação Avançada
- **WebAuthn API**: Autenticação sem senha usando biometria
- **Multi-dispositivo**: Suporte a diferentes autenticadores
- **Registro seguro**: Fluxo de registro biométrico intuitivo
- **Persistência local**: Credenciais armazenadas com segurança no IndexedDB

### 🛡️ Segurança Robustecida
- **CSP Dinâmica**: Políticas de segurança de conteúdo com nonce
- **Trusted Types**: Prevenção de DOM-based XSS
- **JWT Seguro**: Tokens com expiração e refresh automático
- **IndexedDB Criptografado**: Armazenamento local seguro

### 📊 Monitoramento Completo
- **Dashboard de Segurança**: Status em tempo real do sistema
- **Logs de Auditoria**: Registro detalhado de todas as atividades
- **Estatísticas de Uso**: Métricas de autenticação e sessões
- **Alertas de Segurança**: Notificações de eventos importantes

### 📱 Experiência Moderna
- **Design Responsivo**: Otimizado para mobile e desktop
- **PWA Ready**: Funcionalidades de Progressive Web App
- **Dark Mode**: Suporte a temas claro e escuro
- **Acessibilidade**: Navegação por teclado e leitores de tela

## 🚀 Começando Rápido

### Pré-requisitos
- Node.js 16+
- Navegador moderno com suporte a WebAuthn
- HTTPS para produção (requerido pelo WebAuthn)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/NinoMiquelino/webauthn-secure-portal-vuejs.git

# Entrar no diretório
cd webauthn-secure-portal

# Instalar dependências
npm install

# Desenvolvimento
npm run serve

# Build de produção
npm run build:secure

# Build moderno (para navegadores recentes)
npm run build:modern
```

Desenvolvimento com HTTPS

```bash
# Gerar certificado SSL local (requer mkcert)
mkcert -install
mkcert localhost

# Desenvolvimento com HTTPS
npm run serve:https
```

🏗️ Arquitetura

```

 webauthn-secure-portal-vuejs/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── BiometricAuth.vue
│   │   ├── SessionLogs.vue
│   │   └── SecurityDashboard.vue
│   ├── composables/
│   │   ├── useWebAuthn.js
│   │   ├── useCSP.js
│   │   └── useSession.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── crypto.js
│   │   ├── jwt.js
│   │   └── indexeddb.js
│   ├── styles/
│   │   └── responsive.css
│   ├── App.vue
│   └── main.js
├── vue.config.js
└── package.json   
    
```

🔧 Configuração

Variáveis de Ambiente

Crie um arquivo .env:

```env
VUE_APP_NAME="Portal Seguro"
VUE_APP_VERSION=1.0.0
VUE_APP_JWT_SECRET=sua-chave-secreta-aqui
VUE_APP_SESSION_TIMEOUT=900
```

Política de Segurança (CSP)

O projeto implementa CSP dinâmica com nonce:

```javascript
// Exemplo de política CSP gerada
default-src 'self';
script-src 'self' 'nonce-abc123' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
connect-src 'self' https://api.yourapi.com;
require-trusted-types-for 'script';
```

🎯 Como Usar

1. Registro Biométrico

1. Acesse o portal
2. Clique em "Registrar Biometria"
3. Insira usuário e nome
4. Siga as instruções do navegador para registrar sua biometria

2. Autenticação

1. Clique em "Autenticar com Biometria"
2. Use o mesmo método biométrico registrado
3. Acesso concedido automaticamente

3. Dashboard de Segurança

· Monitore o status de segurança em tempo real<br>
· Veja estatísticas de uso e logs<br>
· Configure preferências de segurança

🔒 Recursos de Segurança

WebAuthn Implementation

· Public Key Credentials: Credenciais baseadas em criptografia de chave pública<br>
· User Verification: Verificação do usuário obrigatória<br>
· Platform Authenticators: Suporte a autenticadores de plataforma<br>
· Cross-Origin Protection: Proteção contra ataques entre origens

Content Security Policy

· Dynamic Nonce: Nonce único para cada carregamento<br>
· Strict Policies: Políticas restritivas por padrão<br>
· Trusted Types: Prevenção de injection attacks<br>
· Report Only Mode: Modo de relatório para desenvolvimento

Proteção de Dados

· Encrypted Storage: Dados sensíveis criptografados<br>
· Secure Tokens: JWT com expiration e validation<br>
· Session Management: Timeout automático de sessão<br>
· Activity Monitoring: Detecção de comportamento suspeito

📱 Responsividade

O projeto é totalmente responsivo com breakpoints:

· Mobile: < 768px
· Tablet: 768px - 1024px
· Desktop: > 1024px

🌙 Dark Mode

Suporte automático a dark mode baseado nas preferências do sistema:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #0f172a;
    --surface-color: #1e293b;
  }
}
```

🧪 Testes

```bash
# Executar testes unitários
npm run test:unit

# Executar testes e2e
npm run test:e2e

# Executar todos os testes
npm run test
```

📦 Build e Deploy

Build para Produção

```bash
# Build tradicional
npm run build

# Build moderno (navegadores recentes)
npm run build:modern

# Análise de bundle
npm run build:analyze
```

Deploy

O projeto pode ser deployado em qualquer serviço de hosting estático:

· Netlify: Conecte diretamente do GitHub<br>
· Vercel: Deploy automático com vercel --prod<br>
· GitHub Pages: Use gh-pages package<br>
· AWS S3: Upload da pasta dist/

🐛 Solução de Problemas

WebAuthn Não Funciona

1. Verifique HTTPS: WebAuthn requer HTTPS em produção
2. Domínio Válido: Credenciais são vinculadas ao domínio
3. Navegador Suportado: Chrome, Firefox, Edge, Safari recentes
4. Autenticador Disponível: Biometria ou chave de segurança configurada

CSP Bloqueando Recursos

1. Verifique Console: Erros de CSP são mostrados no console
2. Ajuste Políticas: Modifique useCSP.js para adicionar recursos necessários
3. Modo Report: Use Content-Security-Policy-Report-Only durante desenvolvimento

Tokens Expirados

1. Refresh Automático: O sistema tenta refresh automático
2. Reautenticação: Redireciona para autenticação biométrica
3. Limpeza Automática: Tokens expirados são removidos automaticamente

Padrões de Código

· Siga o ESLint configuration<br>
· Use Vue 3 Composition API<br>
· Mantenha testes atualizados<br>
· Documente novas features

🛣️ Roadmap

· Suporte a múltiplos usuários<br>
· Autenticação multi-fator<br>
· Backup de credenciais<br>
· Integração com backend<br>
· Offline support avançado<br>
· PWA completo<br>
· Mais provedores de autenticação

🙋 FAQ

P: Posso usar em produção?

R: Sim, o projeto está pronto para produção, mas recomenda-se revisão de segurança.

P: Quais navegadores são suportados?

R: Chrome 67+, Firefox 60+, Edge 79+, Safari 13+

P: Preciso de servidor backend?

R: Não, funciona completamente no frontend, mas pode ser integrado com backend.

P: Como customizar as políticas CSP?

R: Modifique o arquivo src/composables/useCSP.js

📞 Suporte

Encontrou um problema? Abra uma issue

---

Desenvolvido com ❤️ e 🛡️ segurança em mente

---

## 🤝 Contribuições
Contribuições são sempre bem-vindas!  
Sinta-se à vontade para abrir uma [*issue*](https://github.com/NinoMiquelino/webauthn-secure-portal-vuejs/issues) com sugestões ou enviar um [*pull request*](https://github.com/NinoMiquelino/webauthn-secure-portal-vuejs/pulls) com melhorias.

---

## 💬 Contato
📧 [Entre em contato pelo LinkedIn](https://www.linkedin.com/in/onivaldomiquelino/)  
💻 Desenvolvido por **Onivaldo Miquelino**

---
