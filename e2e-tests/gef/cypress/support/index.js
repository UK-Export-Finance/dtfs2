/* eslint-disable no-undef */
import login from './commands/login';
import reinsertMocks from './commands/reinsertMocks';
// import * as api from './commands/api';

Cypress.Commands.add('reinsertMocks', reinsertMocks);
Cypress.Commands.add('login', login);
// Cypress.Commands.add('apiLogin', api.login);
// Cypress.Commands.add('apiCreateApplication', api.createApplication);
// Cypress.Commands.add('apiUpdateExporter', api.updateExporter);
