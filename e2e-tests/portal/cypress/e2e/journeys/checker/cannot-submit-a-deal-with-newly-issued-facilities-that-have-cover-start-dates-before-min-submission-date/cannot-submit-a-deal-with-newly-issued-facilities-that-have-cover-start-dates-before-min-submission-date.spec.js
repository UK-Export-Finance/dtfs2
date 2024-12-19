import { add } from 'date-fns';

const { contractConfirmSubmission, contract, bondDetails, dashboardDeals } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

const tomorrow = add(new Date(), { days: 1 });
const startDate = {
  day: tomorrow.getDate(),
  month: tomorrow.getMonth(),
  year: tomorrow.getFullYear(),
};

const endDate = {
  day: tomorrow.getDate(),
  month: tomorrow.getMonth(),
  year: tomorrow.getFullYear() + 1,
};

// DTFS2-2839
context(
  'Maker cannot submit a deal to checker when facility has cover start dates before the MIN submission date" (should see validation errors, submit button should not exist)',
  () => {
    before(() => {
      cy.deleteDeals(ADMIN);

      cy.createBssEwcsDeal({});
    });

    it('should display a validation error', () => {
      cy.login(BANK1_MAKER1);

      dashboardDeals.rowIndex.link().click();

      // complete "bond details"
      contract.addBondButton().click();
      bondDetails.bondTypeInput().select('Advance payment guarantee');
      bondDetails.facilityStageIssuedInput().click();
      bondDetails.requestedCoverStartDateDayInput().type(startDate.day);
      bondDetails.requestedCoverStartDateMonthInput().type(startDate.month);
      bondDetails.requestedCoverStartDateYearInput().type(startDate.year);
      bondDetails.coverEndDateDayInput().type(endDate.day);
      bondDetails.coverEndDateMonthInput().type(endDate.month);
      bondDetails.coverEndDateYearInput().type(endDate.year);
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
