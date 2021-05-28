import moment from 'moment';
import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/mockUsers';
import MOCK_MIN_UNISSUED_FACILITIES_DEAL_READY_TO_SUBMIT from '../test-data/MIN-deal-unissued-facilities/dealReadyToSubmit';

import {
  COVER_START_DATE_VALUE as BOND_COVER_START_DATE_VALUE,
  COVER_END_DATE_VALUE as BOND_COVER_END_DATE_VALUE,
  fillAndSubmitIssueBondFacilityForm,
} from '../../../../../../portal/cypress/integration/journeys/maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm';

import {
  COVER_START_DATE_VALUE as LOAN_COVER_START_DATE_VALUE,
  COVER_END_DATE_VALUE as LOAN_COVER_END_DATE_VALUE,
  DISBURSEMENT_AMOUNT_VALUE,
  fillAndSubmitIssueLoanFacilityForm,
} from '../../../../../../portal/cypress/integration/journeys/maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm';

const MAKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('maker') && user.username === 'MAKER-TFM'));
const CHECKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('checker') && user.username === 'CHECKER-TFM'));

// Cypress.config('tfmUrl') returns incorrect url...
const tfmRootUrl = 'http://localhost:5003';

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
      MOCK_MIN_UNISSUED_FACILITIES_DEAL_READY_TO_SUBMIT(),
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

  it('MIN deal with unissued facilities that then become issued updates facilties in TFM', () => {
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

    cy.wait(5000); // wait for TFM to do it's thing

    //---------------------------------------------------------------
    // portal maker completes bond issuance form
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    portalPages.contract.visit(deal);

    const bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = portalPages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityForm();

    //---------------------------------------------------------------
    // portal maker completes loan issuance form
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    portalPages.contract.visit(deal);

    const loanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = portalPages.contract.loansTransactionsTable.row(loanId);

    loanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityForm();

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

    cy.wait(5000); // wait for TFM to do it's thing

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // login to TFM
    //---------------------------------------------------------------
    cy.forceVisit(tfmRootUrl);
    tfmPages.landingPage.email().type('BUSINESS_SUPPORT_USER_1');
    tfmPages.landingPage.submitButton().click();


    //---------------------------------------------------------------
    // tenor for all facilities should be updated in main deal page
    //---------------------------------------------------------------
    const tfmDealPage = `${tfmRootUrl}/case/${dealId}/deal`;
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
    const tfmBondFacilityPage = `${tfmRootUrl}/case/${dealId}/facility/${bondId}`;
    cy.forceVisit(tfmBondFacilityPage);

    tfmPages.facilityPage.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issued');
    });

    tfmPages.facilityPage.facilityBankIssueNoticeReceived().invoke('text').then((text) => {
      // the code actually uses facility.issuedFacilitySubmittedToUkefTimestamp,
      // but in this e2e test it will always be today so to simplify..
      const expectedDate = moment().format('D MMMM YYYY');
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityCoverStartDate().invoke('text').then((text) => {
      const expectedDate = moment(BOND_COVER_START_DATE_VALUE).format('D MMMM YYYY');
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityCoverEndDate().invoke('text').then((text) => {
      const expectedDate = moment(BOND_COVER_END_DATE_VALUE).format('D MMMM YYYY');
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
    const tfmLoanFacilityPage = `${tfmRootUrl}/case/${dealId}/facility/${loanId}`;
    cy.forceVisit(tfmLoanFacilityPage);

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

      const expected = `${dealFacilities.loans[0].currency.id} ${expectedValue}`;

      expect(text.trim()).to.equal(expected);
    });

    tfmPages.facilityPage.facilityCoverStartDate().invoke('text').then((text) => {
      const expectedDate = moment(LOAN_COVER_START_DATE_VALUE).format('D MMMM YYYY');
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityCoverEndDate().invoke('text').then((text) => {
      const expectedDate = moment(LOAN_COVER_END_DATE_VALUE).format('D MMMM YYYY');
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityTenor().invoke('text').then((text) => {
      // the actual month is generated dynamically via API.
      // 'months' is added to the mapping of the API result.
      // so safe to assert based on `months` appearing, rather than adding regex assertion.
      expect(text.trim()).not.to.contain(dealFacilities.loans[0].ukefGuaranteeInMonths);
      expect(text.trim()).to.contain('month');
    });

  });
});
