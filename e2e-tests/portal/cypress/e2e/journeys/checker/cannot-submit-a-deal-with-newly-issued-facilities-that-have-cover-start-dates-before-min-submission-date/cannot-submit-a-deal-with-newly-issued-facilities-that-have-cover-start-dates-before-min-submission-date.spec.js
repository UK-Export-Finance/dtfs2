const { contractConfirmSubmission, contract, bondDetails, dashboardDeals } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { today, yesterday } = require('../../../../../../e2e-fixtures/dateConstants');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context(
  'Maker cannot submit a deal to checker when facility has cover start dates before the MIN submission date" (should see validation errors, submit button should not exist)',
  () => {
    before(() => {
      cy.deleteDeals(ADMIN);

      cy.createBssEwcsDeal();
    });

    it('should display a validation error', () => {
      cy.login(BANK1_MAKER1);

      dashboardDeals.rowByIndex(0).link().click();

      // complete "bond details"
      contract.addBondButton().click();
      bondDetails.bondTypeInput().select('Advance payment guarantee');
      bondDetails.facilityStageIssuedInput().click();
      bondDetails.requestedCoverStartDateDayInput().type(yesterday.day);
      bondDetails.requestedCoverStartDateMonthInput().type(yesterday.month);
      bondDetails.requestedCoverStartDateYearInput().type(yesterday.year);
      bondDetails.coverEndDateDayInput().type(today.day);
      bondDetails.coverEndDateMonthInput().type(today.month);
      bondDetails.coverEndDateYearInput().type(today.year);
      bondDetails.nameInput().type('1234');

      cy.clickSubmitButton();
      bondDetails.bondDetails().click();

      const expectedError = 'Requested Cover Start Date must be on the application submission date or in the future';
      contractConfirmSubmission.expectError(expectedError);

      cy.clickSaveGoBackButton();
    });

    describe('when going back to the deal page', () => {
      it('should not exist `proceed to submit` button', () => {
        contract.proceedToSubmit().should('not.exist');
      });
    });
  },
);
