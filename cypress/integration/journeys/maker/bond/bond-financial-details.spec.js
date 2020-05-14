const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');
const BOND_FORM_VALUES = require('./bond-form-values');
const relative = require('../../../relativeURL');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

const goToBondFinancialDetailsPage = (deal) => {
  cy.loginGoToDealPage(user, deal);

  pages.contract.addBondButton().click();
  partials.bondProgressNav.progressNavBondFinancialDetails().click();
  cy.url().should('include', '/contract');
  cy.url().should('include', '/bond/');
  cy.url().should('include', '/financial-details');
};

context('Bond Financial Details', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user)
      .then( insertedDeal => deal=insertedDeal );
  });

  describe('after submitting one form field and navigating back to `Bond Financial Details` page', () => {
    it('should display validation errors for all required fields', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      pages.bondFinancialDetails.minimumRiskMarginFeeInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.minimumRiskMarginFee);
      pages.bondFinancialDetails.submit().click();

      cy.url().should('include', '/fee-details');
      partials.bondProgressNav.progressNavBondFinancialDetails().click();

      const TOTAL_REQUIRED_FORM_FIELDS = 4;

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondFinancialDetails.bondValueInputErrorMessage().should('be.visible');
      pages.bondFinancialDetails.transactionCurrencySameAsSupplyContractCurrencyInputErrorMessage().should('be.visible');
      pages.bondFinancialDetails.riskMarginFeeInputErrorMessage().should('be.visible');
      pages.bondFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');
    });
  });

  it('form submit of all required fields should display a checked `Bond Financial Details` checkbox in progress nav', () => {
    cy.loginGoToDealPage(user, deal);

    pages.contract.addBondButton().click();
    partials.bondProgressNav.progressNavBondFinancialDetails().click();

    fillBondForm.financialDetails.transactionCurrencySameAsSupplyContractCurrency();

    pages.bondFinancialDetails.submit().click();

    partials.bondProgressNav.progressNavBondFinancialDetailsCompletedCheckbox().should('be.visible');
    partials.bondProgressNav.progressNavBondFinancialDetailsCompletedCheckbox().should('be.checked');
  });

  describe('When a user submits the `Bond Financial Details` form', () => {
    it('should progress to `Bond Fee Details` page and prepopulate submitted form fields when returning back to `Bond Financial Details` page', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      fillBondForm.financialDetails.transactionCurrencySameAsSupplyContractCurrency();
      pages.bondFinancialDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/fee-details');

      partials.bondProgressNav.progressNavBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      assertBondFormValues.financialDetails.transactionCurrencySameAsSupplyContractCurrency();
    });
  });

  describe('when a user selects that the currency is NOT the same as the Supply Contract currency', () => {
    it('should render additional form fields and display validation errors without submit', () => {
      goToBondFinancialDetailsPage(deal);
      pages.bondFinancialDetails.transactionCurrencySameAsSupplyContractCurrencyNoInput().click();

      pages.bondFinancialDetails.currencyInput().should('be.visible');
      pages.bondFinancialDetails.currencyInputErrorMessage().should('be.visible');

      pages.bondFinancialDetails.conversionRateInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateInputErrorMessage().should('be.visible');

      pages.bondFinancialDetails.conversionRateDateDayInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateDateMonthInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateDateYearInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateDateInputErrorMessage().should('be.visible');
    });

    it('form submit should progress to `Bond Fee Details` page and prepopulate submitted form fields when returning back to `Bond Financial Details` page', () => {
      goToBondFinancialDetailsPage(deal);
      fillBondForm.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();
      pages.bondFinancialDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/fee-details');

      partials.bondProgressNav.progressNavBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      assertBondFormValues.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();
    });

    describe('after form submit and navigating back to `Bond Financal Details` page', () => {
      it('should display validation errors for required fields and `currency is NOT the same` required fields', () => {
        goToBondFinancialDetailsPage(deal);
        pages.bondFinancialDetails.transactionCurrencySameAsSupplyContractCurrencyNoInput().click();
        pages.bondFinancialDetails.submit().click();

        partials.bondProgressNav.progressNavBondFinancialDetails().click();
        cy.url().should('include', '/financial-details');

        const TOTAL_REQUIRED_FORM_FIELDS = 6;

        partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

        pages.bondFinancialDetails.bondValueInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.riskMarginFeeInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');

        pages.bondFinancialDetails.currencyInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.conversionRateInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.conversionRateDateInputErrorMessage().should('be.visible');
      });
    });

    it('should render additional submitted form field values in `Bond Preview` page', () => {
      goToBondFinancialDetailsPage(deal);

      pages.bondFinancialDetails.transactionCurrencySameAsSupplyContractCurrencyNoInput().click();

      fillBondForm.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();

      pages.bondFinancialDetails.submit().click();

      cy.url().should('include', '/fee-details');
      pages.bondFeeDetails.submit().click();
      cy.url().should('include', '/preview');

      pages.bondPreview.currency().invoke('text').then((text) => {
        expect(text.trim()).equal(BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.text);
      });

      pages.bondPreview.conversionRate().invoke('text').then((text) => {
        expect(text.trim()).equal(BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRate);
      });

      pages.bondPreview.conversionRateDate().invoke('text').then((text) => {
        const {
          conversionRateDateDay,
          conversionRateDateMonth,
          conversionRateDateYear,
        } = BOND_FORM_VALUES.FINANCIAL_DETAILS;

        const expected = `${conversionRateDateDay}/${conversionRateDateMonth}/${conversionRateDateYear}`;
        expect(text.trim()).equal(expected);
      });
    });

    it('should populate the bond\'s `value` in Deal page with the submitted bond currency', () => {
      goToBondFinancialDetailsPage(deal);

      pages.bondFinancialDetails.bondValueInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.bondValue);
      pages.bondFinancialDetails.transactionCurrencySameAsSupplyContractCurrencyNoInput().click();
      pages.bondFinancialDetails.currencyInput().select(BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value);

      // get bondId, go back to Deal page
      // assert that some inputted bond data is displayed in the table
      partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondFinancialDetails.submit().click();
        pages.bondFeeDetails.saveGoBackButton().click();
        cy.url().should('eq', relative(`/contract/${deal._id}`));

        const row = pages.contract.bondTransactionsTable.row(bondId);
        row.bondValue().invoke('text').then((text) => {
          const expectedValue = `${BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value} ${BOND_FORM_VALUES.FINANCIAL_DETAILS.bondValue}`;
          expect(text.trim()).equal(expectedValue);
        });
      });
    });
  });

  describe('When a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Bond Financial Details` page', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      fillBondForm.financialDetails.transactionCurrencySameAsSupplyContractCurrency();

      partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondFinancialDetails.saveGoBackButton().click();

        cy.url().should('not.include', '/financial-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumber().click();
        partials.bondProgressNav.progressNavBondFinancialDetails().click();
        cy.url().should('include', '/financial-details');

        assertBondFormValues.financialDetails.transactionCurrencySameAsSupplyContractCurrency();
      });
    });
  });

  // TODO: disabled inputs guaranteeFeePayableByBank and ukefExposure work as expected
  // functionality needs to be done first - assuming these get automatically populated
});
