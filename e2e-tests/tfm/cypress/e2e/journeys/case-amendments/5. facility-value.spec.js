import relative from '../../relativeURL';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Amendments - Facility value', () => {
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

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should take you to `Enter the new facility value` page', () => {
    cy.mockLogin(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'request-approval');
    amendmentsPage.amendmentRequestApprovalYes().click();
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'facility-value');
  });

  it('should NOT allow users to enter the same facility value', () => {
    cy.mockLogin(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.continueAmendmentButton().click();
    cy.url().should('contain', 'request-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'request-approval');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'amendment-options');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type(12345);
    amendmentsPage.continueAmendment().click();
    amendmentsPage.errorSummary().contains('The new facility value cannot be the same as the current facility value');
  });

  it('should NOT allow users to enter the characters that are not numbers', () => {
    cy.mockLogin(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.continueAmendmentButton().click();
    cy.url().should('contain', 'request-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'request-approval');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'amendment-options');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('1234A23');
    amendmentsPage.continueAmendment().click();
    amendmentsPage.errorSummary().contains('The new facility value must be a number');
  });

  it('should continue to `Check your answers` page if the facility value is valid', () => {
    cy.mockLogin(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.continueAmendmentButton().click();
    cy.url().should('contain', 'request-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'request-approval');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'amendment-options');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');

    amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
    amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
    amendmentsPage.amendmentAnswerFacilityValue().should('contain', '123.00');
  });
});
