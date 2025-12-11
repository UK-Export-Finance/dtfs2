import { format } from 'date-fns';
import { getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { tomorrow, D_MMMM_YYYY_FORMAT } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;
const CHANGED_FACILITY_VALUE_1 = '30000';
const facilityEndDate = tomorrow.date;
const coverEndDate = tomorrow.date;

context('Approved amendments - bank review date to facility end date - Deal summary page', () => {
  let dealId;
  let issuedCashFacilityId;
  let amendmentDetailsUrl;

  const issuedCashFacility = anIssuedCashFacility({ facilityEndDateEnabled: false });
  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [issuedCashFacility], BANK1_MAKER1).then((createdFacility) => {
        issuedCashFacilityId = createdFacility.details._id;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();

        cy.visit(relative(`/gef/application-details/${dealId}`));
        applicationPreview.makeAChangeButton(issuedCashFacilityId).click();

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          const submittedUrl = `/gef/application-details/${dealId}/facilities/${issuedCashFacilityId}/amendments/${amendmentId}/approved-by-ukef`;
          amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${issuedCashFacilityId}/amendments/${amendmentId}/amendment-details`;

          const confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${issuedCashFacilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;

          cy.makerAndCheckerSubmitPortalAmendmentRequest({
            coverEndDateExists: true,
            facilityValueExists: true,
            facilityEndDateExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE_1,
            changedCoverEndDate: tomorrow.date,
            amendmentDetailsUrl,
            submittedUrl,
            confirmSubmissionToUkefUrl,
          });
        });
      });
    });
  });

  describe('when a user logs in as a Maker', () => {
    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    after(() => {
      cy.clearCookies();
      cy.clearSessionCookies();
    });

    it('should not display the "Amendement details" link in the notification banner', () => {
      applicationPreview.amendmentDetailsHeaderReadyForCheckers().should('not.exist');
    });

    it('should not display "Amendment in progress: See details" link in the facility section', () => {
      applicationPreview.amendmentInProgress().should('not.exist');
    });

    it('should display the latest updated amendment value on facility summary list', () => {
      applicationPreview.facilitySummaryList().contains(getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_1, false));
      applicationPreview.facilitySummaryList().contains(format(coverEndDate, D_MMMM_YYYY_FORMAT));
      applicationPreview.facilitySummaryList().contains(format(facilityEndDate, D_MMMM_YYYY_FORMAT));
    });
  });

  describe('when a user logs in as a Checker', () => {
    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    after(() => {
      cy.clearCookies();
      cy.clearSessionCookies();
    });

    it('should not display the "Check amendment details before submitting to UKEF" link in the notification banner', () => {
      applicationPreview.amendmentDetailsHeaderReadyForCheckers().should('not.exist');
    });

    it('should not display "Amendment in progress: Check amendment details before submitting to UKEF" link in the facility section', () => {
      applicationPreview.amendmentInProgress().should('not.exist');
    });

    it('should display the latest updated amendment value on facility summary list', () => {
      applicationPreview.facilitySummaryList().contains(getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_1, false));
      applicationPreview.facilitySummaryList().contains(format(coverEndDate, D_MMMM_YYYY_FORMAT));
      applicationPreview.facilitySummaryList().contains(format(facilityEndDate, D_MMMM_YYYY_FORMAT));
    });
  });
});
