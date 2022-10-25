import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/e2e/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/e2e/partials';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/users';
import MOCK_MIA_DEAL_READY_TO_SUBMIT from '../test-data/MIA-deal/dealReadyToSubmit';
import { UNDERWRITER_MANAGER_1, TFM_URL } from '../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_MIA_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
      [deal] = insertedDeals;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.bonds = bonds;
        dealFacilities.loans = loans;
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

  it('MIA is submitted, TFM Underwriter submits `Approved` decision. Portal status updates; Portal deal is resubmitted and then should become an MIN', () => {
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
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
    cy.forceVisit(TFM_URL);

    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);
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
      expect(text.trim()).to.equal('In progress by UKEF');
    });

    //---------------------------------------------------------------
    // Portal deal submission type should be MIA to start with
    //---------------------------------------------------------------
    portalPages.contract.eligibilitySubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Manual Inclusion Application');
    });

    //---------------------------------------------------------------
    // Underwriter Manager logs in to TFM
    //---------------------------------------------------------------

    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
    cy.forceVisit(TFM_URL);

    cy.tfmLogin(UNDERWRITER_MANAGER_1);

    cy.forceVisit(`${TFM_URL}/case/${dealId}/deal`);

    //---------------------------------------------------------------
    // TFM deal submission type should be MIA to start with
    //---------------------------------------------------------------
    tfmPartials.caseSummary.dealSubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Manual Inclusion Application');
    });

    //---------------------------------------------------------------
    // Underwriter Manager submits a decision
    //---------------------------------------------------------------
    tfmPartials.caseSubNavigation.underwritingLink().click();
    tfmPages.managersDecisionPage.addDecisionLink().click({ force: true });

    const MOCK_COMMENTS = 'e2e test comment';

    tfmPages.managersDecisionPage.decisionRadioInputApproveWithConditions().click();
    tfmPages.managersDecisionPage.commentsInputApproveWithConditions().type(MOCK_COMMENTS);
    tfmPages.managersDecisionPage.submitButton().click();

    //---------------------------------------------------------------
    // Go back to Portal
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);

    //---------------------------------------------------------------
    // Portal deal status should be updated
    //---------------------------------------------------------------
    portalPages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('In progress by UKEF');
    });

    portalPages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Accepted by UKEF (with conditions)');
    });

    //---------------------------------------------------------------
    // portal maker goes back into the deal
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);

    //---------------------------------------------------------------
    // portal maker confirms bond start date
    //---------------------------------------------------------------
    const bondId = dealFacilities.bonds[0]._id;
    const bondRow = portalPages.contract.bondTransactionsTable.row(bondId);

    bondRow.changeOrConfirmCoverStartDateLink().click();
    portalPages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    portalPages.facilityConfirmCoverStartDate.submit().click();

    //---------------------------------------------------------------
    // portal maker confirms loan start date
    //---------------------------------------------------------------
    const loanId = dealFacilities.loans[0]._id;
    const loanRow = portalPages.contract.loansTransactionsTable.row(loanId);

    loanRow.changeOrConfirmCoverStartDateLink().click();
    portalPages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    portalPages.facilityConfirmCoverStartDate.submit().click();

    //---------------------------------------------------------------
    // portal maker submits deal for second review
    //---------------------------------------------------------------
    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    portalPages.contractReadyForReview.comments().type('go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // portal checker submits deal to ukef again
    //---------------------------------------------------------------
    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);
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

    //---------------------------------------------------------------
    // portal deal should now be MIN with submission date
    //---------------------------------------------------------------
    portalPages.contract.eligibilitySubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Manual Inclusion Notice');
    });

    portalPages.contract.eligibilityManualInclusionNoticeSubmissionDate().invoke('text').then((text) => {
      const todayFormatted = new Date().toLocaleDateString('en-GB');

      expect(text.trim()).to.contain(todayFormatted);
    });

    //---------------------------------------------------------------
    // Go back to TFM
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(UNDERWRITER_MANAGER_1);

    cy.forceVisit(`${TFM_URL}/case/${dealId}/deal`);

    //---------------------------------------------------------------
    // TFM deal submission type should have changed from MIA to MIN
    //---------------------------------------------------------------
    tfmPartials.caseSummary.dealSubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Manual Inclusion Notice');
    });
  });
});
