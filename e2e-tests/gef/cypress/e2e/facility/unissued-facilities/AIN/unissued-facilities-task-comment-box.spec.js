import relative from '../../../relativeURL';
import CONSTANTS from '../../../../fixtures/constants';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { acbsReconciliation } from '../../../../../../e2e-fixtures/acbs';
import { mainHeading } from '../../../partials';
import applicationPreview from '../../../pages/application-preview';

const { unissuedCashFacility, issuedCashFacility } = multipleMockGefFacilities({
  facilityEndDateEnabled: true,
});

let dealId;
let token;

context('Unissued Facility AIN - change unissued to issued facility', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        // creates application and inserts facilities and changes status
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          dealId = body._id;
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_AIN_DRAFT).then(() => {
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
              cy.apiUpdateFacility(facility.body.details._id, token, issuedCashFacility);
            });
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, issuedCashFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacility),
            );
            cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF);
          });
        });
      });
  });

  describe('Task comment box should only exists post TFM-ACBS reconciliation', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    // Ensure no task comments box is visible until TFM-ACBS reconciliation has finished
    it('task comment box does not exist', () => {
      applicationPreview.applicationPreviewPage().should('not.exist');
      applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    // ensures the task comment box exists with correct headers and link after ACBS reconciliation
    it('task comment box exists with correct header and unissued facilities link', () => {
      // Add ACBS object to TFM
      cy.putTfmDeal(dealId, {
        tfm: {
          ...acbsReconciliation,
        },
      });

      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
      mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
      applicationPreview.automaticCoverSummaryList().contains('Yes - submit as an automatic inclusion notice');
      applicationPreview.automaticCoverCriteria().should('exist');
    });
  });
});
