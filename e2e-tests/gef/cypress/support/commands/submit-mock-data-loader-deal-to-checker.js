import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import applicationDetails from '../../e2e/pages/application-details';
import relative from '../relativeURL';

/**
 * submitMockDataLoaderDealToChecker
 * completes a deal from the mock data loader and submits it to the checker
 * completes the automatic or manual cover forms based on provided dealType
 * submits it to the checker
 * @param {string} dealId - the deal id
 * @param {string} dealType - if the deal is AIN or MIA
 */
const submitMockDataLoaderDealToChecker = (dealId, dealType = DEAL_SUBMISSION_TYPE.AIN) => {
  cy.login(BANK1_MAKER1);

  cy.visit(relative(`/gef/application-details/${dealId}`));
  cy.url().should('eq', relative(`/gef/application-details/${dealId}`));

  applicationDetails.automaticCoverDetailsLink().click();

  if (dealType === DEAL_SUBMISSION_TYPE.AIN) {
    // Make the deal an AIN
    cy.automaticEligibilityCriteria();
    cy.clickSaveAndReturnButton();
  } else {
    cy.manualEligibilityCriteria();
    cy.clickContinueButton();
    cy.clickContinueButton();

    cy.completeManualInclusionSupportingInfoSections(dealId);
  }

  cy.clickSubmitButton();
  cy.clickSubmitButton();
};

export default submitMockDataLoaderDealToChecker;
