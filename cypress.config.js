const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.spec.js',
    baseUrl: 'https://studio-management-2db77ac46923.herokuapp.com/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
