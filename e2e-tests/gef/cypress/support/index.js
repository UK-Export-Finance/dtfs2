import 'cypress-file-upload';
import login from './commands/login';
import reinsertMocks from './commands/reinsertMocks';
import * as api from './commands/api';
import uploadFile from './commands/uploadFile';

Cypress.Commands.add('reinsertMocks', reinsertMocks);
Cypress.Commands.add('login', login);
Cypress.Commands.add('apiLogin', api.login);
Cypress.Commands.add('apiFetchAllApplications', api.fetchAllApplications);
Cypress.Commands.add('apiUpdateExporter', api.updateExporter);
Cypress.Commands.add('apiFetchAllFacilities', api.fetchAllFacilities);
Cypress.Commands.add('apiSetApplicationStatus', api.setApplicationStatus);
Cypress.Commands.add('uploadFile', uploadFile);
