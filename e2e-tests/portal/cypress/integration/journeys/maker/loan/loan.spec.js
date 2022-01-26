const pages = require('../../../pages');
const partials = require('../../../partials');
const LOAN_FORM_VALUES = require('./loan-form-values');
const relative = require('../../../relativeURL');
const fillLoanForm = require('./fill-loan-forms');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const MOCK_DEAL = {
  bankInternalRefName: 'someDealId',
  additionalRefName: 'someDealName',
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

context('Add a Loan to a Deal', () => {
  let deal;

  beforeEach(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MOCK_DEAL, MAKER_LOGIN)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('should allow a user to create a Deal, pass Red Line and add a Loan to the deal', () => {
    cy.createADeal({
      username: MAKER_LOGIN.username,
      password: MAKER_LOGIN.password,
      bankDealId: MOCK_DEAL.bankInternalRefName,
      bankDealName: MOCK_DEAL.additionalRefName,
    });
    cy.addLoanToDeal();

    cy.url().should('include', '/check-your-answers');

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
    partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
      const loanId = loanIdHiddenInput[0].value;

      pages.loanPreview.saveGoBackButton().click();
      cy.url().should('eq', relative(`/contract/${deal._id}`));

      const row = pages.contract.loansTransactionsTable.row(loanId);

      row.nameLink().invoke('text').then((text) => {
        expect(text.trim()).equal(LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);
      });

      row.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      row.facilityValue().invoke('text').then((text) => {
        const expectedValue = `${deal.submissionDetails.supplyContractCurrency.id} ${LOAN_FORM_VALUES.FINANCIAL_DETAILS.value}`;

        expect(text.trim()).equal(expectedValue);
      });

      row.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).equal('Unconditional');
      });

      row.requestedCoverStartDate().invoke('text').then((text) => {
        const coverStartDate = `${LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear}`;

        expect(text.trim()).equal(coverStartDate);
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
      cy.url().should('include', '/check-your-answers');

      partials.errorSummary.errorSummaryLinks().should('have.length', 7);

      // get loanId, go back to Deal page
      // assert Loan status
      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
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
