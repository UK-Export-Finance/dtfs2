const pages = require('../../integration/pages');
const fillLoanForm = require('../../integration/journeys/maker/loan/fill-loan-forms');

module.exports = () => {
  pages.contract.addLoanButton().click();
  fillLoanForm.unconditionalWithCurrencySameAsSupplyContractCurrency();
  fillLoanForm.datesRepayments.inAdvanceAnnually();
  pages.loanDatesRepayments.submit().click();
};
