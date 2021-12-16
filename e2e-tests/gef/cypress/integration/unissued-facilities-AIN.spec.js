import relative from './relativeURL';
import {
  MOCK_AIN_APPLICATION, MOCK_FACILITY_ONE, MOCK_FACILITY_TWO, MOCK_FACILITY_THREE, MOCK_FACILITY_FOUR, MOCK_USER_MAKER,
} from '../fixtures/MOCKS/MOCK_DEALS';
import applicationPreview from './pages/application-preview';
import unissuedFacilityTable from './pages/unissued-facilities';
import aboutFacilityUnissued from './pages/unissued-facilities-about-facility';
import CREDENTIALS from '../fixtures/credentials.json';
import applicationDetails from './pages/application-details';
import automaticCover from './pages/automatic-cover';
import applicationSubmission from './pages/application-submission';
import submitToUkef from './pages/submit-to-ukef';
import submitToUkefConfirmation from './pages/submit-to-ukef-confirmation';
import statusBanner from './pages/application-status-banner';

let applicationId;
let tokenStore;

context('Unissued Facilities AIN', () => {
  before(() => {
    console.log('here');
    cy.apiLogin(CREDENTIALS.CHECKER)
      .then((token) => { tokenStore = token; console.log('token', token); })
      .then(() => {
        cy.createApplication(CREDENTIALS.MAKER, tokenStore).then(({ body }) => {
          applicationId = body.items[2]._id;
          console.log(body);
        });
      });
  });

  describe('Change facility to issued from unissued table', () => {
    beforeEach(() => {
    //   Cypress.Cookies.preserveOnce('connect.sid');
    //   cy.login(CREDENTIALS.MAKER);
    //   cy.visit(relative(`/gef/application-details/${applicationId}`));
    });

    it('task comment box exists with correct header and unissued facilities link', () => {
      // applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
    });
  });
});
