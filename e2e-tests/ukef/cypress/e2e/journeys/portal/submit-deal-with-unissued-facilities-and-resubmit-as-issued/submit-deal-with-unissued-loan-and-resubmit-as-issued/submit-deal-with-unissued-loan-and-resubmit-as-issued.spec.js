import relative from '../../../../relativeURL';
import portalPages from '../../../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../../../tfm/cypress/e2e/pages';
import {
  COVER_START_DATE_VALUE,
  COVER_END_DATE_VALUE,
  DISBURSEMENT_AMOUNT_VALUE,
  fillAndSubmitIssueLoanFacilityForm,
} from '../../../../../../../portal/cypress/e2e/journeys/maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm';

import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import MOCK_DEAL_UNISSUED_LOAN_READY_TO_SUBMIT from './test-data/dealWithUnissuedLoanReadyToSubmit';
import { BUSINESS_SUPPORT_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];
  let loan;
  let loanId;

  before(() => {
    cy.insertManyDeals([MOCK_DEAL_UNISSUED_LOAN_READY_TO_SUBMIT()], BANK1_MAKER1)
      .then((insertedDeals) => {
        [deal] = insertedDeals;
        dealId = deal._id;

        const { mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1)
          .then((createdFacilities) => {
            dealFacilities.push(...createdFacilities);
            [loan] = createdFacilities;
            loanId = loan._id;
          })
          .then(() => {
            cy.wrap(dealFacilities).should('not.be.empty');
          });
      })
      .then(() => {
        cy.wrap(deal).should('not.be.empty');
      });
  });

  beforeEach(() => {
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });
  it('Portal deal with unissued loan is submitted to UKEF, loan displays correctly in TFM. Loan is then issued in Portal and resubmitted; displays correctly in TFM with Premium schedule populated, Portal facility status is updated to `Acknowledged`', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'go');
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
    // TFM loan values should render in an unissued state
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(BUSINESS_SUPPORT_USER_1);

    let tfmFacilityPage = `${TFM_URL}/case/${dealId}/facility/${loanId}`;
    cy.forceVisit(tfmFacilityPage);

    cy.assertText(tfmPages.facilityPage.facilityStage(), 'Commitment');

    cy.assertText(tfmPages.facilityPage.facilityBankIssueNoticeReceived(), '-');

    cy.assertText(tfmPages.facilityPage.facilityCoverStartDate(), '-');

    cy.assertText(tfmPages.facilityPage.facilityCoverEndDate(), '-');

    cy.assertText(tfmPages.facilityPage.facilityTenor(), `${loan.ukefGuaranteeInMonths} months`);

    //---------------------------------------------------------------
    // portal maker completes loan insurance form
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);
    const loanRow = portalPages.contract.loansTransactionsTable.row(loanId);

    loanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityForm();

    //---------------------------------------------------------------
    // portal maker submits deal to checker
    //---------------------------------------------------------------
    portalPages.contract.proceedToReview().click();

    cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'Issued');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
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
    // TFM loan values should be updated
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(BUSINESS_SUPPORT_USER_1);

    tfmFacilityPage = `${TFM_URL}/case/${dealId}/facility/${loanId}`;
    cy.forceVisit(tfmFacilityPage);

    cy.assertText(tfmPages.facilityPage.facilityStage(), 'Issued');

    cy.assertText(
      tfmPages.facilityPage.facilityBankIssueNoticeReceived(),
      // the code actually uses facility.submittedAsIssuedDate,
      // but in this e2e test it will always be today so to simplify..
      new Date().toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }),
    );

    const expectedDrawdownAmount = Number(DISBURSEMENT_AMOUNT_VALUE).toLocaleString('en', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    cy.assertText(tfmPages.facilityPage.firstDrawdownAmountInExportCurrency(), `${loan.currency.id} ${expectedDrawdownAmount}`);

    const expectedCoverStartDate = new Date(COVER_START_DATE_VALUE).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    cy.assertText(tfmPages.facilityPage.facilityCoverStartDate(), expectedCoverStartDate);

    const expectedCoverEndDate = new Date(COVER_END_DATE_VALUE).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    cy.assertText(tfmPages.facilityPage.facilityCoverEndDate(), expectedCoverEndDate);

    tfmPages.facilityPage
      .facilityTenor()
      .invoke('text')
      .then((text) => {
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

    tfmPages.facilityPage.premiumScheduleTable
      .total()
      .invoke('text')
      .then((text) => {
        // total is calculated dynamically so we can only assert the `Total` text.
        // this text is only displayed if a total exists.
        expect(text.trim()).to.contain('Total');
      });

    //---------------------------------------------------------------
    // portal loan status should be updated to `Acknowledged`
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);

    cy.assertText(loanRow.loanStatus(), 'Acknowledged');

    //---------------------------------------------------------------
    // portal deal status should be updated to `Acknowledged`
    //---------------------------------------------------------------
    cy.assertText(portalPages.contract.previousStatus(), 'Submitted');

    cy.assertText(portalPages.contract.status(), 'Acknowledged');
  });
});
