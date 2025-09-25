import { yesterday, tomorrow } from '@ukef/dtfs2-common/test-helpers';
import { DEAL_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import portalPages from '../../../../../../../portal/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { generateAinDealUnissuedFacilitiesWithDates } from '../../test-data/AIN-deal-unissued-facilities/dealReadyToSubmit';
import generateMinDealUnissuedFacilitiesWithDates from '../../test-data/MIN-deal-unissued-facilities/dealReadyToSubmit';
import { PIM_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1 } = MOCK_USERS;

context('BSS/EWCS deals - When TFM submits a deal cancellation - Portal maker should not be able to clone the deal', () => {
  /* creates 4 deals: 2 AIN deals (one cancelled and one scheduled for cancellation) 
    and 2 MIN deals (one cancelled and one scheduled for cancellation). */
  const ainDeal = Array(2).fill(generateAinDealUnissuedFacilitiesWithDates());
  const minDeal = Array(2).fill(generateMinDealUnissuedFacilitiesWithDates());
  const deals = [];

  before(() => {
    cy.insertManyDeals([...ainDeal, ...minDeal], BANK1_MAKER1).then((insertedDeals) => {
      insertedDeals.forEach((insertedDeal, index) => {
        const deal = { ...insertedDeal };
        cy.createFacilities(insertedDeal._id, deal.mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          deal.facilities = createdFacilities;

          cy.makerSubmitDealForReview(deal);
          cy.checkerSubmitDealToUkef(deal);

          cy.clearCookie('dtfs-session');
          cy.clearCookie('_csrf');
          cy.getCookies().should('be.empty');

          cy.visit(TFM_URL);
          cy.tfmLogin(PIM_USER_1);
          const effectiveDate = index % 2 === 0 ? tomorrow.date : yesterday.date;
          cy.submitDealCancellation({ dealId: deal._id, effectiveDate });
          // get deal with updated status for cancellation in past or in the future
          cy.getOneDeal(deal._id, BANK1_MAKER1).then((response) => deals.push({ ...response.deal, facilities: createdFacilities }));
        });
      });
    });
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
    cy.saveSession();
  });

  after(() => {
    cy.clearSessionCookies();
  });

  describe('when a deal submitted to UKEF and the deal has already been cancelled', () => {
    describe('AIN deal', () => {
      it('should not allow a Maker to clone the deal', () => {
        const ainDealPast = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.CANCELLED);

        portalPages.contract.visit(ainDealPast);

        portalPages.cloneDeal.cloneDealLink().should('not.exist');
      });
    });

    describe('MIN deal', () => {
      it('should not allow a Maker to clone the deal', () => {
        const minDealPast = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.CANCELLED);

        portalPages.contract.visit(minDealPast);

        portalPages.cloneDeal.cloneDealLink().should('not.exist');
      });
    });
  });

  describe('when a deal submitted to UKEF and the deal has been scheduled for cancellation', () => {
    describe('AIN deal', () => {
      it('should not allow a Maker to clone the deal', () => {
        const ainDealFuture = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION);

        portalPages.contract.visit(ainDealFuture);

        portalPages.cloneDeal.cloneDealLink().should('not.exist');
      });
    });

    describe('MIN deal', () => {
      it('should not allow a Maker to clone the deal', () => {
        const minDealFuture = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION);

        portalPages.contract.visit(minDealFuture);

        portalPages.cloneDeal.cloneDealLink().should('not.exist');
      });
    });
  });
});
