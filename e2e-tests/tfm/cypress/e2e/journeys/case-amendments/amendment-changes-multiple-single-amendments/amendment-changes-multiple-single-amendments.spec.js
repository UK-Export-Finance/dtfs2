import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { today, twoMonths } from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';
import { CURRENCY } from '../../../../../../e2e-fixtures/constants.fixture';
import caseDealPage from '../../../pages/caseDealPage';

context('Amendments changes displayed - multiple single change amendments', () => {
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

  it('should submit an automatic amendment request for coverEndDate', () => {
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

    // automatic approval
    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-effective-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--effective-date' });

    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');

    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', date: twoMonths.date });

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

    cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');

    // automatic approval
    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-effective-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--effective-date' });

    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');

    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
    // update both the cover end date and the facility value
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'facility-value');

    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');
    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should display amendment changed values on deal and facility page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/deal`));
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().should('not.contain', '23 months');
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(twoMonths.d_MMMM_yyyy);
    caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 123.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 123.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 24.60`);

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
    facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 123.00`);
    facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 123.00`);
    facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 24.60 as at ${today.d_MMMM_yyyy}`);
    facilityPage.facilityCoverEndDate().contains(twoMonths.d_MMMM_yyyy);
    facilityPage.facilityTenor().should('not.contain', '23 months');
  });
});
