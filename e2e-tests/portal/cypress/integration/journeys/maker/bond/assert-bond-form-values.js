const pages = require('../../../pages');
const BOND_FORM_VALUES = require('./bond-form-values');

const details = {
  unissued: () => {
    pages.bondDetails.facilityStageUnissuedInput().should('be.checked');
    pages.bondDetails.bondIssuerInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondIssuer);
    pages.bondDetails.bondTypeInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondType.value);
    pages.bondDetails.ukefGuaranteeInMonthsInput().should('have.value', BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
    pages.bondDetails.bondBeneficiaryInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondBeneficiary);
  },
  issued: () => {
    pages.bondDetails.bondIssuerInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondIssuer);
    pages.bondDetails.bondTypeInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondType.value);
    pages.bondDetails.facilityStageIssuedInput().should('be.checked');
    pages.bondDetails.requestedCoverStartDateDayInput().should('have.value', BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay);
    pages.bondDetails.requestedCoverStartDateMonthInput().should('have.value', BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth);
    pages.bondDetails.requestedCoverStartDateYearInput().should('have.value', BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear);
    pages.bondDetails.coverEndDateDayInput().should('have.value', BOND_FORM_VALUES.DETAILS.coverEndDateDay);
    pages.bondDetails.coverEndDateMonthInput().should('have.value', BOND_FORM_VALUES.DETAILS.coverEndDateMonth);
    pages.bondDetails.coverEndDateYearInput().should('have.value', BOND_FORM_VALUES.DETAILS.coverEndDateYear);
    pages.bondDetails.nameInput().should('have.value', BOND_FORM_VALUES.DETAILS.name);
    pages.bondDetails.bondBeneficiaryInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondBeneficiary);
  },
};

const financialDetails = {
  currencySameAsSupplyContractCurrency: () => {
    pages.bondFinancialDetails.facilityValueInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.valueFormatted);
    pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().should('be.checked');
    pages.bondFinancialDetails.riskMarginFeeInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.riskMarginFee);
    pages.bondFinancialDetails.coveredPercentageInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    pages.bondFinancialDetails.minimumRiskMarginFeeInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.minimumRiskMarginFee);
    pages.bondFinancialDetails.ukefExposureInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.ukefExposure);
    pages.bondFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.guaranteeFeePayableByBank);
  },
  transactionCurrencyNotTheSameAsSupplyContractCurrency: () => {
    pages.bondFinancialDetails.facilityValueInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.valueFormatted);
    pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyNoInput().should('be.checked');
    pages.bondFinancialDetails.currencyInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value);
    pages.bondFinancialDetails.conversionRateInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRate);
    pages.bondFinancialDetails.conversionRateDateDayInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateDay);
    pages.bondFinancialDetails.conversionRateDateMonthInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateMonth);
    pages.bondFinancialDetails.conversionRateDateYearInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateYear);
    pages.bondFinancialDetails.riskMarginFeeInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.riskMarginFee);
    pages.bondFinancialDetails.coveredPercentageInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    pages.bondFinancialDetails.minimumRiskMarginFeeInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.minimumRiskMarginFee);
    pages.bondFinancialDetails.ukefExposureInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.ukefExposure);
    pages.bondFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', BOND_FORM_VALUES.FINANCIAL_DETAILS.guaranteeFeePayableByBank);
  },
};

const feeDetails = () => {
  pages.bondFeeDetails.feeTypeInAdvanceInput().should('be.checked');
  pages.bondFeeDetails.feeFrequencyAnnuallyInput().should('be.checked');
  pages.bondFeeDetails.dayCountBasis365Input().should('be.checked');
};

module.exports = {
  details,
  financialDetails,
  feeDetails,
};
