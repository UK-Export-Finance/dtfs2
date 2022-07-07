import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Amendments - Cover End Date', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], MOCK_MAKER_TFM).then((createdFacilities) => {
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

  it('should take you to `Enter the new facility value` page', () => {
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
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'request-approval');
    amendmentsPage.amendmentRequestApprovalYes().click();
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'cover-end-date');
  });

  it('should NOT allow users to enter the same cover end date', () => {
    cy.login(PIM_USER_1);
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
    cy.url().should('contain', 'cover-end-date');
    amendmentsPage.amendmentCurrentCoverEndDate().should('contain', '20 October 2020');
    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(20);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(10);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(2020);
    amendmentsPage.continueAmendment().click();
    amendmentsPage.errorSummary().contains('The new cover end date cannot be the same as the current cover end date');
  });

  it('should continue to `Check your answers` page if the cover end date is valid', () => {
    cy.login(PIM_USER_1);
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
    cy.url().should('contain', 'cover-end-date');
    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');

    amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
    amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
    amendmentsPage.amendmentAnswerCoverEndDate().should('contain', dateConstants.todayDay);
  });
});
