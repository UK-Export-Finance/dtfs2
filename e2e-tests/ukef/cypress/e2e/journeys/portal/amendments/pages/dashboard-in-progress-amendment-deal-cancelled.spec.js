import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import dashboardDeals from '../../../../../../../portal/cypress/e2e/pages/dashboardDeals';
import { PIM_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const CHANGED_FACILITY_VALUE = 20000;

context('Amendments - Dashboard - Dashboard page when amendment is in-progress but deal is cancelled', () => {
  let dealId;
  let facilityId;

  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(relative(`/gef/application-details/${dealId}`));

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.makerSubmitPortalAmendmentForReview({ changedFacilityValue: CHANGED_FACILITY_VALUE, facilityValueExists: true });

        cy.clearSessionCookies();

        cy.visit(TFM_URL);

        cy.tfmLogin(PIM_USER_1);

        const tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
        cy.visit(tfmDealPage);

        cy.submitDealCancellation({ dealId });
      });
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  describe('Maker', () => {
    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
    });

    it('should show the dashboard deals link for the deal', () => {
      dashboardDeals.row.link(dealId).should('exist');
    });
  });

  describe('Checker', () => {
    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_CHECKER1);
    });

    it('should not show the dashboard deals link for the deal', () => {
      dashboardDeals.row.link(dealId).should('not.exist');
    });
  });
});
