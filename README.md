# Consulta de Patentes - Plataforma de Análise de Propriedade Intelectual Farmacêutica

## 🔬 Sobre o Projeto

Plataforma especializada em consulta e análise de patentes farmacêuticas com inteligência artificial. Permite verificar status de patentes, identificar riscos regulatórios e descobrir oportunidades de mercado.

## 🚀 Funcionalidades

- **Consulta de Patentes**: Análise completa de propriedade intelectual farmacêutica
- **Sistema de Polling Robusto**: Aguarda resposta completa do webhook sem timeout
- **Dados Químicos**: Informações moleculares detalhadas
- **Ensaios Clínicos**: Status de estudos em andamento
- **Regulação**: Análise por país e agência reguladora
- **Score de Oportunidade**: Avaliação automatizada de potencial comercial
- **Exportação PDF**: Relatórios completos para download

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Autenticação**: Firebase Auth
- **Banco de Dados**: Firestore
- **Deploy**: Netlify

## 📦 Instalação

```bash
npm install
npm run dev
```

## 🔧 Configuração

1. Configure as variáveis de ambiente do Firebase
2. Configure a API de consulta de patentes
3. Configure os planos de pagamento (Stripe)

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── auth/           # Autenticação
│   ├── PatentConsultation.tsx
│   ├── PatentResultsPage.tsx
│   ├── PatentLoadingAnimation.tsx
│   ├── Layout.tsx
│   └── ...
├── utils/
│   ├── patentParser.ts
│   ├── webhookPoller.ts      # Sistema de polling sem timeout
│   ├── webhookStatusStore.ts # Gerenciamento de status no Firestore
│   └── unrestrictedEmails.ts
└── types.ts
```

## 📊 Agências de Patentes Conectadas

- **INPI** (Brasil)
- **USPTO** (Estados Unidos)
- **EPO** (Europa)
- **WIPO** (Internacional)

## 🔐 Segurança

- Autenticação Firebase
- Verificação de email
- Controle de acesso por planos
- Proteção de dados LGPD/GDPR
- Sistema de polling robusto para webhooks

## 📞 Suporte

WhatsApp: +55 11 99573-6666

---

© 2025 Consulta de Patentes. Todos os direitos reservados.