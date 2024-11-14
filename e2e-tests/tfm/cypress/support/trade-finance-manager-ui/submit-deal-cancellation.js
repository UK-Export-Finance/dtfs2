import relative from '../../e2e/relativeURL';
import * as caseDealPage from '../../e2e/pages/caseDealPage';
import * as checkDetailsPage from '../../e2e/pages/deal-cancellation/check-details';

export const submitDealCancellation = ({ dealId, effectiveDate }) => {
  cy.visit(relative(`/case/${dealId}/deal`));

  caseDealPage.cancelDealButton().click();
  cy.clickContinueButton();

  cy.completeDateFormFields({ idPrefix: 'bank-request-date' });
  cy.clickContinueButton();

  cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: effectiveDate });
  cy.clickContinueButton();

  checkDetailsPage.dealDeletionButton().click();
};
