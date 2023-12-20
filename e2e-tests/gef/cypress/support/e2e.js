/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import 'cypress-file-upload';
import './commands';

// Mitigates test fails due to js errors (third-party js)
Cypress.on('uncaught:exception', () => false);
