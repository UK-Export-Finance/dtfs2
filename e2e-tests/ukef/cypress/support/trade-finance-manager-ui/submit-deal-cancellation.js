import { TFM_URL } from '../../../../e2e-fixtures';
import * as caseDealPage from '../../../../tfm/cypress/e2e/pages/caseDealPage';
import * as checkDetailsPage from '../../../../tfm/cypress/e2e/pages/deal-cancellation/check-details';

/**
 * Submits a deal cancellation in tfm
 *
 * @param params
 * @param {string} params.dealId - the deal id
 * @param {Date | undefined} params.effectiveDate - The effective date of the cancellation.
 */
export const submitDealCancellation = ({ dealId, effectiveDate }) => {
  cy.visit(`${TFM_URL}/case/${dealId}/deal`);

  caseDealPage.cancelDealButton().click();
  cy.clickContinueButton();

  cy.completeDateFormFields({ idPrefix: 'bank-request-date' });
  cy.clickContinueButton();

  cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: effectiveDate });
  cy.clickContinueButton();

  checkDetailsPage.dealDeletionButton().click();
};
