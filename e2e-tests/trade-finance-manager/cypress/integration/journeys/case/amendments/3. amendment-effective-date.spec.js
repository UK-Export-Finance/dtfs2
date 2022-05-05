import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Amendments request page', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('should continue to the `What date will the amendment be effective from?` page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'request-approval');

    amendmentsPage.amendmentRequestApprovalNo().click();
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'amendment-effective-date');
  });

  it('should return errors when clicking continue on blank inputs', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.continueAmendmentButton().should('exist');
    amendmentsPage.continueAmendmentButton().contains('Continue with amendment request 1');
    amendmentsPage.continueAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'request-approval');

    amendmentsPage.amendmentRequestApprovalNo().click();
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'amendment-effective-date');

    amendmentsPage.continueAmendment().click();

    amendmentsPage.errorSummary().contains('Enter the date the amendment is effective from');
    amendmentsPage.errorMessage().contains('Enter the date the amendment is effective from');
  });

  it('should continue to the `What would the bank like to change?` page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.continueAmendmentButton().should('exist');
    amendmentsPage.continueAmendmentButton().contains('Continue with amendment request 1');
    amendmentsPage.continueAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'request-approval');

    amendmentsPage.amendmentRequestApprovalNo().click();
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'amendment-effective-date');

    amendmentsPage.amendmentEffectiveDayInput().type(dateConstants.todayDay);
    amendmentsPage.amendmentEffectiveMonthInput().type(dateConstants.todayMonth);
    amendmentsPage.amendmentEffectiveYearInput().type(dateConstants.todayYear);

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'amendment-options');
  });
});
