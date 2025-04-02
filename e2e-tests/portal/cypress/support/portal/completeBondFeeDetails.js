const { bondFeeDetails } = require('../../e2e/pages');
/**
 * Fills in the bond fee details form by selecting the fee type at maturity,
 * setting the day count basis to 365, and then saving the form.
 */
const fillBondFeeDetails = () => {
  bondFeeDetails.feeTypeAtMaturityInput().click();
  bondFeeDetails.dayCountBasis365Input().click();
  cy.clickSaveGoBackButton();
};

export { fillBondFeeDetails };
