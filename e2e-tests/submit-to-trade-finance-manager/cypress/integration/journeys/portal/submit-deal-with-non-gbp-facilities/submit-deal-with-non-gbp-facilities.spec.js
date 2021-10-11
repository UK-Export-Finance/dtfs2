import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/mockUsers';
import MOCK_DEAL_READY_TO_SUBMIT from './test-data/dealReadyToSubmit';

const MAKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));
const CHECKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('checker') && user.username === 'BANK1_CHECKER1'));

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([
      MOCK_DEAL_READY_TO_SUBMIT(),
    ], MAKER_LOGIN)
      .then((insertedDeals) => {
        [deal] = insertedDeals;
        dealId = deal._id;

        const { mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });
      });
  });

  it('Portal deal is submitted to UKEF, user views deal in TFM. Facilities display GBP and non-GBP values and maximum ukef exposure in GBP', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    portalPages.contractReadyForReview.comments().type('go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();


    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // user can login to TFM and view the submitted deal
    //---------------------------------------------------------------
    // Cypress.config('tfmUrl') returns incorrect url...
    const tfmRootUrl = 'http://localhost:5003';

    cy.forceVisit(tfmRootUrl);

    tfmPages.landingPage.email().type('T1_USER_1');
    tfmPages.landingPage.submitButton().click();

    const tfmCaseDealPage = `${tfmRootUrl}/case/${dealId}/deal`;
    cy.forceVisit(tfmCaseDealPage);
    cy.url().should('eq', `${tfmRootUrl}/case/${dealId}/deal`);

    //---------------------------------------------------------------
    // deal facilities with non-GBP currency display GBP and non-GBP currency values
    //---------------------------------------------------------------
    const facilityWithNonGBPCurrency = dealFacilities.find((facility) => facility.currency.code !== 'GBP');
    const facilityId = facilityWithNonGBPCurrency._id;
    const facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(facilityId);

    facilityRow.facilityId().click();

    cy.url().should('eq', `${tfmRootUrl}/case/${dealId}/facility/${facilityId}`);

    tfmPages.facilityPage.facilityValueExportCurrency().invoke('text').then((text) => {
      const facilityCurrency = facilityWithNonGBPCurrency.currency.id;
      expect(text.trim()).to.contain(facilityCurrency);
    });

    // currency is converted dynamically - tricky/flaky to assert/mock this from e2e test
    tfmPages.facilityPage.facilityValueGbp().invoke('text').then((text) => {
      expect(text.trim()).to.contain('GBP');
    });

    tfmPages.facilityPage.facilityMaximumUkefExposure().invoke('text').then((text) => {
      expect(text.trim()).to.contain('GBP');
    });
  });
});
