const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');
const BOND_FORM_VALUES = require('./bond-form-values');
const relative = require('../../../relativeURL');
const {
  calculateExpectedGuaranteeFee,
  calculateExpectedUkefExposure,
} = require('../../../../support/portal/sectionCalculations');

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

const goToBondFinancialDetailsPage = (deal) => {
  cy.loginGoToDealPage(MAKER_LOGIN, deal);

  pages.contract.addBondButton().click();
  partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
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
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MOCK_DEAL, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  describe('after submitting one form field and navigating back to `Bond Financial Details` page', () => {
    it('should render validation errors for all required fields', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);

      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');
      cy.title().should('eq', `Bond Financial Details${pages.defaults.pageTitleAppend}`);

      pages.bondFinancialDetails.minimumRiskMarginFeeInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.minimumRiskMarginFee);
      pages.bondFinancialDetails.submit().click();

      cy.url().should('include', '/fee-details');
      partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();

      const TOTAL_REQUIRED_FORM_FIELDS = 4;

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondFinancialDetails.facilityValueInputErrorMessage().should('be.visible');
      pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyInputErrorMessage().should('be.visible');
      pages.bondFinancialDetails.riskMarginFeeInputErrorMessage().should('be.visible');
      pages.bondFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');
    });
  });

  describe('when changing the `risk margin fee` field', () => {
    it('should dynamically update the `Guarantee Fee Payable By Bank` value on blur', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);

      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();

      let riskMarginFee = '20';
      pages.bondFinancialDetails.guaranteeFeePayableByBankInput().invoke('attr', 'placeholder').should('eq', '0');
      pages.bondFinancialDetails.riskMarginFeeInput().type(riskMarginFee).blur();
      pages.bondFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', calculateExpectedGuaranteeFee(riskMarginFee));

      pages.bondFinancialDetails.riskMarginFeeInput().clear();
      riskMarginFee = '9.09';
      pages.bondFinancialDetails.riskMarginFeeInput().type(riskMarginFee).blur();
      pages.bondFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', calculateExpectedGuaranteeFee(riskMarginFee));
    });
  });

  describe('when changing the `bond value` or `covered percentage` field', () => {
    it('should dynamically update the `UKEF exposure` value on blur', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);

      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();

      pages.bondFinancialDetails.ukefExposureInput().invoke('attr', 'placeholder').should('eq', '0.00');

      let facilityValue = '100';
      const coveredPercentage = '10';

      pages.bondFinancialDetails.facilityValueInput().type(facilityValue);
      pages.bondFinancialDetails.coveredPercentageInput().type(coveredPercentage).blur();

      pages.bondFinancialDetails.ukefExposureInput().should('have.value', calculateExpectedUkefExposure(facilityValue, coveredPercentage));

      pages.bondFinancialDetails.facilityValueInput().clear();

      facilityValue = '250';
      pages.bondFinancialDetails.facilityValueInput().type(facilityValue).blur();
      pages.bondFinancialDetails.ukefExposureInput().should('have.value', calculateExpectedUkefExposure(facilityValue, coveredPercentage));
    });
  });

  it('form submit of all required fields should render a checked checkbox only for `Bond Financial Details` in progress nav', () => {
    cy.loginGoToDealPage(MAKER_LOGIN, deal);

    pages.contract.addBondButton().click();
    partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();

    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();

    pages.bondFinancialDetails.submit().click();

    partials.bondProgressNav.progressNavBondFinancialDetailsCompletedCheckbox().should('be.visible');
    partials.bondProgressNav.progressNavBondFinancialDetailsCompletedCheckbox().should('be.checked');

    partials.bondProgressNav.progressNavBondDetailsCompletedCheckbox().should('not.be.visible');
    partials.bondProgressNav.progressNavBondFeeDetailsCompletedCheckbox().should('not.be.visible');
  });

  describe('When a user submits the `Bond Financial Details` form', () => {
    it('should progress to `Bond Fee Details` page and prepopulate form fields when returning back to `Bond Financial Details` page', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);

      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
      pages.bondFinancialDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/fee-details');

      partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      assertBondFormValues.financialDetails.currencySameAsSupplyContractCurrency();
    });
  });

  describe('when a user selects that the currency is NOT the same as the Supply Contract currency', () => {
    it('should render additional form fields', () => {
      goToBondFinancialDetailsPage(deal);
      pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyNoInput().click();

      pages.bondFinancialDetails.currencyInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateDateDayInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateDateMonthInput().should('be.visible');
      pages.bondFinancialDetails.conversionRateDateYearInput().should('be.visible');
    });

    it('form submit should progress to `Bond Fee Details` page and prepopulate submitted form fields when returning back to `Bond Financial Details` page', () => {
      goToBondFinancialDetailsPage(deal);
      fillBondForm.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();
      pages.bondFinancialDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/fee-details');

      partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      assertBondFormValues.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();
    });

    describe('after form submit and navigating back to `Bond Financal Details` page', () => {
      it('should render validation errors for required fields and `currency is NOT the same` required fields', () => {
        goToBondFinancialDetailsPage(deal);
        pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyNoInput().click();
        pages.bondFinancialDetails.submit().click();

        partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
        cy.url().should('include', '/financial-details');

        const TOTAL_REQUIRED_FORM_FIELDS = 6;

        partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

        pages.bondFinancialDetails.facilityValueInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.riskMarginFeeInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');

        pages.bondFinancialDetails.currencyInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.conversionRateInputErrorMessage().should('be.visible');
        pages.bondFinancialDetails.conversionRateDateInputErrorMessage().should('be.visible');
      });
    });

    it('should populate the bond\'s `value` in Deal page with the submitted bond currency', () => {
      goToBondFinancialDetailsPage(deal);

      pages.bondFinancialDetails.facilityValueInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.facilityValue);
      pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyNoInput().click();
      pages.bondFinancialDetails.currencyInput().select(BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value);

      // get bondId, go back to Deal page
      // assert that some inputted bond data is displayed in the table
      partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondFinancialDetails.submit().click();
        pages.bondFeeDetails.saveGoBackButton().click();
        cy.url().should('eq', relative(`/contract/${deal._id}`));

        const row = pages.contract.bondTransactionsTable.row(bondId);
        row.facilityValue().invoke('text').then((text) => {
          const expectedValue = `${BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value} ${BOND_FORM_VALUES.FINANCIAL_DETAILS.facilityValue}`;
          expect(text.trim()).equal(expectedValue);
        });
      });
    });
  });

  describe('after form submit and navigating back to `Bond Financal Details` page', () => {
    describe('when `risk margin fee` has an invalid value', () => {
      const fillAndSubmitRiskMarginFee = (value) => {
        pages.bondFinancialDetails.riskMarginFeeInput().clear();
        pages.bondFinancialDetails.riskMarginFeeInput().type(value);
        pages.bondFinancialDetails.submit().click();
      };

      const goBackToFinancialDetails = () => {
        partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
        cy.url().should('include', '/financial-details');
      };

      const assertValidationError = () => {
        partials.errorSummary.errorSummaryLinks().should('have.length', 1);
        pages.bondFinancialDetails.riskMarginFeeInputErrorMessage().should('be.visible');
      };

      it('should render validation error', () => {
        goToBondFinancialDetailsPage(deal);
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
        pages.bondFinancialDetails.coveredPercentageInput().type(value);
        pages.bondFinancialDetails.submit().click();
      };

      const goBackToFinancialDetails = () => {
        partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
        cy.url().should('include', '/financial-details');
      };

      it('should render validation error', () => {
        goToBondFinancialDetailsPage(deal);
        fillBondForm.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();

        fillAndSubmitCoveredPercentage('12.34567');
        goBackToFinancialDetails();

        partials.errorSummary.errorSummaryLinks().should('have.length', 1);
        pages.bondFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');
      });
    });
  });

  describe('when `minimum risk margin fee` has an invalid value', () => {
    const fillAndSubmitMinimumRiskMarginFee = (value) => {
      pages.bondFinancialDetails.minimumRiskMarginFeeInput().clear();
      pages.bondFinancialDetails.minimumRiskMarginFeeInput().type(value);
      pages.bondFinancialDetails.submit().click();
    };

    const goBackToFinancialDetails = () => {
      partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');
    };

    it('should render validation error', () => {
      goToBondFinancialDetailsPage(deal);
      fillBondForm.financialDetails.transactionCurrencyNotTheSameAsSupplyContractCurrency();

      fillAndSubmitMinimumRiskMarginFee('12.345');
      goBackToFinancialDetails();

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);
      pages.bondFinancialDetails.minimumRiskMarginFeeInputErrorMessage().should('be.visible');
    });
  });

  describe('When a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Bond Financial Details` page', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);

      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();

      partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondFinancialDetails.saveGoBackButton().click();

        cy.url().should('not.include', '/financial-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumberLink().click();
        partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
        cy.url().should('include', '/financial-details');

        assertBondFormValues.financialDetails.currencySameAsSupplyContractCurrency();
      });
    });
  });
});
