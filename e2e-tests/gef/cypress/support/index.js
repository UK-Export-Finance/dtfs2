/* eslint-disable no-undef */
import login from './commands/login';
import clearDatabase from './commands/clearDatabase';

Cypress.Commands.add('login', login);
Cypress.Commands.add('clearDatabase', clearDatabase);
