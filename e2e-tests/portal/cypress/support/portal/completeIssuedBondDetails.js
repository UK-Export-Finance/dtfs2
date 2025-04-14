import { tomorrow, oneYear } from '../../../../e2e-fixtures/dateConstants';

const { bondDetails } = require('../../e2e/pages');
/**
 * Fills in the issued bond details form with predefined values.
 *
 * This function selects the bond type as 'Advance payment guarantee', sets the facility stage to 'Issued',
 * inputs the requested cover start date, cover end date, and a name, then submits the form.
 *
 */
const fillIssuedBondDetails = () => {
  bondDetails.bondTypeInput().select('Advance payment guarantee');
  bondDetails.facilityStageIssuedInput().click();
  cy.keyboardInput(bondDetails.requestedCoverStartDateDayInput(), tomorrow.day);
  cy.keyboardInput(bondDetails.requestedCoverStartDateMonthInput(), tomorrow.month);
  cy.keyboardInput(bondDetails.requestedCoverStartDateYearInput(), tomorrow.year);
  bondDetails.coverEndDateDayInput().type(oneYear.day);
  bondDetails.coverEndDateMonthInput().type(oneYear.month);
  bondDetails.coverEndDateYearInput().type(oneYear.year);
  cy.keyboardInput(bondDetails.nameInput(), '1234');
  cy.clickSubmitButton();
};

export { fillIssuedBondDetails };
