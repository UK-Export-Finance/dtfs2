/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import 'cypress-file-upload';
import login from './commands/login';
import * as api from './commands/api';
import loadData from './commands/loadData';
import uploadFile from './commands/uploadFile';
import insertElement from './commands/insertElement';
import getApplicationById from './commands/getApplicationById';
import submitDealAfterUkefIdsCall from './commands/submitDealAfterUkefIds';
import automaticEligibilityCriteria from './commands/automaticEligibilityCriteria';
import manualEligibilityCriteria from './commands/manualEligibilityCriteria';

// Mitigates test fails due to js errors (third-party js)
Cypress.on('uncaught:exception', () => false);

// Preserve session cookie
Cypress.Commands.add('saveSession', require('./commands/saveSession'));

Cypress.Commands.add('loadData', loadData);
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
Cypress.Commands.add('insertElement', insertElement);
Cypress.Commands.add('addCommentObjToDeal', api.addCommentObjToDeal);
Cypress.Commands.add('submitDealAfterUkefIds', submitDealAfterUkefIdsCall);
Cypress.Commands.add('submitDealToTfm', api.submitDealToTfm);
Cypress.Commands.add('addUnderwriterCommentToTfm', api.addUnderwriterCommentToTfm);
Cypress.Commands.add('getApplicationById', getApplicationById);
Cypress.Commands.add('automaticEligibilityCriteria', automaticEligibilityCriteria);
Cypress.Commands.add('manualEligibilityCriteria', manualEligibilityCriteria);
