import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context("Amendments ready for checker's approval - Deal summary page", () => {
  /**
   * @type {string}
   */
  let dealId;

  /**
   * @type {string}
   */
  let issuedCashFacilityId;

  /**
   * @type {string}
   */
  let amendmentDetailsUrl;

  const issuedCashFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
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
          amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${issuedCashFacilityId}/amendments/${amendmentId}/amendment-details`;
        });

        cy.makerSubmitPortalAmendmentForReview({
          coverEndDateExists: true,
          facilityValueExists: true,
          facilityEndDateExists: true,
          changedFacilityValue: '10000',
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

    it('should display the "Amendement details" link in the notification banner', () => {
      cy.assertText(applicationPreview.amendmentDetailsHeaderReadyForCheckers(), PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL);

      applicationPreview.amendmentDetailsReadyForCheckerLink(1).should('have.attr', 'href', amendmentDetailsUrl);
      cy.assertText(applicationPreview.amendmentDetailsReadyForCheckerLink(1), `Facility (${issuedCashFacility.ukefFacilityId}) amendment details`);
    });

    it('should display "Amendment in progress: See details" link in the facility section', () => {
      applicationPreview.amendmentInProgress().should('have.attr', 'href', amendmentDetailsUrl);
      cy.assertText(applicationPreview.amendmentInProgress(), 'See details');
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

    it('should display the "Check amendment details before submitting to UKEF" link in the notification banner', () => {
      cy.assertText(applicationPreview.amendmentDetailsHeaderReadyForCheckers(), PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL);

      applicationPreview.amendmentDetailsReadyForCheckerLink(1).should('have.attr', 'href', amendmentDetailsUrl);
      cy.assertText(applicationPreview.amendmentDetailsReadyForCheckerLink(1), `Facility (${issuedCashFacility.ukefFacilityId}) amendment details`);
    });

    it('should display "Amendment in progress: Check amendment details before submitting to UKEF" link in the facility section', () => {
      applicationPreview.amendmentInProgress().should('have.attr', 'href', amendmentDetailsUrl);
      cy.assertText(applicationPreview.amendmentInProgress(), 'Check amendment details before submitting to UKEF');
    });
  });
});
