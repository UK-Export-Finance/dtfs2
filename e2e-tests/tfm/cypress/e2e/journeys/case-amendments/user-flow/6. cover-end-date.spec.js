import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { oneMonth, today, yearWithZeroLetter } from '../../../../../../e2e-fixtures/dateConstants';
import { ADMIN, BANK1_MAKER1, PIM_USER_1 } from '../../../../../../e2e-fixtures';

context('Amendments - Cover End Date', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, PIM_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should take you to `Enter the new cover end date` page', () => {
    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');
  });

  it('should NOT allow users to enter the same cover end date or with wrong year format', () => {
    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');
    amendmentsPage.amendmentCurrentCoverEndDate().should('contain', oneMonth.ddMMMMyyyy);

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', date: oneMonth.date });

    cy.clickContinueButton();
    errorSummary().contains('The new cover end date cannot be the same as the current cover end date');

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: '20', month: '10', year: '22' });

    cy.clickContinueButton();
    errorSummary().contains('The year for the amendment cover end date must include 4 numbers');

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: '20', month: '10', year: yearWithZeroLetter });

    cy.clickContinueButton();
    errorSummary().contains('The year for the amendment cover end date must include 4 numbers');

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: '20', month: '10', year: '20 22' });

    cy.clickContinueButton();
    errorSummary().contains('The year for the amendment cover end date must include 4 numbers');

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: '20', month: '10', year: '2 22' });

    cy.clickContinueButton();
    errorSummary().contains('The year for the amendment cover end date must include 4 numbers');
  });

  it('should continue to the `Check answers` page if the cover end date is valid and only the cover end date is to be changed', () => {
    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date' });

    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');

    amendmentsPage.amendmentAnswerBankRequestDate().should('contain', today.dayLong);
    amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
    amendmentsPage.amendmentAnswerCoverEndDate().should('contain', today.dayLong);
  });

  it('should continue to the `Enter the facility value` page if the cover end date is valid and the facility value also needs changing', () => {
    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date' });

    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
  });
});
