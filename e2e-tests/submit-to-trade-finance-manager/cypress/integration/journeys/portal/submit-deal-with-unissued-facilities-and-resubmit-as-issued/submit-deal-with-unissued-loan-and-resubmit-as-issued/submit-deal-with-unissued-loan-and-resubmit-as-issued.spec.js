import moment from 'moment';
import relative from '../../../../relativeURL';
import portalPages from '../../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../../trade-finance-manager/cypress/integration/pages';
import {
  COVER_START_DATE_VALUE,
  COVER_END_DATE_VALUE,
  DISBURSEMENT_AMOUNT_VALUE,
  fillAndSubmitIssueLoanFacilityForm,
} from '../../../../../../../portal/cypress/integration/journeys/maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm';

import MOCK_USERS from '../../../../../../../portal/cypress/fixtures/mockUsers';
import MOCK_DEAL_UNISSUED_LOAN_READY_TO_SUBMIT from './test-data/dealWithUnissuedLoanReadyToSubmit';

const MAKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));
const CHECKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('checker') && user.username === 'BANK1_CHECKER1'));

// Cypress.config('tfmUrl') returns incorrect url...
const tfmRootUrl = 'http://localhost:5003';

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];
  let loan;
  let loanId;

  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertManyDeals([
      MOCK_DEAL_UNISSUED_LOAN_READY_TO_SUBMIT(),
    ], MAKER_LOGIN)
      .then((insertedDeals) => {
        deal = insertedDeals[0];
        dealId = insertedDeals[0]._id;

        const { mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
          loan = createdFacilities[0];
          loanId = loan._id;
        });
      });
  });

  it('Portal deal with unissued loan is submitted to UKEF, loan displays correctly in TFM. Loan is then issued in Portal and resubmitted; displays correctly in TFM with Premium schedule populated, Portal facility status is updated to `Acknowledged`', () => {
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
    // TFM loan values should render in an unissued state
    //---------------------------------------------------------------
    cy.forceVisit(tfmRootUrl);

    tfmPages.landingPage.email().type('BUSINESS_SUPPORT_USER_1');
    tfmPages.landingPage.submitButton().click();

    let tfmFacilityPage = `${tfmRootUrl}/case/${dealId}/facility/${loanId}`;
    cy.forceVisit(tfmFacilityPage);

    tfmPages.facilityPage.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Commitment');
    });

    tfmPages.facilityPage.facilityBankIssueNoticeReceived().invoke('text').then((text) => {
      expect(text.trim()).to.equal('-');
    });

    // tfmPages.facilityPage.firstDrawdownAmountInExportCurrency().should('not.be.visible');

    tfmPages.facilityPage.facilityCoverStartDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal('-');
    });

    tfmPages.facilityPage.facilityCoverEndDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal('-');
    });

    tfmPages.facilityPage.facilityTenor().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${loan.ukefGuaranteeInMonths} months`);
    });


    //---------------------------------------------------------------
    // portal maker completes loan inssuance form
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    portalPages.contract.visit(deal);
    const loanRow = portalPages.contract.loansTransactionsTable.row(loanId);

    loanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityForm();


    //---------------------------------------------------------------
    // portal maker submits deal to checker
    //---------------------------------------------------------------
    portalPages.contract.proceedToReview().click();

    portalPages.contractReadyForReview.comments().type('Issued');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');


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
    // TFM loan values should be updated
    //---------------------------------------------------------------
    cy.forceVisit(tfmRootUrl);
    tfmPages.landingPage.email().type('BUSINESS_SUPPORT_USER_1');
    tfmPages.landingPage.submitButton().click();

    tfmFacilityPage = `${tfmRootUrl}/case/${dealId}/facility/${loanId}`;
    cy.forceVisit(tfmFacilityPage);

    tfmPages.facilityPage.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issued');
    });

    tfmPages.facilityPage.facilityBankIssueNoticeReceived().invoke('text').then((text) => {
      // the code actually uses facility.issuedFacilitySubmittedToUkefTimestamp,
      // but in this e2e test it will always be today so to simplify..
      const expectedDate = moment().format('D MMMM YYYY');
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.firstDrawdownAmountInExportCurrency().invoke('text').then((text) => {
      const expectedValue = Number(DISBURSEMENT_AMOUNT_VALUE).toLocaleString('en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const expected = `${loan.currency.id} ${expectedValue}`;

      expect(text.trim()).to.equal(expected);
    });

    tfmPages.facilityPage.facilityCoverStartDate().invoke('text').then((text) => {
      const expectedDate = moment(COVER_START_DATE_VALUE).format('D MMMM YYYY');
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityCoverEndDate().invoke('text').then((text) => {
      const expectedDate = moment(COVER_END_DATE_VALUE).format('D MMMM YYYY');
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityTenor().invoke('text').then((text) => {
      // the actual month is generated dynamically via API.
      // 'months' is added to the mapping of the API result.
      // so safe to assert based on `months` appearing, rather than adding regex assertion.
      expect(text.trim()).not.to.contain(loan.ukefGuaranteeInMonths);
      expect(text.trim()).to.contain('month');
    });

    //---------------------------------------------------------------
    // TFM loan should have Premium schedule populated
    //---------------------------------------------------------------
    tfmPages.facilityPage.facilityTabPremiumSchedule().click();

    tfmPages.facilityPage.premiumScheduleTable.total().should('be.visible');

    tfmPages.facilityPage.premiumScheduleTable.total().invoke('text').then((text) => {
      // total is calculated dynamically so we can only assert the `Total` text.
      // this text is only displayed if a total exists.
      expect(text.trim()).to.contain('Total');
    });

    //---------------------------------------------------------------
    // portal loan status should be updated to `Acknowledged by UKEF`
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    portalPages.contract.visit(deal);

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });

    //---------------------------------------------------------------
    // portal deal status should be updated to `Acknowledged by UKEF`
    //---------------------------------------------------------------
    portalPages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    portalPages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });
  });
});
