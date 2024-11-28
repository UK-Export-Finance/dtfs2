import portalPages from '../../../../../../../portal/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { generateAinUnissuedDealWithDates } from '../../test-data/AIN-deal-unissued-facilities/dealReadyToSubmit';
import generateMinUnissuedDealWithDates from '../../test-data/MIN-deal-unissued-facilities/dealReadyToSubmit';
import { TFM_URL, PIM_USER_1 } from '../../../../../../../e2e-fixtures';

import { yesterday, tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Deal cancellation', () => {
  const ainUnissuedDeals = Array(2).fill(generateAinUnissuedDealWithDates());
  const minUnissuedDeals = Array(2).fill(generateMinUnissuedDealWithDates());
  const deals = [];

  before(() => {
    cy.insertManyDeals([...ainUnissuedDeals, ...minUnissuedDeals], BANK1_MAKER1).then((insertedDeals) => {
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

  describe('Deal cancellations on tfm with effective dates in the past', () => {
    it('AIN deal with unissued facilities is submitted to UKEF, user cancelled the deal in the past in TFM. Maker unable to issue facility on portal', () => {
      const ainDealPast = deals.find((deal) => deal.submissionType === 'Automatic Inclusion Notice' && deal.status === 'Cancelled');
      const ainDealfacilityPast = ainDealPast.facilities.find((facility) => facility.type === 'Bond')._id;
      portalPages.contract.visit(ainDealPast);
      portalPages.contract.bondTransactionsTable.row(ainDealfacilityPast).issueFacilityLink().should('not.exist');
    });

    it('MIN deal with unissued facilities is submitted to UKEF, user cancelled the deal in the past in TFM. Maker unable to issue facility on portal', () => {
      const minDealPast = deals.find((deal) => deal.submissionType === 'Manual Inclusion Notice' && deal.status === 'Cancelled');
      const minDealfacilityPast = minDealPast.facilities.find((facility) => facility.type === 'Bond')._id;
      portalPages.contract.visit(minDealPast);
      portalPages.contract.bondTransactionsTable.row(minDealfacilityPast).issueFacilityLink().should('not.exist');
    });
  });

  describe('Deal cancellations on tfm with effective dates in the future', () => {
    it('AIN deal with unissued facilities is submitted to UKEF, user schedule cancellation in the future in TFM. Maker unable to issue facility on portal', () => {
      const ainDealFuture = deals.find((deal) => deal.submissionType === 'Automatic Inclusion Notice' && deal.status === 'Pending cancellation');
      const ainDealFacilityFuture = ainDealFuture.facilities.find((facility) => facility.type === 'Bond')._id;
      portalPages.contract.visit(ainDealFuture);
      portalPages.contract.bondTransactionsTable.row(ainDealFacilityFuture).issueFacilityLink().should('not.exist');
    });

    it('MIN deal with unissued facilities is submitted to UKEF, user schedule cancellation deal in the future in TFM. Maker unable to issue facility on portal', () => {
      const minDealFuture = deals.find((deal) => deal.submissionType === 'Manual Inclusion Notice' && deal.status === 'Pending cancellation');
      const minDealFacilityFuture = minDealFuture.facilities.find((facility) => facility.type === 'Bond')._id;
      portalPages.contract.visit(minDealFuture);
      portalPages.contract.bondTransactionsTable.row(minDealFacilityFuture).issueFacilityLink().should('not.exist');
    });
  });
});
