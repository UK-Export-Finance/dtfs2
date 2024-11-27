import portalPages from '../../../../portal/cypress/e2e/pages';
import MOCK_USERS from '../../../../e2e-fixtures/portal-users.fixture';

const { BANK1_CHECKER1 } = MOCK_USERS;

export const checkerSubmitDealToUkef = (deal) => {
  cy.login(BANK1_CHECKER1);
  portalPages.contract.visit(deal);
  portalPages.contract.proceedToSubmit().click();

  portalPages.contractConfirmSubmission.confirmSubmit().check();
  portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);
};
