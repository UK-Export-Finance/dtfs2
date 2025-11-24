import { TFM_URL } from '../../../../e2e-fixtures';
import facilityPage from '../../../../tfm/cypress/e2e/pages/facilityPage';
import amendmentsPage from '../../../../tfm/cypress/e2e/pages/amendments/amendmentsPage';

/**
 * visits the TFM facility page and adds an amendment to the facility.
 * Submits an automatic amendment request with the provided parameters.
 * if coverEndDate is provided, it will also submit the cover end date amendment.
 * if facilityValue is provided, it will also submit the facility value amendment.
 * @param {string} params.dealId - The dealId.
 * @param {string} params.facilityId - The facilityId.
 * @param {string} params.facilityValue - The facility value to be set in the amendment.
 * @param {string} params.coverEndDate - The cover end date to be set in the amendment.
 */
export const submitTfmAmendment = ({ dealId, facilityId, facilityValue, coverEndDate }) => {
  cy.visit(`${TFM_URL}/case/${dealId}/facility/${facilityId}`);

  facilityPage.facilityTabAmendments().click();
  amendmentsPage.addAmendmentButton().click();
  cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });
  cy.clickContinueButton();
  amendmentsPage.amendmentRequestApprovalNo().click();
  cy.clickContinueButton();

  cy.completeDateFormFields({ idPrefix: 'amendment--effective-date' });

  cy.clickContinueButton();

  if (facilityValue) {
    amendmentsPage.amendmentFacilityValueCheckbox().click();
  }

  if (coverEndDate) {
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
  }
  cy.clickContinueButton();

  if (coverEndDate) {
    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', date: coverEndDate });
    cy.clickContinueButton();

    amendmentsPage.isUsingFacilityEndDateNo().click();
    cy.clickContinueButton();

    cy.completeDateFormFields({ idPrefix: 'amendment--bank-review-date' });
    cy.clickContinueButton();
  }

  if (facilityValue) {
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), facilityValue);
    cy.clickContinueButton();
  }

  return cy
    .url()
    .then((url) => {
      const urlSplit = url.split('/');

      const amendmentId = urlSplit[8];

      cy.clickContinueButton();

      return cy.wrap(amendmentId);
    })
    .then((amendmentId) => amendmentId);
};
