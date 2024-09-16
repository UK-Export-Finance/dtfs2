import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';
import { ADMIN, BANK1_MAKER1, PIM_USER_1 } from '../../../../../../../e2e-fixtures';

context('Amendments - BSS/EWCS deal does not display any Facility end date pages or fields', () => {
  let dealId;
  const facilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
        facilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, PIM_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(PIM_USER_1);
    const facilityId = facilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    facilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should not show any facility end date fields in the Details tab', () => {
    facilityPage.facilityIsUsingFacilityEndDate().should('not.exist');
    facilityPage.facilityFacilityEndDate().should('not.exist');
    facilityPage.facilityBankReviewDate().should('not.exist');
  });

  it('should go straight from the cover end date amendments page to the review amendment answers page without displaying any facility end date fields', () => {
    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();

    cy.url().should('contain', 'request-date');
    amendmentsPage.amendmentRequestDayInput().clear().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'cover-end-date');
    amendmentsPage.amendmentCoverEndDateDayInput().clear().type(dateConstants.todayDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().type(dateConstants.todayMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');

    amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('not.exist');
    amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');
    amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');
  });
});
