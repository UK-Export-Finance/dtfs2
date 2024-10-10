import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { todayDay } from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

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
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

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

    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'facility-value');
  });

  it('should NOT allow users to enter the same facility value', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
    cy.clickContinueButton();
    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), 12345);
    cy.clickContinueButton();
    errorSummary().contains('The new facility value cannot be the same as the current facility value');
  });

  it('should NOT allow users to enter the characters that are not numbers', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
    cy.clickContinueButton();
    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '1234A23');
    cy.clickContinueButton();
    errorSummary().contains('The new facility value must be a number');
  });

  it('should continue to `Check your answers` page if the facility value is valid', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
    cy.clickContinueButton();
    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');
    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');

    amendmentsPage.amendmentAnswerBankRequestDate().should('contain', todayDay);
    amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
    amendmentsPage.amendmentAnswerFacilityValue().should('contain', '123.00');
  });
});
