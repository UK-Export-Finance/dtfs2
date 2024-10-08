import relative from '../../../relativeURL';
import { continueButton, errorSummary } from '../../../partials';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

context('Amendments - Effective date', () => {
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

  it('should continue to the `What date will the amendment be effective from?` page', () => {
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

    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-effective-date');
  });

  it('should return errors when clicking continue on blank inputs', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    continueButton().should('exist');
    continueButton().contains('Continue with amendment request 1');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');

    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-effective-date');

    cy.clickContinueButton();

    errorSummary().contains('Enter the date the amendment is effective from');
    amendmentsPage.errorMessage().contains('Enter the date the amendment is effective from');
  });

  it('should return errors when entering year in wrong format', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    continueButton().should('exist');
    continueButton().contains('Continue with amendment request 1');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');

    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-effective-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--effective-date', year: '22' });

    cy.clickContinueButton();

    errorSummary().contains('The year for the effective date must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');

    cy.completeDateFormFields({ idPrefix: 'amendment--effective-date', year: '2O22' });

    cy.clickContinueButton();

    errorSummary().contains('The year for the effective date must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');

    cy.completeDateFormFields({ idPrefix: 'amendment--effective-date', year: '20 22' });

    cy.clickContinueButton();

    errorSummary().contains('The year for the effective date must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');

    cy.completeDateFormFields({ idPrefix: 'amendment--effective-date', year: '2 22' });

    cy.clickContinueButton();

    errorSummary().contains('The year for the effective date must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');
  });

  it('should continue to the `What would the bank like to change?` page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    continueButton().should('exist');
    continueButton().contains('Continue with amendment request 1');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');

    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-effective-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--effective-date' });

    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
  });
});
