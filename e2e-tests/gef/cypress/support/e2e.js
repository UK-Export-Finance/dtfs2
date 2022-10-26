/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import 'cypress-file-upload';
import login from './commands/login';
import reinsertMocks from './commands/reinsertMocks';
import * as api from './commands/api';
import uploadFile from './commands/uploadFile';

Cypress.Commands.add('reinsertMocks', reinsertMocks);
Cypress.Commands.add('login', login);
Cypress.Commands.add('apiLogin', api.login);
Cypress.Commands.add('apiFetchAllApplications', api.fetchAllApplications);
Cypress.Commands.add('apiFetchAllFacilities', api.fetchAllFacilities);
Cypress.Commands.add('apiUpdateApplication', api.updateApplication);
Cypress.Commands.add('apiSetApplicationStatus', api.setApplicationStatus);
Cypress.Commands.add('apiCreateApplication', api.createApplication);
Cypress.Commands.add('apiCreateFacility', api.createFacility);
Cypress.Commands.add('apiUpdateFacility', api.updateFacility);
Cypress.Commands.add('uploadFile', uploadFile);
Cypress.Commands.add('addCommentObjToDeal', api.addCommentObjToDeal);
Cypress.Commands.add('submitDealAfterUkefIds', api.submitDealAfterUkefIds);
Cypress.Commands.add('submitDealToTfm', api.submitDealToTfm);
Cypress.Commands.add('addUnderwriterCommentToTfm', api.addUnderwriterCommentToTfm);
