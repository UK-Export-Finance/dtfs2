const { bondDetails } = require('../../e2e/pages');
/**
 * Fills in the details for an unissued bond in the portal.
 *
 * This function selects the bond type as 'Advance payment guarantee',
 * sets the facility stage to 'Unissued', inputs '12' months for the UKEF guarantee,
 * and then submits the form.
 */
const fillUnissuedBondDetails = () => {
  bondDetails.bondTypeInput().select('Advance payment guarantee');
  bondDetails.facilityStageUnissuedInput().click();
  cy.keyboardInput(bondDetails.ukefGuaranteeInMonthsInput(), '12');
  cy.clickSubmitButton();
};

export { fillUnissuedBondDetails };
