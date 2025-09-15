import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import applicationDetails from '../../e2e/pages/application-details';
import submitToUkef from '../../e2e/pages/submit-to-ukef';

import relativeURL from '../relativeURL';

/**
 * Creates a full application from the UI and submits it to UKEF with the specified parameters.
 * @param {boolean} automaticEligibility - if AIN or MIA application to be submitted
 * @param {Array} facilitiesToCreate - array of facility parameters to create
 * @returns {Promise} - A promise that returns the deal and facility ids
 */
export const createFullApplication = ({ automaticEligibility = true, facilitiesToCreate }) => {
  const facilityIds = [];

  cy.login(BANK1_MAKER1);

  // sets up an application including the application name and gef type
  cy.createApplicationFirstSteps();

  return cy
    .getDealIdFromUrl()
    .then((dealId) => {
      // completes the about exporter section
      cy.completeAboutExporterSection();

      // navigates to the eligibility criteria section
      applicationDetails.automaticCoverDetailsLink().click();

      if (automaticEligibility) {
        // if AIN, completes the automatic eligibility criteria
        cy.automaticEligibilityCriteria();

        cy.clickContinueButton();
        cy.clickContinueButton();
      } else {
        // IF MIA, completes the manual eligibility criteria and supporting info sections
        cy.manualEligibilityCriteria();

        cy.clickContinueButton();
        cy.clickContinueButton();

        cy.completeManualInclusionSupportingInfoSections(dealId);
      }

      /**
       * Loops through facilities array to create designated facilities
       * with the specified parameters
       * adds the id of the created facility to the facilityIds array
       */
      facilitiesToCreate.forEach((params) => {
        cy.createFacility(params).then((id) => facilityIds.push(id));
      });

      // submits the application to the checker
      cy.clickSubmitButton();
      cy.clickSubmitButton();

      // submits the application to UKEF
      cy.login(BANK1_CHECKER1);
      cy.visit(relativeURL(`/gef/application-details/${dealId}/submit-to-ukef`));

      submitToUkef.confirmSubmissionCheckbox().click();
      cy.clickSubmitButton();

      const ids = {
        dealId,
        facilityIds,
      };

      // returns the deal and facility ids
      return cy.wrap(ids);
    })
    .then((ids) => ids);
};
