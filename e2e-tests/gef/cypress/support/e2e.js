/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import 'cypress-file-upload';
import login from './commands/login';
import reinsertMocks from './commands/reinsertMocks';
import * as api from './commands/api';
import uploadFile from './commands/uploadFile';
import insertElement from './commands/insertElement';
import getApplicationById from './commands/getApplicationById';
import submitDealAfterUkefIdsCall from './commands/submitDealAfterUkefIds';

// Mitigates test fails due to js errors (third-party js)
Cypress.on('uncaught:exception', () => false);

// eslint-disable-next-line no-unused-vars
Cypress.on('fail', (err, _runnable) => {
  const pageBodyHtml = Cypress.$('body').html();

  // Print the page body HTML to the console as part of the error if a test fails
  // TODO DTFS2-6775: Remove this extra logging information when there are no more flakey e2e tests
  // to investigate.
  // eslint-disable-next-line no-param-reassign
  err.message += `\n\n[DEBUG] The HTML of the page body is: ${JSON.stringify(pageBodyHtml)}`;
  throw err;
});

// Preserve session cookie
Cypress.Commands.add('saveSession', require('./commands/saveSession'));

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
Cypress.Commands.add('insertElement', insertElement);
Cypress.Commands.add('addCommentObjToDeal', api.addCommentObjToDeal);
Cypress.Commands.add('submitDealAfterUkefIds', submitDealAfterUkefIdsCall);
Cypress.Commands.add('submitDealToTfm', api.submitDealToTfm);
Cypress.Commands.add('addUnderwriterCommentToTfm', api.addUnderwriterCommentToTfm);
Cypress.Commands.add('getApplicationById', getApplicationById);
