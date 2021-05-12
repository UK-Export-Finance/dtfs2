import moment from 'moment';
import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/integration/partials';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/mockUsers';
import MOCK_MIA_DEAL_READY_TO_SUBMIT from '../test-data/MIA-deal/dealReadyToSubmit';

const MAKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('maker') && user.username === 'MAKER-TFM'));
const CHECKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('checker') && user.username === 'CHECKER-TFM'));

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertManyDeals([
      MOCK_MIA_DEAL_READY_TO_SUBMIT(),
    ], MAKER_LOGIN)
      .then((insertedDeals) => {
        deal = insertedDeals[0];
        dealId = insertedDeals[0]._id;

        const { mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  it('MIA is submitted, TFM Underwriter submits `Approved` decision. Portal status updates; Portal deal is resubmitted and then should become an MIN', () => {
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
    portalPages.contractConfirmSubmission.acceptAndSubmit().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // portal deal status should be updated
    //---------------------------------------------------------------
    cy.wait(1000); // wait for TFM to do it's thing
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
    // Cypress.config('tfmUrl') returns incorrect url...
    const tfmRootUrl = 'http://localhost:5003';

    cy.forceVisit(tfmRootUrl);

    tfmPages.landingPage.email().type('UNDERWRITER_MANAGER_1');
    tfmPages.landingPage.submitButton().click();

    cy.forceVisit(`${tfmRootUrl}/case/${dealId}/deal`);

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
    tfmPartials.underwritingSubNav.underwriterManagerDecisionLink().click();
    tfmPages.managersDecisionPage.addDecisionLink().click();

    const MOCK_COMMENTS = 'e2e test comment';

    tfmPages.managersDecisionPage.decisionRadioInputApproveWithConditions().click();
    tfmPages.managersDecisionPage.commentsInputApproveWithConditions().type(MOCK_COMMENTS);
    tfmPages.managersDecisionPage.submitButton().click();


    //---------------------------------------------------------------
    // Go back to Portal
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
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
    cy.login(MAKER_LOGIN);
    portalPages.contract.visit(deal);

    //---------------------------------------------------------------
    // portal maker confirms bond start date
    //---------------------------------------------------------------
    const bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = portalPages.contract.bondTransactionsTable.row(bondId);

    bondRow.changeOrConfirmCoverStartDateLink().click();
    portalPages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    portalPages.facilityConfirmCoverStartDate.submit().click();

    //---------------------------------------------------------------
    // portal maker confirms loan start date
    //---------------------------------------------------------------
    const loanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
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
    cy.login(CHECKER_LOGIN);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');


    //---------------------------------------------------------------
    // portal deal status should be updated
    //---------------------------------------------------------------
    cy.wait(5000); // wait for TFM to do it's thing
    portalPages.contract.visit(deal);
    portalPages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });

    //---------------------------------------------------------------
    // portal deal should now be MIN with submission date
    //---------------------------------------------------------------
    portalPages.contract.eligibilitySubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Manual Inclusion Notice');
    });

    portalPages.contract.eligibilityManualInclusionNoticeSubmissionDate().invoke('text').then((text) => {
      const todayFormatted = moment().format('DD/MM/YYYY');

      expect(text.trim()).to.contain(todayFormatted);
    });

    //---------------------------------------------------------------
    // Go back to TFM
    //---------------------------------------------------------------
    cy.forceVisit(tfmRootUrl);

    tfmPages.landingPage.email().type('UNDERWRITER_MANAGER_1');
    tfmPages.landingPage.submitButton().click();

    cy.forceVisit(`${tfmRootUrl}/case/${dealId}/deal`);

    //---------------------------------------------------------------
    // TFM deal submission type should have changed from MIA to MIN
    //---------------------------------------------------------------
    tfmPartials.caseSummary.dealSubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Manual Inclusion Notice');
    });
  });
});
