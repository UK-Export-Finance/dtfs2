import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/e2e/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/e2e/partials';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/users';
import { UNDERWRITER_MANAGER_1, TFM_URL } from '../../../../../../e2e-fixtures';
import MOCK_MIA_DEAL_READY_TO_SUBMIT from '../test-data/MIA-deal/dealReadyToSubmit';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  let bondId;
  let loanId;
  const todayFormatted = new Date().toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });

  before(() => {
    cy.insertManyDeals([MOCK_MIA_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
      [deal] = insertedDeals;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        createdFacilities.forEach((facility) => {
          const { type } = facility;

          if (type === 'Bond') {
            bondId = facility._id;
          }

          if (type === 'Loan') {
            loanId = facility._id;
          }
        });
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

  it('Checker submits an MIA deal, TFM approves, BANK1_MAKER1/checker resubmit; Deal then becomes MIN', () => {
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
    // portal deal should have correct submission type and date prior to submission
    //---------------------------------------------------------------
    portalPages.contract.visit(deal);
    portalPages.contract.eligibilitySubmissionType().contains('Manual Inclusion Application');

    portalPages.contract.submissionDateTableHeader().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submission date');
    });
    portalPages.contract.submissionDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal('-');
    });

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
      expect(text.trim()).to.equal('In progress by UKEF');
    });

    portalPages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    //---------------------------------------------------------------
    // portal submission type remains the same
    //---------------------------------------------------------------
    portalPages.contract.eligibilitySubmissionType().contains('Manual Inclusion Application');

    //---------------------------------------------------------------
    // portal submission date should be updated
    //---------------------------------------------------------------
    portalPages.contract.submissionDateTableHeader().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submission date');
    });

    portalPages.contract.submissionDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal(todayFormatted);
    });

    //---------------------------------------------------------------
    // TFM Underwriter manager approves the deal
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(UNDERWRITER_MANAGER_1);

    const tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
    cy.forceVisit(tfmDealPage);

    // go to underwriter managers decision page
    tfmPartials.caseSubNavigation.underwritingLink().click();
    tfmPages.managersDecisionPage.addDecisionLink().click({ force: true });

    tfmPages.managersDecisionPage.decisionRadioInputApproveWithoutConditions().click();

    tfmPages.managersDecisionPage.submitButton().click();

    //---------------------------------------------------------------
    // portal BANK1_MAKER1 confirms no need to change cover start dates
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);

    const bondRow = portalPages.contract.bondTransactionsTable.row(bondId);
    bondRow.changeOrConfirmCoverStartDateLink().click();
    portalPages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    portalPages.facilityConfirmCoverStartDate.submit().click();

    const loanRow = portalPages.contract.loansTransactionsTable.row(loanId);
    loanRow.changeOrConfirmCoverStartDateLink().click();
    portalPages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    portalPages.facilityConfirmCoverStartDate.submit().click();

    //---------------------------------------------------------------
    // portal BANK1_MAKER1 submits deal for review
    //---------------------------------------------------------------
    portalPages.contract.proceedToReview().click();
    portalPages.contractReadyForReview.comments().type('go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);

    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // Portal Deal should now:
    // - be Manual Inclusion Notice
    // - display MIA submission date
    // - display MIN submission date
    // NOTE: MIA/MIN dates are the same in this test (today)
    // In the real world they could be different different days.
    //---------------------------------------------------------------
    portalPages.contract.visit(deal);

    portalPages.contract.eligibilitySubmissionType().contains('Manual Inclusion Notice');

    portalPages.contract.submissionDateTableHeader().invoke('text').then((text) => {
      expect(text.trim()).to.equal('MIA Submission date');
    });

    portalPages.contract.submissionDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal(todayFormatted);
    });

    portalPages.contract.eligibilityManualInclusionNoticeSubmissionDate().contains(todayFormatted);
  });
});
