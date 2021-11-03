import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/integration/partials';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/mockUsers';
import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/AIN-deal/dealReadyToSubmit';

const MAKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));
const CHECKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('checker') && user.username === 'BANK1_CHECKER1'));

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteTfmDeals();
    cy.insertManyDeals([MOCK_DEAL_READY_TO_SUBMIT()], MAKER_LOGIN).then((insertedDeals) => {
      [deal] = insertedDeals;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });
    });
  });

  after(() => {
    dealFacilities.forEach(({ _id }) => {
      cy.deleteFacility(_id, MAKER_LOGIN);
    });
    cy.deleteTfmDeals();
  });

  it('Portal deal is submitted to UKEF, facility `risk profile` defaults to `Flat`. User can navigate to facility pages', () => {
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
    // user login to TFM
    //---------------------------------------------------------------
    // Cypress.config('tfmUrl') returns incorrect url...
    const tfmRootUrl = 'http://localhost:5003';

    cy.forceVisit(tfmRootUrl);

    tfmPages.landingPage.email().type('BUSINESS_SUPPORT_USER_1');
    tfmPages.landingPage.submitButton().click();

    const tfmCaseDealPage = `${tfmRootUrl}/case/${dealId}/deal`;
    cy.forceVisit(tfmCaseDealPage);

    tfmPartials.caseSubNavigation.underwritingLink().click();

    // check facility 1 has default risk profile and can click through to facility page
    const facility1 = tfmPages.underwritingPricingAndRiskPage.facilityTable(dealFacilities[0]._id);

    facility1.riskProfile().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Flat');
    });

    facility1.facilityLink().click();
    cy.url().should('eq', `${tfmRootUrl}/case/${dealId}/facility/${dealFacilities[0]._id}`);

    // check facility 1 has default risk profile and can click through to facility page
    // cy.wait(3000);
    tfmPartials.caseSubNavigation.underwritingLink().click();
    const facility2 = tfmPages.underwritingPricingAndRiskPage.facilityTable(dealFacilities[1]._id);
    facility2.riskProfile().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Flat');
    });

    facility2.facilityLink().click();
    cy.url().should('eq', `${tfmRootUrl}/case/${dealId}/facility/${dealFacilities[1]._id}`);
  });
});
