const { createADeal } = require('../../missions');

const pages = require('../../pages');
const partials = require('../../partials');
// const relative = require('../../relativeURL');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    // TODO rename to bankSupplyContractID and bankSupplyContractName
    bankDealId: 'someDealId',
    bankDealName: 'someDealName',
  },
};

const BOND_DETAILS_FORM_VALUES = {
  bondIssuer: 'mock issuer',
  bondType: {
    value: 'maintenanceBond',
    text: 'Maintenance bond',
  },
  ukefGuaranteeInMonths: '12',
  bondBeneficiary: 'mock beneficiary',
};

const BOND_FINANCIAL_DETAILS_FORM_VALUES = {
  bondValue: '123',
  currency: {
    value: 'GBP',
    text: 'GBP - UK Sterling',
  },
  conversionRate: '100',
  conversionRateDateDay: '01',
  conversionRateDateMonth: '02',
  conversionRateDateYear: '2020',
  riskMarginFee: '20',
  coveredPercentage: '80',
  minimumRiskMarginFee: '1.23',
};

context('Add a bond', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    deal = createADeal({
      ...MOCK_DEAL.details,
      ...user,
    });
  });

  before(() => {
    cy.deleteAllDeals(user);
  });

  describe('When a user clicks `Add a Bond` from the deal page', () => {
    it('should progress to the `Bond Details` page', () => {
      cy.url().should('include', '/contract');

      pages.contract.addBondButton().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/details');
    });
  });

  describe('When a user completes the `Bond Details` form', () => {
    it('should progress to the `Bond Financial Details` page', () => {
      pages.contract.addBondButton().click();
      pages.bondDetails.bondIssuerInput().type(BOND_DETAILS_FORM_VALUES.bondIssuer);
      pages.bondDetails.bondTypeInput().select(BOND_DETAILS_FORM_VALUES.bondType.value);
      pages.bondDetails.bondStageUnissuedInput().click();
      pages.bondDetails.ukefGuaranteeInMonthsInput().type(BOND_DETAILS_FORM_VALUES.ukefGuaranteeInMonths);
      pages.bondDetails.bondBeneficiaryInput().type(BOND_DETAILS_FORM_VALUES.bondBeneficiary);
      pages.bondDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/financial-details');
    });
  });

  // TODO: bond details - when selected issued/unissued, correct form fields appear

  describe('When a user completes the `Bond Financial Details` form', () => {
    it('should progress to the bond `Fee Details` page', () => {
      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavBondFinancialDetails().click();
      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/financial-details');

      pages.bondFinancialDetails.bondValueInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.bondValue);
      pages.bondFinancialDetails.transactionCurrencySameAsSupplyContractCurrencyYesInput().click()
      pages.bondFinancialDetails.riskMarginFeeInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.riskMarginFee);
      pages.bondFinancialDetails.coveredPercentageInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.coveredPercentage);
      pages.bondFinancialDetails.minimumRiskMarginFeeInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.minimumRiskMarginFee);
      pages.bondFinancialDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/fee-details');
    });
  });

  // TODO: financial details - when selected yes/no currency, correct form fields appear
  // pages.bondFinancialDetails.currencyInput().select(BOND_FINANCIAL_DETAILS_FORM_VALUES.currency.value);
  // pages.bondFinancialDetails.conversionRateInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.conversionRate);
  // pages.bondFinancialDetails.conversionRateDateDayInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.conversionRateDateDay);
  // pages.bondFinancialDetails.conversionRateDateMonthInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.conversionRateDatMonth);
  // pages.bondFinancialDetails.conversionRateDateYearInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.conversionRateDateYear);


  // TODO: financial details - disabled inputs guaranteeFeePayableByBank and ukefExposure work as expected
  // functionality needs to be done first - assuming these get automatically populated

  describe('When a user completes the `Bond Fee Details` form', () => {
    it('should progress to the `Bond Preview` page', () => {
      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavBondFeeDetails().click();
      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/fee-details');

      pages.bondFeeDetails.feeTypeAtMaturityInput().click();
      pages.bondFeeDetails.feeFrequencyAnnuallyInput().click();
      pages.bondFeeDetails.dayCountBasis365Input().click();
      pages.bondFeeDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/preview');
    });
  });

  // TODO: preview page should be populated with submitted data
});
