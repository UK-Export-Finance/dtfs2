import './click-events';
import './trade-finance-manager-api';
import './ui';
import { submitDealCancellation } from './trade-finance-manager-ui/submit-deal-cancellation';
import { saveSession } from './utils/saveSession';
import { keyboardInput } from './utils/keyboardInput';
import { completeDateFormFields } from './trade-finance-manager-ui/completeDateFormFields';
import { loadData } from './utils/loadData';
import { assertLength } from './utils/assertLength';
import { assertText } from './utils/assertText';
import { assertValue } from './utils/assertValue';
import { assertUrl } from './utils/assertUrl';
import { checkClassName } from './utils/checkClassName';
import { autocompleteKeyboardInput } from './utils/autoCompleteKeyboardInput';
import { getInputByLabelText } from './utils/getInputByLabelText';

// Preserve session cookie
Cypress.Commands.add('saveSession', saveSession);

Cypress.Commands.add('keyboardInput', keyboardInput);

// Assert an element has some exact text
Cypress.Commands.add('assertText', assertText);

Cypress.Commands.add('assertValue', assertValue);

Cypress.Commands.add('assertUrl', assertUrl);

Cypress.Commands.add('assertLength', assertLength);

Cypress.Commands.add('checkClassName', checkClassName);

Cypress.Commands.add('autocompleteKeyboardInput', autocompleteKeyboardInput);

Cypress.Commands.add('getInputByLabelText', getInputByLabelText);

Cypress.Commands.add('completeDateFormFields', completeDateFormFields);

// commands used to interact directly with Deal API
// NOTE: this will eventually become TFM API, that calls Deal API.
// right now we only have TFM API that can find a deal, Portal API does the rest.
Cypress.Commands.add('overridePortalUserSignInTokenWithValidTokenByUsername', require('./portal-api/overridePortalUserSignInTokenWithValidTokenByUsername'));
Cypress.Commands.add('getUserByUsername', require('./portal-api/getUserByUsername'));
Cypress.Commands.add('resetPortalUserStatusAndNumberOfSignInLinks', require('./portal-api/resetPortalUserStatusAndNumberOfSignInLinks'));

Cypress.Commands.add('insertOneDeal', require('./portal-api/insertOneDeal'));
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));
Cypress.Commands.add('insertOneGefDeal', require('./portal-api/insertOneGefDeal'));
Cypress.Commands.add('insertManyGefDeals', require('./portal-api/insertManyGefDeals'));
Cypress.Commands.add('deleteDeals', require('./portal-api/deleteDeals'));
Cypress.Commands.add('createFacilities', require('./portal-api/createFacilities'));
Cypress.Commands.add('createGefFacilities', require('./portal-api/createGefFacility'));
Cypress.Commands.add('updateGefDeal', require('./portal-api/updateGefDeal'));

Cypress.Commands.add('deleteFacility', require('./central-api/deleteFacility'));
Cypress.Commands.add('deleteTfmDeals', require('./central-api/deleteTfmDeals'));

Cypress.Commands.add('updateTFMDeal', require('./central-api/updateTFMDeal'));

Cypress.Commands.add('submitDealCancellation', submitDealCancellation);
Cypress.Commands.add('listAllDeals', require('./portal-api/listAllDeals'));

Cypress.Commands.add('loadData', loadData);
