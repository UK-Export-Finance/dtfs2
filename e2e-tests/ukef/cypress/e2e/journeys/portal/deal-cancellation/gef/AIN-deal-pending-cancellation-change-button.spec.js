import { tomorrow } from '@ukef/dtfs2-common/test-helpers';
import { DEAL_STATUS } from '@ukef/dtfs2-common';
import relative from '../../../../relativeURL';
import statusBanner from '../../../../../../../gef/cypress/e2e/pages/application-status-banner';
import applicationPreview from '../../../../../../../gef/cypress/e2e/pages/application-preview';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1 } = MOCK_USERS;

context('GEF AIN deal - When TFM submits a pending deal cancellation - Facility section should be locked', () => {
  let gefDeal;
  let dealId;

  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      gefDeal = insertedDeal;
      dealId = gefDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacilities) => {
        gefDeal.facilities = createdFacilities;
        cy.makerLoginSubmitGefDealForReview(gefDeal);
        cy.checkerLoginSubmitGefDealToUkef(gefDeal);
        cy.clearSessionCookies();

        cy.visit(TFM_URL);
        cy.tfmLogin(PIM_USER_1);

        const effectiveDate = tomorrow.date;

        cy.submitDealCancellation({ dealId, effectiveDate });

        cy.getOneGefDeal(dealId, BANK1_MAKER1).then((latestDeal) => {
          gefDeal = latestDeal;
        });
      });
    });
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
    cy.saveSession();

    cy.visit(relative(`/gef/application-details/${dealId}`));
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  it('should update the deal status', () => {
    cy.assertText(statusBanner.bannerStatus(), DEAL_STATUS.PENDING_CANCELLATION);
  });

  describe('Facilities section', () => {
    it('should lock relevant fields', () => {
      applicationPreview.facilityGuidance();
      applicationPreview.facilityGuidance().contains('Guidance on cash and contingent facilities');
      applicationPreview.facilityGuidance().contains('Cash facilities');
      applicationPreview.facilityGuidance().contains('Contingent facilities');
      applicationPreview.facilityGuidance().contains('How many you can add');

      //  makes sure no action buttons exist (change or add)
      applicationPreview.facilitySummaryListTable(2).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(1).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(3).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).dayCountBasisAction().should('have.class', 'govuk-!-display-none');
    });
  });
});
