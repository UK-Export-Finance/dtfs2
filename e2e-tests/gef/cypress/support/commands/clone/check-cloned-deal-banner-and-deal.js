// ...existing code...
import { today } from '@ukef/dtfs2-common/test-helpers';
import statusBanner from '../../../e2e/pages/application-status-banner';
import applicationDetails from '../../../e2e/pages/application-details';
import { submitButton } from '../../../e2e/partials';

/**
 * checkClonedDealBannerAndDeal
 * checks the banner and the deal fields on a gef deal which has been cloned
 * @param {string} dealName - name of the gef cloned deal
 * @param {string} facilityId - id of the facility which is in progress
 */
const checkClonedDealBannerAndDeal = (dealName, facilityId) => {
  statusBanner.bannerStatus().contains('Draft');
  statusBanner.bannerCheckedBy().contains('-');
  statusBanner.bannerUkefDealId().should('not.exist');
  statusBanner.bannerDateCreated().contains(today.dd_MMM_yyyy);

  applicationDetails.bankRefName().contains(dealName);
  applicationDetails.automaticCoverStatus().contains('Not started');
  applicationDetails.facilityStatus().contains('In progress');
  applicationDetails.exporterStatus().contains('Completed');
  submitButton().should('not.exist');

  /**
   * checks the facility table
   * gets the facility summary list and finds the in progress facilityId by id
   * should have 1 issued facility with a past cover start date which changes to required
   * checks the name row has the correct name,
   * stage has the value of Issued,
   * and cover start date has the value of required
   */
  cy.get(`#${facilityId}`).within(() => {
    // Check the 'Stage' row
    cy.get('.govuk-summary-list__row')
      .contains('.govuk-summary-list__key', 'Stage')
      .parent()
      .within(() => {
        cy.get('.govuk-summary-list__value').should('contain', 'Issued');
      });

    // Check the 'Name' row
    cy.get('.govuk-summary-list__row')
      .contains('.govuk-summary-list__key', 'Name')
      .parent()
      .within(() => {
        cy.get('.govuk-summary-list__value').should('contain', 'This Contingent facility 1');
      });

    // Check the 'Cover start date' row
    cy.get('.govuk-summary-list__row')
      .contains('.govuk-summary-list__key', 'Cover start date')
      .parent()
      .within(() => {
        cy.get('.govuk-summary-list__value').should('contain', 'Required');
      });
  });
};

export default checkClonedDealBannerAndDeal;
