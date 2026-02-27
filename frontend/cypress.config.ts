import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: false,
  env: {
    apiUrl: 'http://localhost:8081',
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:4200/#',
  },
});
