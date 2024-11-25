import gefPages from '../../../../../../../gef/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_MIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { yesterday } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

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
      cy.gefDealCancellationFlow(dealId, yesterday.date);
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
