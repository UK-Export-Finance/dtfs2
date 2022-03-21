import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/integration/partials';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/users';
import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/AIN-deal/dealReadyToSubmit';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;
import { UNDERWRITER_MANAGER_1, TFM_URL } from '../../../../fixtures';

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

  it('Portal deal is submitted to UKEF, `Good` credit rating is added to the deal in TFM', () => {
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
    // user login to TFM
    //---------------------------------------------------------------
    cy.forceVisit(TFM_URL);

    cy.tfmLogin(UNDERWRITER_MANAGER_1);

    const tfmCaseDealPage = `${TFM_URL}/case/${dealId}/deal`;
    cy.forceVisit(tfmCaseDealPage);

    tfmPartials.caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', `${TFM_URL}/case/${dealId}/underwriting/pricing-and-risk`);

    // assert elements/value in `pricing and risk` page
    tfmPages.underwritingPricingAndRiskPage.addRatingLink().should('not.exist');

    tfmPages.underwritingPricingAndRiskPage.exporterTableRatingValue().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acceptable (B+)');
    });

    tfmPages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().should('be.visible');
  });
});
