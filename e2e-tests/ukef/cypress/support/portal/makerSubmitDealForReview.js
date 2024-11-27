import portalPages from '../../../../portal/cypress/e2e/pages';
import MOCK_USERS from '../../../../e2e-fixtures/portal-users.fixture';

const { BANK1_MAKER1 } = MOCK_USERS;

export const makerSubmitDealForReview = (deal) => {
  cy.login(BANK1_MAKER1);
  portalPages.contract.visit(deal);
  portalPages.contract.proceedToReview().click();

  cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'go');
  portalPages.contractReadyForReview.readyForCheckersApproval().click();
};
