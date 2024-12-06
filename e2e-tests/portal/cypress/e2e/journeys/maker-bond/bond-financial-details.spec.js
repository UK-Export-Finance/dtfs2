const pages = require('../../pages');
const partials = require('../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');
const BOND_FORM_VALUES = require('./bond-form-values');
const { calculateExpectedGuaranteeFee, calculateExpectedUkefExposure } = require('../../../support/portal/sectionCalculations');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { yearWithZeroLetter } = require('../../../../../e2e-fixtures/dateConstants');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

const goToBondFinancialDetailsPage = () => {
  cy.loginGoToDealPage(BANK1_MAKER1);

  cy.clickAddBondButton();
  partials.taskListHeader.itemLink('financial-details').click();
  cy.url().should('include', '/contract');
  cy.url().should('include', '/bond/');
  cy.url().should('include', '/financial-details');
};

context('Bond Financial Details', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({});
  });

  describe('after submitting one form field and navigating back to `Bond Financial Details` page', () => {
    it('should render validation errors for all required fields', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();
      partials.taskListHeader.itemLink('financial-details').click();
      cy.url().should('include', '/financial-details');
      cy.title().should('eq', `Bond Financial Details${pages.defaults.pageTitleAppend}`);

      cy.keyboardInput(pages.bondFinancialDetails.minimumRiskMarginFeeInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.minimumRiskMarginFee);

      cy.clickSubmitButton();

      cy.url().should('include', '/fee-details');
      partials.taskListHeader.itemLink('financial-details').click();

      const TOTAL_REQUIRED_FORM_FIELDS = 4;

      partials.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondFinancialDetails.facilityValueInputErrorMessage().should('be.visible');
      pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyInputErrorMessage().should('be.visible');
      pages.bondFinancialDetails.riskMarginFeeInputErrorMessage().should('be.visible');
      pages.bondFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');
    });
  });

  describe('when changing the `risk margin fee` field', () => {
    it('should dynamically update the `Guarantee Fee Payable By Bank` value on blur', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();
      partials.taskListHeader.itemLink('financial-details').click();

      let riskMarginFee = '20';
      pages.bondFinancialDetails.guaranteeFeePayableByBankInput().invoke('attr', 'placeholder').should('eq', '0');

      cy.keyboardInput(pages.bondFinancialDetails.riskMarginFeeInput(), riskMarginFee);

      pages.bondFinancialDetails.riskMarginFeeInput().blur();

      pages.bondFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', calculateExpectedGuaranteeFee(riskMarginFee));

      pages.bondFinancialDetails.riskMarginFeeInput().clear();
      riskMarginFee = '9.09';

      cy.keyboardInput(pages.bondFinancialDetails.riskMarginFeeInput(), riskMarginFee);

      pages.bondFinancialDetails.riskMarginFeeInput().blur();

      pages.bondFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', calculateExpectedGuaranteeFee(riskMarginFee));
    });
  });

  describe('when changing the `bond value` or `covered percentage` field', () => {
    it('should dynamically update the `UKEF exposure` value on blur', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();
      partials.taskListHeader.itemLink('financial-details').click();

      pages.bondFinancialDetails.ukefExposureInput().invoke('attr', 'placeholder').should('eq', '0.00');

      let value = '100';
      const coveredPercentage = '10';

      cy.keyboardInput(pages.bondFinancialDetails.facilityValueInput(), value);
      cy.keyboardInput(pages.bondFinancialDetails.coveredPercentageInput(), coveredPercentage);

      pages.bondFinancialDetails.coveredPercentageInput().blur();

      pages.bondFinancialDetails.ukefExposureInput().should('have.value', calculateExpectedUkefExposure(value, coveredPercentage));

      pages.bondFinancialDetails.facilityValueInput().clear();

      value = '250';
      cy.keyboardInput(pages.bondFinancialDetails.facilityValueInput(), value);

      pages.bondFinancialDetails.facilityValueInput().blur();

      pages.bondFinancialDetails.ukefExposureInput().should('have.value', calculateExpectedUkefExposure(value, coveredPercentage));
    });
  });

  it('should display the correct title for bond financial details', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    cy.clickAddBondButton();
    partials.taskListHeader.itemLink('financial-details').click();

    pages.bondFinancialDetails.title().contains('Add financial details');
  });

  it('form submit of all required fields should render a `completed` status tag only for `Bond Financial Details` in task list header', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    cy.clickAddBondButton();
    partials.taskListHeader.itemLink('financial-details').click();

    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();

    cy.clickSubmitButton();

    cy.assertText(partials.taskListHeader.itemStatus('financial-details'), 'Completed');
    cy.assertText(partials.taskListHeader.itemStatus('bond-details'), 'Incomplete');
    cy.assertText(partials.taskListHeader.itemStatus('fee-details'), 'Incomplete');
  });

  describe('When a user submits the `Bond Financial Details` form', () => {
    it('should progress to `Bond Fee Details` page and prepopulate form fields when returning back to `Bond Financial Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();
      partials.taskListHeader.itemLink('financial-details').click();
      cy.url().should('include', '/financial-details');

      fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
      cy.clickSubmitButton();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/fee-details');

      partials.taskListHeader.itemLink('financial-details').click();
      cy.url().should('include', '/financial-details');

      assertBondFormValues.financialDetails.currencySameAsSupplyContractCurrency();
    });
  });

  describe('when a user selects that the currency is NOT the same as the Supply Contract currency', () => {
    it('should render additional form fields', () => {
      goToBondFinancialDetailsPage();
      pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyNoInput().click();

      pages.bondFinancialDetails.currencyInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateDateDayInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateDateMonthInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateDateYearInput().should('be.visible');
    });

    it('form submit should progress to `Bond Fee Details` page and prepopulate submitted form fields when returning back to `Bond Financial Details` page', () => {
      goToBondFinancialDetailsPage();
      fillBondForm.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();
      cy.clickSubmitButton();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/fee-details');

      partials.taskListHeader.itemLink('financial-details').click();
      cy.url().should('include', '/financial-details');

      assertBondFormValues.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();
    });

    describe('after form submit and navigating back to `Bond Financial Details` page', () => {
      it('should render validation errors for required fields and `currency is NOT the same` required fields', () => {
        goToBondFinancialDetailsPage();
        pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyNoInput().click();
        cy.clickSubmitButton();

        partials.taskListHeader.itemLink('financial-details').click();
        cy.url().should('include', '/financial-details');

        const TOTAL_REQUIRED_FORM_FIELDS = 6;

        partials.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

        pages.bondFinancialDetails.facilityValueInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.riskMarginFeeInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');

        pages.bondFinancialDetails.currencyInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.conversionRateInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.conversionRateDateInputErrorMessage().should('be.visible');

        cy.completeDateFormFields({ idPrefix: 'conversionRateDate', day: '22-', month: '02', year: '2022' });

        cy.clickSubmitButton();
        partials.taskListHeader.itemLink('financial-details').click();
        pages.bondFinancialDetails.conversionRateDateInputErrorMessage().contains('The day for the conversion rate must include 1 or 2 numbers');

        cy.completeDateFormFields({ idPrefix: 'conversionRateDate', day: '22', month: '022', year: null });

        cy.clickSubmitButton();
        partials.taskListHeader.itemLink('financial-details').click();
        pages.bondFinancialDetails.conversionRateDateInputErrorMessage().contains('The month for the conversion rate must include 1 or 2 numbers');

        cy.completeDateFormFields({ idPrefix: 'conversionRateDate', day: '22', month: '02', year: yearWithZeroLetter });

        cy.clickSubmitButton();
        partials.taskListHeader.itemLink('financial-details').click();
        pages.bondFinancialDetails.conversionRateDateInputErrorMessage().contains('The year for the conversion rate must include 4 numbers');
      });
    });

    it("should populate the bond's `value` in Deal page with the submitted bond currency", () => {
      goToBondFinancialDetailsPage();

      cy.keyboardInput(pages.bondFinancialDetails.facilityValueInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.value);
      pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyNoInput().click();
      pages.bondFinancialDetails.currencyInput().select(BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value);

      // get bondId, go back to Deal page
      // assert that some inputted bond data is displayed in the table
      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        cy.clickSubmitButton();
        cy.clickSaveGoBackButton();
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        cy.assertText(row.facilityValue(), `${BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value} ${BOND_FORM_VALUES.FINANCIAL_DETAILS.value}`);
      });
    });
  });

  describe('after form submit and navigating back to `Bond Financial Details` page', () => {
    describe('when `risk margin fee` has an invalid value', () => {
      const fillAndSubmitRiskMarginFee = (value) => {
        pages.bondFinancialDetails.riskMarginFeeInput().clear();
        cy.keyboardInput(pages.bondFinancialDetails.riskMarginFeeInput(), value);
        cy.clickSubmitButton();
      };

      const goBackToFinancialDetails = () => {
        partials.taskListHeader.itemLink('financial-details').click();
        cy.url().should('include', '/financial-details');
      };

      const assertValidationError = () => {
        partials.errorSummaryLinks().should('have.length', 1);
        pages.bondFinancialDetails.riskMarginFeeInputErrorMessage().should('be.visible');
      };

      it('should render validation error', () => {
        goToBondFinancialDetailsPage();
        fillBondForm.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();

        fillAndSubmitRiskMarginFee('test');
        goBackToFinancialDetails();
        assertValidationError();

        fillAndSubmitRiskMarginFee('-1');
        goBackToFinancialDetails();
        assertValidationError();

        fillAndSubmitRiskMarginFee('100');
        goBackToFinancialDetails();
        assertValidationError();

        fillAndSubmitRiskMarginFee('80.12345');
        goBackToFinancialDetails();
        assertValidationError();
      });
    });

    describe('when `covered percentage` has an invalid value', () => {
      const fillAndSubmitCoveredPercentage = (value) => {
        pages.bondFinancialDetails.coveredPercentageInput().clear();
        cy.keyboardInput(pages.bondFinancialDetails.coveredPercentageInput(), value);
        cy.clickSubmitButton();
      };

      const goBackToFinancialDetails = () => {
        partials.taskListHeader.itemLink('financial-details').click();
        cy.url().should('include', '/financial-details');
      };

      it('should render validation error', () => {
        goToBondFinancialDetailsPage();
        fillBondForm.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();

        fillAndSubmitCoveredPercentage('12.34567');
        goBackToFinancialDetails();

        partials.errorSummaryLinks().should('have.length', 1);
        pages.bondFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');
      });
    });
  });

  describe('when `minimum risk margin fee` has an invalid value', () => {
    const fillAndSubmitMinimumRiskMarginFee = (value) => {
      pages.bondFinancialDetails.minimumRiskMarginFeeInput().clear();
      cy.keyboardInput(pages.bondFinancialDetails.minimumRiskMarginFeeInput(), value);
      cy.clickSubmitButton();
    };

    const goBackToFinancialDetails = () => {
      partials.taskListHeader.itemLink('financial-details').click();
      cy.url().should('include', '/financial-details');
    };

    it('should render validation error', () => {
      goToBondFinancialDetailsPage();
      fillBondForm.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();

      fillAndSubmitMinimumRiskMarginFee('12.345');
      goBackToFinancialDetails();

      partials.errorSummaryLinks().should('have.length', 1);
      pages.bondFinancialDetails.minimumRiskMarginFeeInputErrorMessage().should('be.visible');
    });
  });

  describe('When a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and repopulate form fields when returning back to `Bond Financial Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();
      partials.taskListHeader.itemLink('financial-details').click();
      cy.url().should('include', '/financial-details');

      fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();

      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        cy.clickSaveGoBackButton();

        cy.url().should('not.include', '/financial-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumberLink().click();
        partials.taskListHeader.itemLink('financial-details').click();
        cy.url().should('include', '/financial-details');

        assertBondFormValues.financialDetails.currencySameAsSupplyContractCurrency();
      });
    });
  });
});
