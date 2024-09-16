import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';
import facilitiesPage from '../../../pages/facilitiesPage';

context('Amendments all facilities table - should show amendment value and coverEndDate', () => {
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

  it('should show facility value and coverEndDate for original facility', () => {
    const facilityId = dealFacilities[0]._id;

    cy.login(PIM_USER_1);
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    facilitiesPage.facilitiesTable.row(facilityId).facilityLinkText().contains('1000000');
    facilitiesPage.facilitiesTable.row(facilityId).value().contains('GBP 12,345');
    facilitiesPage.facilitiesTable.row(facilityId).coverEndDate().contains(dateConstants.oneMonthFormattedShort);
  });

  it('should submit an automatic amendment request for coverEndDate', () => {
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

    // automatic approval
    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-effective-date');

    amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');

    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
    // update both the cover end date only
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.tomorrowDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.tomorrowMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.tomorrowYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should submit an automatic amendment request for facilityValue', () => {
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

    // automatic approval
    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-effective-date');

    amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');

    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
    // update the facility value only
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'facility-value');

    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');
    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should show facility value and coverEndDate from amendments in all facilities table', () => {
    const facilityId = dealFacilities[0]._id;

    cy.login(PIM_USER_1);
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    facilitiesPage.facilitiesTable.row(facilityId).facilityLinkText().contains('1000000');
    facilitiesPage.facilitiesTable.row(facilityId).value().contains('GBP 123');
    facilitiesPage.facilitiesTable.row(facilityId).coverEndDate().contains(dateConstants.tomorrowFormattedFacilityPage);
  });
});
