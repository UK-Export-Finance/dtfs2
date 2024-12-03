const pages = require('../../pages');
const BOND_FORM_VALUES = require('./bond-form-values');

// fill fields specific to the scenario - issued/unissued
const details = {
  facilityStageIssued: () => {
    cy.keyboardInput(pages.bondDetails.bondIssuerInput(), BOND_FORM_VALUES.DETAILS.bondIssuer);
    pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
    pages.bondDetails.facilityStageIssuedInput().click();

    cy.completeDateFormFields({
      idPrefix: 'requestedCoverStartDate',
      day: BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay,
      month: BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth,
      year: BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear,
    });

    cy.completeDateFormFields({
      idPrefix: 'coverEndDate',
      day: BOND_FORM_VALUES.DETAILS.coverEndDateDay,
      month: BOND_FORM_VALUES.DETAILS.coverEndDateMonth,
      year: BOND_FORM_VALUES.DETAILS.coverEndDateYear,
    });

    cy.keyboardInput(pages.bondDetails.nameInput(), BOND_FORM_VALUES.DETAILS.name);
    cy.keyboardInput(pages.bondDetails.bondBeneficiaryInput(), BOND_FORM_VALUES.DETAILS.bondBeneficiary);
  },
  facilityStageUnissued: () => {
    pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
    pages.bondDetails.facilityStageUnissuedInput().click();
    cy.keyboardInput(pages.bondDetails.ukefGuaranteeInMonthsInput(), BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
  },
};

const financialDetails = {
  currencySameAsSupplyContractCurrency: () => {
    cy.keyboardInput(pages.bondFinancialDetails.facilityValueInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.value);
    pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
    cy.keyboardInput(pages.bondFinancialDetails.riskMarginFeeInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.riskMarginFee);
    cy.keyboardInput(pages.bondFinancialDetails.coveredPercentageInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    cy.keyboardInput(pages.bondFinancialDetails.minimumRiskMarginFeeInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.minimumRiskMarginFee);
  },
  transactionCurrencyNotTheSameAsSupplyContractCurrency: () => {
    cy.keyboardInput(pages.bondFinancialDetails.facilityValueInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.value);
    pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyNoInput().click();
    pages.bondFinancialDetails.currencyInput().select(BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value);
    cy.keyboardInput(pages.bondFinancialDetails.conversionRateInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRate);

    cy.completeDateFormFields({
      idPrefix: 'conversionRateDate',
      day: BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateDay,
      month: BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateMonth,
      year: BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateYear,
    });

    cy.keyboardInput(pages.bondFinancialDetails.riskMarginFeeInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.riskMarginFee);
    cy.keyboardInput(pages.bondFinancialDetails.coveredPercentageInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    cy.keyboardInput(pages.bondFinancialDetails.minimumRiskMarginFeeInput(), BOND_FORM_VALUES.FINANCIAL_DETAILS.minimumRiskMarginFee);
  },
};

const feeDetails = () => {
  pages.bondFeeDetails.feeTypeInAdvanceInput().click();
  pages.bondFeeDetails.feeFrequencyAnnuallyInput().click();
  pages.bondFeeDetails.dayCountBasis365Input().click();
};

module.exports = {
  details,
  financialDetails,
  feeDetails,
};
