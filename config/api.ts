export const API_CONFIG = {
  webhook: {
    production: 'https://primary-production-2e3b.up.railway.app/webhook/patentesdev',
    test: 'https://primary-production-2e3b.up.railway.app/webhook-test/patentesdev',
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

export const PLAN_URLS = {
  jedi: import.meta.env.VITE_PLAN_JEDI_URL,
  mestreJedi: import.meta.env.VITE_PLAN_MESTRE_JEDI_URL,
  mestreYoda: import.meta.env.VITE_PLAN_MESTRE_YODA_URL
};