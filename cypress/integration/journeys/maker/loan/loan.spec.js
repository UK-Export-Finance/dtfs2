const moment = require('moment');
const pages = require('../../../pages');
const partials = require('../../../partials');
const LOAN_FORM_VALUES = require('./loan-form-values');
const relative = require('../../../relativeURL');
const fillLoanForm = require('./fill-loan-forms');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

context('Add a Loan to a Deal', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MOCK_DEAL, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('should allow a user to create a Deal, pass Red Line and add a Loan to the deal', () => {
    cy.createADeal({
      username: MAKER_LOGIN.username,
      password: MAKER_LOGIN.password,
      bankDealId: MOCK_DEAL.details.bankSupplyContractID,
      bankDealName: MOCK_DEAL.details.bankSupplyContractName,
    });
    cy.addLoanToDeal();

    cy.url().should('include', '/preview');

    pages.loanPreview.submissionDetails().should('be.visible');
  });

  it('should populate Deal page with the submitted loan, with `Completed` status and link to `Loan Gurantee Details` page', () => {
    cy.loginGoToDealPage(MAKER_LOGIN, deal);
    pages.contract.addLoanButton().click();
    fillLoanForm.unconditionalWithCurrencySameAsSupplyContractCurrency();
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    pages.loanDatesRepayments.submit().click();

    // get loanId, go back to Deal page
    // assert that some inputted Loan data is displayed in the table
    partials.loanProgressNav.loanId().then((loanIdHiddenInput) => {
      const loanId = loanIdHiddenInput[0].value;

      pages.loanPreview.saveGoBackButton().click();
      cy.url().should('eq', relative(`/contract/${deal._id}`));

      const row = pages.contract.loansTransactionsTable.row(loanId);

      row.bankReferenceNumber().invoke('text').then((text) => {
        expect(text.trim()).equal(LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);
      });

      row.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      row.facilityValue().invoke('text').then((text) => {
        const expectedValue = `${deal.submissionDetails.supplyContractCurrency.id} ${LOAN_FORM_VALUES.FINANCIAL_DETAILS.facilityValue}`;

        expect(text.trim()).equal(expectedValue);
      });

      row.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).equal('Unconditional');
      });

      row.requestedCoverStartDate().invoke('text').then((text) => {
        const momentDate = moment().set({
          date: Number(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay),
          month: Number(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth) - 1, // months are zero indexed
          year: Number(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear),
        });

        expect(text.trim()).equal(momentDate.format('DD/MM/YYYY'));
      });

      row.coverEndDate().invoke('text').then((text) => {
        const expectedDate = `${LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear}`;
        expect(text.trim()).equal(expectedDate);
      });
    });
  });

  describe('when a user submits Loan forms without completing required fields', () => {
    it('loan should display all validation errors in `Loan Preview` page and `Incomplete` status in Deal page', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);
      pages.contract.addLoanButton().click();

      pages.loanGuaranteeDetails.submit().click();
      pages.loanFinancialDetails.submit().click();
      pages.loanDatesRepayments.submit().click();
      cy.url().should('include', '/preview');

      partials.errorSummary.errorSummaryLinks().should('have.length', 7);

      // get loanId, go back to Deal page
      // assert Loan status
      partials.loanProgressNav.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        pages.loanPreview.saveGoBackButton().click();
        cy.url().should('include', '/contract');
        cy.url().should('not.include', '/loan');

        const row = pages.contract.loansTransactionsTable.row(loanId);

        row.loanStatus().invoke('text').then((text) => {
          expect(text.trim()).equal('Incomplete');
        });
      });
    });
  });
});
