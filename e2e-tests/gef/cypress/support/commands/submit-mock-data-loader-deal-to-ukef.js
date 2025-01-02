import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import submitToUkef from '../../e2e/pages/submit-to-ukef';
import relative from '../relativeURL';

/**
 * submitMockDataLoaderDealToUkef
 * completes and submits a deal from the mock data loader to UKEF
 * calls submitMockDataLoaderDealToChecker to complete and submit the deal to the checker
 * logs in as the checker and submits to UKEF
 * @param {String} dealId - the deal id
 * @param {String} dealType - if the deal if AIN or MIA
 */
const submitMockDataLoaderDealToUkef = (dealId, dealType = DEAL_SUBMISSION_TYPE.AIN) => {
  cy.submitMockDataLoaderDealToChecker(dealId, dealType);

  cy.login(BANK1_CHECKER1);
  cy.visit(relative(`/gef/application-details/${dealId}`));
  cy.clickSubmitButton();
  submitToUkef.confirmSubmissionCheckbox().click();
  cy.clickSubmitButton();
};

export default submitMockDataLoaderDealToUkef;
