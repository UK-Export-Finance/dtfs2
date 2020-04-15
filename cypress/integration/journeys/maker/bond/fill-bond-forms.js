const pages = require('../../../pages');
const BOND_FORM_VALUES = require('./bond-form-values');

const details = () => {
  pages.bondDetails.bondIssuerInput().type(BOND_FORM_VALUES.DETAILS.bondIssuer);
  pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
  pages.bondDetails.bondStageUnissuedInput().click();
  pages.bondDetails.ukefGuaranteeInMonthsInput().type(BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
  pages.bondDetails.bondBeneficiaryInput().type(BOND_FORM_VALUES.DETAILS.bondBeneficiary);
};

const financialDetails = () => {
  pages.bondFinancialDetails.bondValueInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.bondValue);
  pages.bondFinancialDetails.transactionCurrencySameAsSupplyContractCurrencyYesInput().click();
  pages.bondFinancialDetails.riskMarginFeeInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.riskMarginFee);
  pages.bondFinancialDetails.coveredPercentageInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
  pages.bondFinancialDetails.minimumRiskMarginFeeInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.minimumRiskMarginFee);
};

const feeDetails = () => {
  pages.bondFeeDetails.feeTypeAtMaturityInput().click();
  pages.bondFeeDetails.feeFrequencyAnnuallyInput().click();
  pages.bondFeeDetails.dayCountBasis365Input().click();
};

module.exports = {
  details,
  financialDetails,
  feeDetails,
};
