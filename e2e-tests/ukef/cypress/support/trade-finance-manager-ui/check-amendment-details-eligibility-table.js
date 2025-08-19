import { STATUS_TAG_COLOURS } from '@ukef/dtfs2-common';
import amendmentsPage from '../../../../tfm/cypress/e2e/pages/amendments/amendmentsPage';

/**
 * Check the eligibility criteria table for a specific amendment row on the amendment details tab
 * @param {string} amendmentId - id of the amendment
 * @param {number} row - the row the amendment is on the amendment details tab
 */
export const checkAmendmentDetailsEligibilityTable = (amendmentId, row) => {
  amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTable().should('exist');

  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaIdColumn(amendmentId, 1), '1');
  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTextColumn(amendmentId, 1), 'The Facility is not an Affected Facility');
  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTagColumn(amendmentId, 1), 'TRUE');
  amendmentsPage.amendmentDetails
    .row(row)
    .eligibilityCriteriaTagColumn(amendmentId, 1)
    .should('have.class', `govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}`);

  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaIdColumn(amendmentId, 2), '2');
  cy.assertText(
    amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTextColumn(amendmentId, 2),
    'Neither the Exporter, nor its UK Parent Obligor is an Affected Person',
  );
  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTagColumn(amendmentId, 2), 'TRUE');
  amendmentsPage.amendmentDetails
    .row(row)
    .eligibilityCriteriaTagColumn(amendmentId, 2)
    .should('have.class', `govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}`);

  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaIdColumn(amendmentId, 3), '3');
  cy.assertText(
    amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTextColumn(amendmentId, 3),
    'The Cover Period of the Facility is within the Facility Maximum Cover Period',
  );
  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTagColumn(amendmentId, 3), 'TRUE');
  amendmentsPage.amendmentDetails
    .row(row)
    .eligibilityCriteriaTagColumn(amendmentId, 3)
    .should('have.class', `govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}`);

  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaIdColumn(amendmentId, 4), '4');
  cy.assertText(
    amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTextColumn(amendmentId, 4),
    'The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency) of the Facility is not more than the lesser of (i) the Available Master Guarantee Limit; and the Available Obligor(s) Limit',
  );
  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTagColumn(amendmentId, 4), 'TRUE');
  amendmentsPage.amendmentDetails
    .row(row)
    .eligibilityCriteriaTagColumn(amendmentId, 4)
    .should('have.class', `govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}`);

  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaIdColumn(amendmentId, 5), '5');
  cy.assertText(
    amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTextColumn(amendmentId, 5),
    'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence internally to any Relevant Person for approval as part of its usual Bank Due Diligence',
  );
  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTagColumn(amendmentId, 5), 'TRUE');
  amendmentsPage.amendmentDetails
    .row(row)
    .eligibilityCriteriaTagColumn(amendmentId, 5)
    .should('have.class', `govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}`);

  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaIdColumn(amendmentId, 6), '6');
  cy.assertText(
    amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTextColumn(amendmentId, 6),
    'The Bank is the sole and legal beneficial owner of, and has good title to, the Facility and any Utilisation thereunder',
  );
  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTagColumn(amendmentId, 6), 'TRUE');
  amendmentsPage.amendmentDetails
    .row(row)
    .eligibilityCriteriaTagColumn(amendmentId, 6)
    .should('have.class', `govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}`);

  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaIdColumn(amendmentId, 7), '7');
  cy.assertText(
    amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTextColumn(amendmentId, 7),
    "The Bank's right, title and interest in and to the Facility and any Utilisation thereunder (including any indebtedness, obligation of liability of each Obligor) is free and clear of any Security or Quasi-Security (other than Permitted Security)",
  );
  cy.assertText(amendmentsPage.amendmentDetails.row(row).eligibilityCriteriaTagColumn(amendmentId, 7), 'TRUE');
  amendmentsPage.amendmentDetails
    .row(row)
    .eligibilityCriteriaTagColumn(amendmentId, 7)
    .should('have.class', `govuk-tag govuk-tag--${STATUS_TAG_COLOURS.GREEN}`);
};
