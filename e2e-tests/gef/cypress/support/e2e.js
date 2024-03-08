import 'cypress-file-upload';
import './commands';

// Mitigates test fails due to js errors (third-party js)
Cypress.on('uncaught:exception', () => false);
