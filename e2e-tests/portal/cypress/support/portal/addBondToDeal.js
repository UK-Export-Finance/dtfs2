const pages = require('../../integration/pages');
const fillBondForm = require('../../integration/journeys/maker/bond/fill-bond-forms');

module.exports = () => {
  pages.contract.addBondButton().click();

  fillBondForm.details.facilityStageIssued();
  pages.bondDetails.submit().click();

  fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
  pages.bondFinancialDetails.submit().click();

  fillBondForm.feeDetails();
  pages.bondFeeDetails.submit().click();
}
