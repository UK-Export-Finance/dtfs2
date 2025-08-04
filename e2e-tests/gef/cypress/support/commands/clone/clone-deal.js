import cloneGEFDeal from '../../../e2e/pages/clone-deal';
import mandatoryCriteria from '../../../e2e/pages/mandatory-criteria';
import { form } from '../../../e2e/partials';
import nameApplication from '../../../e2e/pages/name-application';
import { BANK1_MAKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import relative from '../../../e2e/relativeURL';

/**
 * cloneDeal
 * clones gef deal
 * @param {string} dealId - the deal id
 * @param {string} clonedDealName - name of the cloned deal
 */
const cloneDeal = (dealId, clonedDealName) => {
  cy.login(BANK1_MAKER1);

  cy.visit(relative(`/gef/application-details/${dealId}`));

  cloneGEFDeal.cloneGefDealLink().click();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/clone`));
  mandatoryCriteria.trueRadio().click();
  form().submit();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/clone/name-application`));
  cy.keyboardInput(nameApplication.internalRef(), clonedDealName);
  form().submit();
  cy.get('[data-cy="success-message-link"]').click();
};

export default cloneDeal;
