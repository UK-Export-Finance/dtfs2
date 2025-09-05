import { today, tomorrow } from '../../../../../../../../../e2e-fixtures/dateConstants';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';

const { dashboardDeals } = require('../../../../../../../../../portal/cypress/e2e/pages');

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '10000';

context('Amendments - Dashboard Deals table - last updated', () => {
  let dealId;
  let facilityId;
  let submittedUrl;

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
      });
    });
  });

  describe('Amendment effective in the past', () => {
    before(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
      cy.visit(`/gef/application-details/${dealId}`);
      applicationPreview.makeAChangeButton(facilityId).click();

      cy.getAmendmentIdFromUrl().then((amendmentId) => {
        submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/approved-by-ukef`;
        const amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

        const confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;

        cy.makerAndCheckerSubmitPortalAmendmentRequest({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE,
          amendmentDetailsUrl,
          submittedUrl,
          confirmSubmissionToUkefUrl,
          effectiveDate: today.date,
        });
      });
    });

    after(() => {
      cy.clearCookies();
      cy.clearSessionCookies();
    });

    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
    });

    it('should render deals table with the updatedAt the date the amendment has been approved', () => {
      dashboardDeals.row.updated(dealId).should('exist');
      dashboardDeals.row.updated(dealId).should('have.text', today.d_MMM_yyyy);
    });
  });

  describe('Amendment effective in the future', () => {
    before(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
      cy.visit(`/gef/application-details/${dealId}`);
      applicationPreview.makeAChangeButton(facilityId).click();

      cy.getAmendmentIdFromUrl().then((amendmentId) => {
        submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/approved-by-ukef`;
        const amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

        const confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;

        cy.makerAndCheckerSubmitPortalAmendmentRequest({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE,
          amendmentDetailsUrl,
          submittedUrl,
          confirmSubmissionToUkefUrl,
          effectiveDate: tomorrow.date,
        });
      });
    });

    after(() => {
      cy.clearCookies();
      cy.clearSessionCookies();
    });

    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
    });

    it('should render deals table with the updatedAt the date the amendment has been approved', () => {
      dashboardDeals.row.updated(dealId).should('exist');
      dashboardDeals.row.updated(dealId).should('have.text', today.d_MMM_yyyy);
    });
  });
});
