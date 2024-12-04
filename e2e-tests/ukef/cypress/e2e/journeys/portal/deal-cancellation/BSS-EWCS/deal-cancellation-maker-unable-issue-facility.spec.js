import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, FACILITY_TYPE } from '@ukef/dtfs2-common';
import portalPages from '../../../../../../../portal/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { generateAinDealUnissuedFacilitiesWithDates } from '../../test-data/AIN-deal-unissued-facilities/dealReadyToSubmit';
import generateMinDealUnissuedFacilitiesWithDates from '../../test-data/MIN-deal-unissued-facilities/dealReadyToSubmit';

import { TFM_URL, PIM_USER_1 } from '../../../../../../../e2e-fixtures';
import { yesterday, tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

context('When a deal has been cancelled on TFM, maker unable to issue facility', () => {
  const ainDealWithUnissuedFacilities = Array(2).fill(generateAinDealUnissuedFacilitiesWithDates());
  const minDealWithUnissuedFacilities = Array(2).fill(generateMinDealUnissuedFacilitiesWithDates());
  const deals = [];

  before(() => {
    cy.insertManyDeals([...ainDealWithUnissuedFacilities, ...minDealWithUnissuedFacilities], BANK1_MAKER1).then((insertedDeals) => {
      insertedDeals.forEach((insertedDeal, index) => {
        const deal = { ...insertedDeal };
        cy.createFacilities(insertedDeal._id, deal.mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          deal.facilities = createdFacilities;

          cy.makerSubmitDealForReview(deal);
          cy.checkerSubmitDealToUkef(deal);

          cy.clearCookie('dtfs-session');
          cy.clearCookie('_csrf');
          cy.getCookies().should('be.empty');

          cy.forceVisit(TFM_URL);
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
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
    cy.login(BANK1_MAKER1);
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  describe('when a deal has unissued facilities submitted to UKEF and the deal has already been cancelled', () => {
    describe('AIN deal', () => {
      it('AIN deal with unissued facilities is submitted to UKEF, user cancelled the deal in the past in TFM. Maker unable to issue facility on portal', () => {
        const ainDealPast = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.CANCELLED);
        const ainDealfacilityPast = ainDealPast.facilities.find((facility) => facility.type === FACILITY_TYPE.BOND)._id;
        portalPages.contract.visit(ainDealPast);
        portalPages.contract.bondTransactionsTable.row(ainDealfacilityPast).issueFacilityLink().should('not.exist');
      });
      describe('MIN deal', () => {
        it('MIN deal with unissued facilities is submitted to UKEF, user cancelled the deal in the past in TFM. Maker unable to issue facility on portal', () => {
          const minDealPast = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.CANCELLED);
          const minDealfacilityPast = minDealPast.facilities.find((facility) => facility.type === FACILITY_TYPE.BOND)._id;
          portalPages.contract.visit(minDealPast);
          portalPages.contract.bondTransactionsTable.row(minDealfacilityPast).issueFacilityLink().should('not.exist');
        });
      });
    });
  });

  describe('when a deal has unissued facilities submitted to UKEF and the deal has been scheduled for cancellation', () => {
    describe('AIN deal', () => {
      it('AIN deal with unissued facilities is submitted to UKEF, user schedule cancellation in the future in TFM. Maker unable to issue facility on portal', () => {
        const ainDealFuture = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION);
        const ainDealFacilityFuture = ainDealFuture.facilities.find((facility) => facility.type === FACILITY_TYPE.BOND)._id;
        portalPages.contract.visit(ainDealFuture);
        portalPages.contract.bondTransactionsTable.row(ainDealFacilityFuture).issueFacilityLink().should('not.exist');
      });
    });
    describe('MIN deal', () => {
      it('MIN deal with unissued facilities is submitted to UKEF, user schedule cancellation deal in the future in TFM. Maker unable to issue facility on portal', () => {
        const minDealFuture = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION);
        const minDealFacilityFuture = minDealFuture.facilities.find((facility) => facility.type === FACILITY_TYPE.BOND)._id;
        portalPages.contract.visit(minDealFuture);
        portalPages.contract.bondTransactionsTable.row(minDealFacilityFuture).issueFacilityLink().should('not.exist');
      });
    });
  });
});
