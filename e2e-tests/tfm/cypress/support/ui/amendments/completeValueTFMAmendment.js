import amendmentsPage from '../../../e2e/pages/amendments/amendmentsPage';

/**
 * completeValueTFMAmendment
 * Completes and submits a TFM amendment for facility value
 * @param {string} existingValue: Existing facility value. Defaults to '12,345.00'
 * @param {string} value: New facility value to be set. Defaults to '123'
 */
const completeValueTFMAmendment = ({ existingValue = '12,345.00', value = '123' }) => {
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

  amendmentsPage.amendmentCurrentFacilityValue().should('contain', existingValue);
  cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), value);
  cy.clickContinueButton();
  cy.url().should('contain', 'check-answers');
  cy.clickContinueButton();
};

export default completeValueTFMAmendment;
