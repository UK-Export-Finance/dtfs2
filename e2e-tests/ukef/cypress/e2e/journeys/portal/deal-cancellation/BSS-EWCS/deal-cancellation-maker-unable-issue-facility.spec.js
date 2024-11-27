import portalPages from '../../../../../../../portal/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import getAinUnissuedDeals from '../../test-data/AIN-deal-unissued-facilities/dealReadyToSubmit';
import getMinUnissuedDeals from '../../test-data/MIN-deal-unissued-facilities/dealReadyToSubmit';
import { TFM_URL, PIM_USER_1 } from '../../../../../../../e2e-fixtures';

import { yesterday, tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Deal cancellation', () => {
  const ainUnissuedDeals = Array(2).fill(getAinUnissuedDeals());
  const minUnissuedDeals = Array(2).fill(getMinUnissuedDeals());
  let deals = [];
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([...ainUnissuedDeals, ...minUnissuedDeals], BANK1_MAKER1).then((insertedDeals) => {
      insertedDeals.forEach((insertedDeal) => {
        cy.createFacilities(insertedDeal._id, insertedDeal.mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });
      });
      deals = [...insertedDeals];
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

  describe('Deal cancellations on tfm with effective dates in the past and in the future', () => {
    before(() => {
      deals.forEach((deal, index) => {
        const effectiveDate = index % 2 === 0 ? tomorrow.date : yesterday.date;
        cy.makerSubmitDealForReview(deal);
        cy.checkerSubmitDealToUkef(deal);

        cy.clearCookie('dtfs-session');
        cy.clearCookie('_csrf');
        cy.getCookies().should('be.empty');

        cy.forceVisit(TFM_URL);
        cy.tfmLogin(PIM_USER_1);

        cy.submitDealCancellation({ dealId: deal._id, effectiveDate });

        cy.clearCookie('dtfs-session');
        cy.clearCookie('_csrf');
        cy.getCookies().should('be.empty');
      });
    });

    it('AIN deal with unissued facilities is submitted to UKEF, user schedule cancellation in the future in TFM. Maker unable to issue facility on portal', () => {
      portalPages.contract.visit(deals[0]);
      portalPages.contract.bondTransactionsTable.row(dealFacilities[1]._id).issueFacilityLink().should('not.exist');
    });

    it('AIN deal with unissued facilities is submitted to UKEF, user cancelled the deal in the past in TFM. Maker unable to issue facility on portal', () => {
      portalPages.contract.visit(deals[1]);
      portalPages.contract.bondTransactionsTable.row(dealFacilities[3]._id).issueFacilityLink().should('not.exist');
    });

    it('MIN deal with unissued facilities is submitted to UKEF, user schedule cancellation deal in the future in TFM. Maker unable to issue facility on portal', () => {
      portalPages.contract.visit(deals[2]);
      portalPages.contract.bondTransactionsTable.row(dealFacilities[5]._id).issueFacilityLink().should('not.exist');
    });

    it('MIN deal with unissued facilities is submitted to UKEF, user cancelled the deal in the past in TFM. Maker unable to issue facility on portal', () => {
      portalPages.contract.visit(deals[3]);
      portalPages.contract.bondTransactionsTable.row(dealFacilities[7]._id).issueFacilityLink().should('not.exist');
    });
  });
});
