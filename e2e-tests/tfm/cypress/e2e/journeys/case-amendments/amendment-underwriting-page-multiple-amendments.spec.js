import relative from '../../relativeURL';
import caseSubNavigation from '../../partials/caseSubNavigation';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';
import pages from '../../pages';

const tfmFacilityEndDateEnabled = Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED');

context('Amendments underwriting page - multiple amendments should show without automatic amendments', () => {
  let dealId;
  const dealFacilities = [];
  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0], mockFacilities[1]], BANK1_MAKER1).then((createdFacilities) => {
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

  it('should submit an automatic amendment request', () => {
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
    // automatic approval
    amendmentsPage.amendmentRequestApprovalNo().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'amendment-effective-date');

    amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.tomorrowDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();

    if (tfmFacilityEndDateEnabled) {
      cy.url().should('contain', 'is-using-facility-end-date');
      amendmentsPage.isUsingFacilityEndDateYes().click();
      amendmentsPage.continueAmendment().click();
    }

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();
  });

  it('should submit an amendment request', () => {
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
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.threeMonthsDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.threeMonthsMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.threeMonthsYear);
    amendmentsPage.continueAmendment().click();

    if (tfmFacilityEndDateEnabled) {
      cy.url().should('contain', 'is-using-facility-end-date');
      amendmentsPage.isUsingFacilityEndDateYes().click();
      amendmentsPage.continueAmendment().click();
    }

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('1234');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();
  });

  it('should submit an amendment request', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[1]._id;
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
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'amendment-options');

    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('12345');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();
  });

  it('should have length 2 for amendment underwriting headings as automatic amendment should not show', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.amendmentHeading().should('have.length', 2);
  });
});
