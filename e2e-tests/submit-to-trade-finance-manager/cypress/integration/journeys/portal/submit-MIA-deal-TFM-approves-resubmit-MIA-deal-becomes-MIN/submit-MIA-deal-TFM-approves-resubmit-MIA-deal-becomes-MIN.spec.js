import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/integration/partials';

import MOCK_PORTAL_USERS from '../../../../../../portal/cypress/fixtures/mockUsers';
import MOCK_TFM_USERS from '../../../../../../trade-finance-manager/cypress/fixtures/users';
import MOCK_MIA_DEAL_READY_TO_SUBMIT from '../test-data/MIA-deal/dealReadyToSubmit';

const MAKER = MOCK_PORTAL_USERS.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));
const CHECKER = MOCK_PORTAL_USERS.find((user) => (user.roles.includes('checker') && user.username === 'BANK1_CHECKER1'));
const UNDERWRITER_MANAGER = MOCK_TFM_USERS.find((user) => user.teams.includes('UNDERWRITER_MANAGERS'));

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  let bondId;
  let loanId;
  const todayFormatted = new Date().toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });

  before(() => {
    cy.insertManyDeals([
      MOCK_MIA_DEAL_READY_TO_SUBMIT(),
    ], MAKER)
      .then((insertedDeals) => {
        [deal] = insertedDeals;
        dealId = deal._id;

        const { mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, MAKER).then((createdFacilities) => {
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

  it('Checker submits an MIA deal, TFM approves, maker/checker resubmit; Deal then becomes MIN', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.login(MAKER);
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
    cy.login(CHECKER);
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
    // Cypress.config('tfmUrl') returns incorrect url...
    const tfmRootUrl = 'http://localhost:5003';

    cy.forceVisit(tfmRootUrl);

    tfmPages.landingPage.email().type(UNDERWRITER_MANAGER.username);
    tfmPages.landingPage.submitButton().click();

    const tfmDealPage = `${tfmRootUrl}/case/${dealId}/deal`;
    cy.forceVisit(tfmDealPage);

    // go to underwriter managers decision page
    tfmPartials.caseSubNavigation.underwritingLink().click();
    tfmPartials.underwritingSubNav.underwriterManagerDecisionLink().click();
    tfmPages.managersDecisionPage.addDecisionLink().click();

    tfmPages.managersDecisionPage.decisionRadioInputApproveWithoutConditions().click();

    tfmPages.managersDecisionPage.submitButton().click();

    //---------------------------------------------------------------
    // portal maker confirms no need to change cover start dates
    //---------------------------------------------------------------
    cy.login(MAKER);
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
    // portal maker submits deal for review
    //---------------------------------------------------------------
    portalPages.contract.proceedToReview().click();
    portalPages.contractReadyForReview.comments().type('go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login(CHECKER);
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
