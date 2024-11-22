import relative from '../../../../relativeURL';
import gefPages from '../../../../../../../gef/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_MIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';
import { yesterday } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Deal cancellation', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_MIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      // updates a gef deal so has relevant fields
      cy.updateGefDeal(dealId, MOCK_APPLICATION_MIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [anIssuedCashFacility({ facilityEndDateEnabled: true })], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(createdFacilities.details);
      });
    });
  });

  beforeEach(() => {
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  describe('effective date in the past', () => {
    before(() => {
      //---------------------------------------------------------------
      // portal maker submits gef deal for review
      //---------------------------------------------------------------
      cy.login(BANK1_MAKER1);
      gefPages.applicationDetails.visit(dealId);
      cy.clickSubmitButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
      cy.keyboardInput(gefPages.applicationSubmission.commentsField(), 'go');
      cy.clickSubmitButton();

      //---------------------------------------------------------------
      // portal checker submits gef deal to ukef
      //---------------------------------------------------------------
      cy.login(BANK1_CHECKER1);
      gefPages.applicationDetails.visit(dealId);
      cy.clickSubmitButton();
      gefPages.applicationSubmission.confirmSubmissionCheckbox().check();
      cy.clickSubmitButton();

      // expect to land on the /submit-to-ukef page with a success message
      cy.url().should('include', '/submit-to-ukef');

      //---------------------------------------------------------------
      // user login to TFM and cancel the gef deal
      //----------------------------------------------------------------

      cy.clearCookie('dtfs-session');
      cy.clearCookie('_csrf');
      cy.getCookies().should('be.empty');
      cy.forceVisit(TFM_URL);

      cy.tfmLogin(PIM_USER_1);
      cy.forceVisit(`${TFM_URL}/case/${dealId}/deal`);
      cy.submitDealCancellation({ dealId, effectiveDate: yesterday.date });
    });

    it('Gef MIN deal with issued facilities is submitted to UKEF, user cancel deal in TFM. Maker unable to issue facility on portal', () => {
      //-----------------------------------------------------------------------
      // user login to portal and unable to view update issue facility section
      //-----------------------------------------------------------------------

      cy.clearCookie('dtfs-session');
      cy.clearCookie('_csrf');
      cy.getCookies().should('be.empty');
      cy.login(BANK1_MAKER1);
      gefPages.applicationDetails.visit(dealId);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });
  });
});
