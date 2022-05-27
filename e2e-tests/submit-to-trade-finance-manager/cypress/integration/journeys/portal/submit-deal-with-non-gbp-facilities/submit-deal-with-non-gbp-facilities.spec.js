import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/users';
import MOCK_DEAL_READY_TO_SUBMIT from './test-data/dealReadyToSubmit';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;
import { T1_USER_1, TFM_URL } from '../../../../../../e2e-fixtures';

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
      [deal] = insertedDeals;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });
    });
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  it('Portal deal is submitted to UKEF, user views deal in TFM. Facilities display GBP and non-GBP values and maximum ukef exposure in GBP', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    portalPages.contractReadyForReview.comments().type('go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // user can login to TFM and view the submitted deal
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(T1_USER_1);

    const tfmCaseDealPage = `${TFM_URL}/case/${dealId}/deal`;
    cy.forceVisit(tfmCaseDealPage);
    cy.url().should('eq', `${TFM_URL}/case/${dealId}/deal`);

    //---------------------------------------------------------------
    // deal facilities with non-GBP currency display GBP and non-GBP currency values
    //---------------------------------------------------------------
    const facilityWithNonGBPCurrency = dealFacilities.find((facility) => facility.currency.code !== 'GBP');
    const facilityId = facilityWithNonGBPCurrency._id;
    const facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(facilityId);

    facilityRow.facilityId().click();

    cy.url().should('eq', `${TFM_URL}/case/${dealId}/facility/${facilityId}`);

    tfmPages.facilityPage
      .facilityValueExportCurrency()
      .invoke('text')
      .then((text) => {
        const facilityCurrency = facilityWithNonGBPCurrency.currency.id;
        expect(text.trim()).to.contain(facilityCurrency);
      });

    // currency is converted dynamically - tricky/flaky to assert/mock this from e2e test
    tfmPages.facilityPage
      .facilityValueGbp()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain('GBP');
      });

    tfmPages.facilityPage
      .facilityMaximumUkefExposure()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain('GBP');
      });
  });
});
