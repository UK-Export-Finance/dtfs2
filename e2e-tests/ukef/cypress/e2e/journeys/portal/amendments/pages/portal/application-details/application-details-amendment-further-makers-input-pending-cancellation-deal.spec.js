import { tomorrow } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const CHANGED_FACILITY_VALUE = 20000;

context(`Amendments - Application details - application preview page when deal status is "Cancelled" and amendment is "Further maker's input required"`, () => {
  let applicationDetailsUrl;
  let dealId;
  let facilityId;
  let amendmentDetailsUrl;

  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = relative(`/gef/application-details/${dealId}`);

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

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          const amendmentUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}`;

          amendmentDetailsUrl = `${amendmentUrl}/amendment-details`;
          const confirmReturnToMakerUrl = `${amendmentUrl}/return-to-maker`;
          const submittedUrl = `${amendmentUrl}/returned-to-maker`;

          cy.makerSubmitAmendmentForReviewAndCheckerReturnsToMaker({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE,
            amendmentDetailsUrl,
            confirmReturnToMakerUrl,
            submittedUrl,
          });
        });

        cy.clearSessionCookies();

        cy.visit(TFM_URL);

        cy.tfmLogin(PIM_USER_1);

        const tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
        cy.visit(tfmDealPage);

        const effectiveDate = tomorrow.date;

        cy.submitDealCancellation({ dealId, effectiveDate });
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
      cy.visit(applicationDetailsUrl);
    });

    it('should not display the make a change button', () => {
      applicationPreview.makeAChangeButton(facilityId).should('not.exist');
    });

    it('should not have the amendment details header, banner or link', () => {
      applicationPreview.amendmentDetailsHeaderReadyForCheckers().should('not.exist');
      applicationPreview.amendmentDetailsHeaderFurtherMakersInput().should('not.exist');
      applicationPreview.amendmentDetailsReadyForCheckerLink(0).should('not.exist');
      applicationPreview.amendmentDetailsFurtherMakersInputLink(0).should('not.exist');

      applicationPreview.amendmentInProgress().should('not.exist');
    });

    it('should display the amendments abandoned deal pending cancellation banner', () => {
      applicationPreview.amendmentsAbandonedDealPendingCancellationBanner().should('exist');
      cy.assertText(
        applicationPreview.amendmentsAbandonedDealPendingCancellationBanner(),
        'Any amendments in progress have been abandoned by UKEF, as the deal is pending cancellation.',
      );
    });

    it('should not display the amendments abandoned deal cancelled banner', () => {
      applicationPreview.amendmentsAbandonedDealCancelledBanner().should('not.exist');
    });
  });

  describe('Checker', () => {
    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_CHECKER1);
      cy.visit(applicationDetailsUrl);
    });

    it('should not display the make a change button', () => {
      applicationPreview.makeAChangeButton(facilityId).should('not.exist');
    });

    it('should not have the amendment details header, banner or link', () => {
      applicationPreview.amendmentDetailsHeaderReadyForCheckers().should('not.exist');
      applicationPreview.amendmentDetailsHeaderFurtherMakersInput().should('not.exist');
      applicationPreview.amendmentDetailsReadyForCheckerLink(0).should('not.exist');
      applicationPreview.amendmentDetailsFurtherMakersInputLink(0).should('not.exist');

      applicationPreview.amendmentInProgress().should('not.exist');
    });

    it('should display the amendments abandoned deal pending cancellation banner', () => {
      applicationPreview.amendmentsAbandonedDealPendingCancellationBanner().should('exist');
      cy.assertText(
        applicationPreview.amendmentsAbandonedDealPendingCancellationBanner(),
        'Any amendments in progress have been abandoned by UKEF, as the deal is pending cancellation.',
      );
    });

    it('should not display the amendments abandoned deal cancelled banner', () => {
      applicationPreview.amendmentsAbandonedDealCancelledBanner().should('not.exist');
    });
  });
});
