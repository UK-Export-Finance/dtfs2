import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/users';
import MOCK_AIN_DEAL_READY_TO_SUBMIT from '../test-data/AIN-deal/dealReadyToSubmit';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_AIN_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
      [deal] = insertedDeals;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });
    });
  });

  beforeEach(() => {
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  it('Portal AIN deal is submitted to UKEF, TFM acknowledges the submission and updates the portal deal status from `Submitted` to `Acknowledged`', () => {
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

    portalPages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for Checker\'s approval');
    });

    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // portal deal status should be updated
    //---------------------------------------------------------------
    portalPages.contract.visit(deal);

    portalPages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged');
    });

    portalPages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });
  });
});
