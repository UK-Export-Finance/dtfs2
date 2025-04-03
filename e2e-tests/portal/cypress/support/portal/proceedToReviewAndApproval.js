const { contract, contractReadyForReview } = require('../../e2e/pages');
/**
 * Proceeds to the review and approval stage of a contract.
 *
 * This function performs the following steps:
 * 1. Verifies that the 'Proceed to Review' button exists.
 * 2. Clicks the 'Proceed to Review' button.
 * 3. Inputs the comment 'Ready for checkers approval' in the contract review comments section.
 * 4. Clicks the 'Ready for Checkers Approval' button to submit the contract for approval.
 */
const proceedToReviewAndApproval = () => {
  contract.proceedToReview().should('exist');
  contract.proceedToReview().click();
  cy.keyboardInput(contractReadyForReview.comments(), 'Ready for checkers approval');
  contractReadyForReview.readyForCheckersApproval().click();
};

export { proceedToReviewAndApproval };
