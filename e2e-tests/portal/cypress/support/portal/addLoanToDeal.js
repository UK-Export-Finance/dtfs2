const pages = require('../../e2e/pages');
const fillLoanForm = require('../../e2e/journeys/maker/loan/fill-loan-forms');

module.exports = () => {
  pages.contract.addLoanButton().click();
  fillLoanForm.unconditionalWithCurrencyNotTheSameAsSupplyContractCurrency();
  fillLoanForm.datesRepayments.inAdvanceAnnually();
  pages.loanDatesRepayments.submit().click();
};
