import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/e2e/pages';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/users';
import MOCK_MIN_UNISSUED_FACILITIES_DEAL_READY_TO_SUBMIT from '../test-data/MIN-deal-unissued-facilities/dealReadyToSubmit';

import {
  COVER_START_DATE_VALUE as BOND_COVER_START_DATE_VALUE,
  COVER_END_DATE_VALUE as BOND_COVER_END_DATE_VALUE,
  fillAndSubmitIssueBondFacilityForm,
} from '../../../../../../portal/cypress/e2e/journeys/maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm';

import {
  COVER_START_DATE_VALUE as LOAN_COVER_START_DATE_VALUE,
  COVER_END_DATE_VALUE as LOAN_COVER_END_DATE_VALUE,
  DISBURSEMENT_AMOUNT_VALUE,
  fillAndSubmitIssueLoanFacilityForm,
} from '../../../../../../portal/cypress/e2e/journeys/maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

import { UNDERWRITER_MANAGER_1, TFM_URL } from '../../../../../../e2e-fixtures';

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_MIN_UNISSUED_FACILITIES_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
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

  it('MIN deal with unissued facilities that then become issued updates facilites in TFM', () => {
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
    // portal maker completes bond issuance form
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);

    const bondId = dealFacilities.bonds[0]._id;
    const bondRow = portalPages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityForm();

    //---------------------------------------------------------------
    // portal maker completes loan issuance form
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);

    const loanId = dealFacilities.loans[0]._id;
    const loanRow = portalPages.contract.loansTransactionsTable.row(loanId);

    loanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityForm();

    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

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

    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    // force wait: wait for number generator to finish executing
    cy.wait(15000)

    //---------------------------------------------------------------
    // login to TFM
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(UNDERWRITER_MANAGER_1);

    //---------------------------------------------------------------
    // tenor for all facilities should be updated in main deal page
    //---------------------------------------------------------------
    const tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
    cy.forceVisit(tfmDealPage);

    const tfmBondRow = tfmPages.caseDealPage.dealFacilitiesTable.row(bondId);
    tfmBondRow.facilityTenor().invoke('text').then((text) => {
      // the actual month is generated dynamically via API.
      // 'months' is added to the mapping of the API result.
      // so safe to assert based on `months` appearing, rather than adding regex assertion.
      expect(text.trim()).to.contain('month');
    });

    const tfmLoanRow = tfmPages.caseDealPage.dealFacilitiesTable.row(loanId);
    tfmLoanRow.facilityTenor().invoke('text').then((text) => {
      // the actual month is generated dynamically via API.
      // 'months' is added to the mapping of the API result.
      // so safe to assert based on `months` appearing, rather than adding regex assertion.
      expect(text.trim()).to.contain('month');
    });

    //---------------------------------------------------------------
    // bond facility should be updated
    //---------------------------------------------------------------
    const tfmBondFacilityPage = `${TFM_URL}/case/${dealId}/facility/${bondId}`;
    cy.forceVisit(tfmBondFacilityPage);

    tfmPages.facilityPage.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issued');
    });

    tfmPages.facilityPage.facilityBankIssueNoticeReceived().invoke('text').then((text) => {
      // the code actually uses facility.submittedAsIssuedDate,
      // but in this e2e test it will always be today so to simplify..
      const expectedDate = new Date().toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityCoverStartDate().invoke('text').then((text) => {
      const expectedDate = new Date(BOND_COVER_START_DATE_VALUE).toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityCoverEndDate().invoke('text').then((text) => {
      const expectedDate = new Date(BOND_COVER_END_DATE_VALUE).toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityTenor().invoke('text').then((text) => {
      // the actual month is generated dynamically via API.
      // 'months' is added to the mapping of the API result.
      // so safe to assert based on `months` appearing, rather than adding regex assertion.
      expect(text.trim()).not.to.contain(dealFacilities.bonds[0].ukefGuaranteeInMonths);
      expect(text.trim()).to.contain('month');
    });

    //---------------------------------------------------------------
    // bond facility - premium schedule should be updated
    //---------------------------------------------------------------
    tfmPages.facilityPage.facilityTabPremiumSchedule().click();

    tfmPages.facilityPage.premiumScheduleTable.total().should('be.visible');

    tfmPages.facilityPage.premiumScheduleTable.total().invoke('text').then((text) => {
      // total is calculated dynamically so we can only assert the `Total` text.
      // this text is only displayed if a total exists.
      expect(text.trim()).to.contain('Total');
    });

    //---------------------------------------------------------------
    // loan facility should be updated
    //---------------------------------------------------------------
    const tfmLoanFacilityPage = `${TFM_URL}/case/${dealId}/facility/${loanId}`;
    cy.forceVisit(tfmLoanFacilityPage);

    tfmPages.facilityPage.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issued');
    });

    tfmPages.facilityPage.facilityBankIssueNoticeReceived().invoke('text').then((text) => {
      // the code actually uses facility.submittedAsIssuedDate,
      // but in this e2e test it will always be today so to simplify..
      const expectedDate = new Date().toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.firstDrawdownAmountInExportCurrency().invoke('text').then((text) => {
      const expectedValue = Number(DISBURSEMENT_AMOUNT_VALUE).toLocaleString('en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const expected = `${dealFacilities.loans[0].currency.id} ${expectedValue}`;

      expect(text.trim()).to.equal(expected);
    });

    tfmPages.facilityPage.facilityCoverStartDate().invoke('text').then((text) => {
      const expectedDate = new Date(LOAN_COVER_START_DATE_VALUE).toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityCoverEndDate().invoke('text').then((text) => {
      const expectedDate = new Date(LOAN_COVER_END_DATE_VALUE).toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityTenor().invoke('text').then((text) => {
      // the actual month is generated dynamically via API.
      // 'months' is added to the mapping of the API result.
      // so safe to assert based on `months` appearing, rather than adding regex assertion.
      expect(text.trim()).not.to.contain(dealFacilities.loans[0].ukefGuaranteeInMonths);
      expect(text.trim()).to.contain('month');
    });

    //---------------------------------------------------------------
    // loan facility - premium schedule should be updated
    //---------------------------------------------------------------
    tfmPages.facilityPage.facilityTabPremiumSchedule().click();

    tfmPages.facilityPage.premiumScheduleTable.total().should('be.visible');

    tfmPages.facilityPage.premiumScheduleTable.total().invoke('text').then((text) => {
      // total is calculated dynamically so we can only assert the `Total` text.
      // this text is only displayed if a total exists.
      expect(text.trim()).to.contain('Total');
    });

    tfmPages.facilityPage.allFacilitiesLink().click();
    tfmPages.facilitiesPage.facilityIdLink(dealFacilities.bonds[0]._id).should('exist');
    tfmPages.facilitiesPage.facilityIdLink(dealFacilities.loans[0]._id).should('exist');
  });
});
