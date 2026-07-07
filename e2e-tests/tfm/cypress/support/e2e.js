import './commands';
import 'cypress-plugin-tab';

// Mitigates test fails due to js errors (third-party js)
Cypress.on('uncaught:exception', () => false);
