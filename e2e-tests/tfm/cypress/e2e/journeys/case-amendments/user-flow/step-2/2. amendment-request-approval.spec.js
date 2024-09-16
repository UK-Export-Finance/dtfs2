import relative from '../../../../relativeURL';
import { errorSummary } from '../../../../partials';
import facilityPage from '../../../../pages/facilityPage';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../../e2e-fixtures';

context('Amendments - Request approval', () => {
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

  it('should take you to `amendment request approval` page', () => {
    cy.login(PIM_USER_1);
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
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
  });

  it('should return errors when no options are selected', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    cy.clickContinueButton();

    errorSummary().contains('Select yes if the amendment request needs UKEF approval');
    amendmentsPage.errorMessage().contains('Select yes if the amendment request needs UKEF approval');
  });

  it('should continue to the `What would the bank like to change?` page if the user selects `Yes`', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
  });

  it('should continue to the `What date will the amendment be effective from?` page if the user selects `No`', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-effective-date');
  });
});
