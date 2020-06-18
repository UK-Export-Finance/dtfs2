const pages = require('../../../pages');
const partials = require('../../../partials');
const LOAN_FORM_VALUES = require('./loan-form-values');
const fillLoanForm = require('./fill-loan-forms');
const relative = require('../../../relativeURL');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
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
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user)
      .then((insertedDeal) => deal = insertedDeal);
  });

  // TODO when all Loan pages completed
  // it('should allow a user to create a Deal, pass Red Line and add a Bond to the deal', () => {
  // });

  // TODO when all Loan pages completed
  /*
  describe('when a user submits a Loan form without completing any fields', () => {
    it('loan should display `Incomplete` status in Deal page', () => {
    });

    // describe('after viewing the `Loan Preview` page', () => {
    //   it('should display validation errors in all other  pages', () => {
    //   });
    // });
  });
  */


  // TODO
  // - update when all Loan pages completed
  // - add: display `Completed` status
  describe('When a user submits all required Loan form fields (Unconditional facilityStage, currency same as Supply Contract Currency)', () => {
    it('should populate Deal page with the submitted loan and link to `Loan Gurantee Details` page', () => {

      cy.loginGoToDealPage(user, deal);
      pages.contract.addLoanButton().click();

      // TODO...
      // cy.addLoanToDeal();

      fillLoanForm.guaranteeDetails.facilityStageUnconditional();
      pages.loanGuaranteeDetails.submit().click();
      fillLoanForm.financialDetails.currencySameAsSupplyContractCurrency();
      pages.loanFinancialDetails.submit().click();

      pages.loanDatesRepayments.submit().click();

      cy.url().should('include', '/loan');
      cy.url().should('include', '/preview');

      // get bondId, go back to Deal page
      // assert that some inputted Bond data is displayed in the table
      partials.loanProgressNav.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        pages.loanPreview.saveGoBackButton().click();
        cy.url().should('eq', relative(`/contract/${deal._id}`));

        const row = pages.contract.loansTransactionsTable.row(loanId);

        // TODO: test for bankReferenceNumber as 'Not entered'
        // (from the specifc loan input page)

        row.bankReferenceNumber().invoke('text').then((text) => {
          expect(text.trim()).equal(LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);
        });

        // TODO
        // row.loanStatus().invoke('text').then((text) => {
        // });

        row.facilityValue().invoke('text').then((text) => {
          const expectedValue = `${deal.supplyContractCurrency.id} ${LOAN_FORM_VALUES.FINANCIAL_DETAILS.facilityValue}`;

          expect(text.trim()).equal(expectedValue);
        });

        row.facilityStage().invoke('text').then((text) => {
          expect(text.trim()).equal('Unconditional');
        });

        row.requestedCoverStartDate().invoke('text').then((text) => {
          const expectedDate = `${LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear}`;
          expect(text.trim()).equal(expectedDate);
        });

        row.coverEndDate().invoke('text').then((text) => {
          const expectedDate = `${LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear}`;
          expect(text.trim()).equal(expectedDate);
        });
      });
    });
  });
});
