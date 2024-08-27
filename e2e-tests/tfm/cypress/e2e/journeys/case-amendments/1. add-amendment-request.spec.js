import relative from '../../relativeURL';
import { cancelLink } from '../../partials';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Amendments - Request date', () => {
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

  it('should take you to amendment request page when clicking add an amendment button', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');
    amendmentsPage.amendmentRequestHeading().contains('What date did the bank request the amendment?');
    amendmentsPage.amendmentRequestHint().contains('For example, 31 3 1980');
    amendmentsPage.amendmentRequestDayInput();
    amendmentsPage.amendmentRequestMonthInput();
    amendmentsPage.amendmentRequestYearInput();
    amendmentsPage.continueAmendment();
    cancelLink();
  });

  it('should return errors when clicking continue on blank inputs', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().click();

    amendmentsPage.continueAmendment().click();

    amendmentsPage.errorSummary().contains('Enter the date the bank requested the amendment');
    amendmentsPage.errorMessage().contains('Enter the date the bank requested the amendment');
  });

  it('should return errors when clicking continue on past date', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().click();

    amendmentsPage.amendmentRequestDayInput().clear().focused().type('01');
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type('01');
    amendmentsPage.amendmentRequestYearInput().clear().focused().type('2020');

    amendmentsPage.continueAmendment().click();

    amendmentsPage.errorSummary().contains('Amendment request date cannot be before the notice submission date');
    amendmentsPage.errorMessage().contains('Amendment request date cannot be before the notice submission date');
  });

  it('should return errors when clicking continue on future date', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().click();

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.threeMonthsDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.threeMonthsMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.threeMonthsYear);

    amendmentsPage.continueAmendment().click();

    amendmentsPage.errorSummary().contains('Amendment request date cannot be in the future');
    amendmentsPage.errorMessage().contains('Amendment request date cannot be in the future');
  });

  it('should return errors when clicking continue on year in wrong format', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().click();

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type('22');

    amendmentsPage.continueAmendment().click();

    amendmentsPage.errorSummary().contains('The year for the amendment request date must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type('2O22');

    amendmentsPage.continueAmendment().click();

    amendmentsPage.errorSummary().contains('The year for the amendment request date must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type('20 22');

    amendmentsPage.continueAmendment().click();

    amendmentsPage.errorSummary().contains('The year for the amendment request date must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type('2 22');

    amendmentsPage.continueAmendment().click();

    amendmentsPage.errorSummary().contains('The year for the amendment request date must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');
  });

  it('should take you back to amendments page when clicking cancel', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().click();

    cy.clickCancelLink();
    cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}#amendments`));
  });

  it('should redirect when adding correct request date', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().click();

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);

    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'request-approval');
  });
});
