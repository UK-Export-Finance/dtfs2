import { DEAL_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import relative from '../../../../relativeURL';
import gefPages from '../../../../../../../gef/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT, MOCK_APPLICATION_MIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { yesterday, tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1 } = MOCK_USERS;

context('GEF deals - When TFM submits a deal cancellation - Portal maker should not be able to clone the deal', () => {
  /* creates 4 deals: 2 AIN deals (one cancelled and one scheduled for cancellation) 
    and 2 MIN deals (one cancelled and one scheduled for cancellation). */
  const gefDeals = [MOCK_APPLICATION_AIN_DRAFT, MOCK_APPLICATION_AIN_DRAFT, MOCK_APPLICATION_MIN_DRAFT, MOCK_APPLICATION_MIN_DRAFT];
  const deals = [];

  before(() => {
    cy.insertManyGefDeals(gefDeals, BANK1_MAKER1).then((insertedDeals) => {
      insertedDeals.forEach((insertedDeal, index) => {
        const gefDeal = { ...insertedDeal };

        const mockDeal = index < 2 ? MOCK_APPLICATION_AIN_DRAFT : MOCK_APPLICATION_MIN_DRAFT;
        cy.updateGefDeal(gefDeal._id, mockDeal, BANK1_MAKER1);

        cy.createGefFacilities(gefDeal._id, [anIssuedCashFacility({ facilityEndDateEnabled: true })], BANK1_MAKER1).then((createdFacilities) => {
          gefDeal.facilities = createdFacilities;
          cy.makerLoginSubmitGefDealForReview(gefDeal);
          cy.checkerLoginSubmitGefDealToUkef(gefDeal);
          cy.clearSessionCookies();

          cy.visit(TFM_URL);
          cy.tfmLogin(PIM_USER_1);

          /* effective date for cancellation and scheduled cancellation for AIN and MIN deals. */
          const effectiveDate = index % 2 === 0 ? yesterday.date : tomorrow.date;
          cy.submitDealCancellation({ dealId: gefDeal._id, effectiveDate });
          // get deal with updated status for cancellation in past or in the future
          cy.getOneGefDeal(gefDeal._id, BANK1_MAKER1).then((deal) => deals.push({ ...deal, facilities: createdFacilities }));
        });
      });
    });
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  describe('when a deal has already been cancelled', () => {
    describe('AIN Deal', () => {
      it('should not allow a Maker to clone the deal', () => {
        const ainDealPast = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.CANCELLED);

        cy.visit(relative(`/gef/application-details/${ainDealPast._id}`));

        gefPages.cloneDeal.cloneGefDealLink().should('not.exist');
      });
    });

    describe('MIN Deal', () => {
      it('should not allow a Maker to clone the deal', () => {
        const minDealPast = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.CANCELLED);

        cy.visit(relative(`/gef/application-details/${minDealPast._id}`));

        gefPages.cloneDeal.cloneGefDealLink().should('not.exist');
      });
    });
  });

  describe('when a deal has been scheduled for cancellation', () => {
    describe('AIN Deal', () => {
      it('should not allow a Maker to clone the deal', () => {
        const ainDealFuture = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION);

        cy.visit(relative(`/gef/application-details/${ainDealFuture._id}`));

        gefPages.cloneDeal.cloneGefDealLink().should('not.exist');
      });
    });

    describe('MIN Deal', () => {
      it('should not allow a Maker to clone the deal', () => {
        const minDealFuture = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION);

        cy.visit(relative(`/gef/application-details/${minDealFuture._id}`));

        gefPages.cloneDeal.cloneGefDealLink().should('not.exist');
      });
    });
  });
});
