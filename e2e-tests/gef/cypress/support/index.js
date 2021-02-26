/* eslint-disable no-undef */
import login from './commands/login';
import reinsertMocks from './commands/reinsertMocks';

Cypress.Commands.add('login', login);
Cypress.Commands.add('reinsertMocks', reinsertMocks);
