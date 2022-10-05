import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';
import { CURRENCY } from '../../../../../../e2e-fixtures/constants.fixture';
import caseDealPage from '../../../pages/caseDealPage';

context('Amendments changes displayed - multiple single change amendments', () => {
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
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.twoMonthsDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.twoMonthsMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.twoMonthsYear);
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();
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
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'facility-value');

    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();
  });

  it('should display amendment changed values on deal and facility page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/deal`));
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().should('not.contain', '23 months');
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.twoMonthsFormattedTable);
    caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 123.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 123.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 24.60`);

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
    facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 123.00`);
    facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 123.00`);
    facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 24.60 as at ${dateConstants.todayFormatted}`);
    facilityPage.facilityCoverEndDate().contains(dateConstants.twoMonthsFormattedTable);
    facilityPage.facilityTenor().should('not.contain', '23 months');
  });
});
