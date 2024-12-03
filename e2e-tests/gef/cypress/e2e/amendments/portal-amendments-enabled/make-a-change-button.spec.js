import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import relative from '../../relativeURL';
import CONSTANTS from '../../../fixtures/constants';
import { MOCK_APPLICATION_AIN } from '../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1, BANK1_CHECKER1_WITH_MOCK_ID, BANK1_CHECKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../../e2e-fixtures/mock-gef-facilities';
import applicationPreview from '../../pages/application-preview';

const { unissuedCashFacility, unissuedContingentFacility, issuedContingentFacility, issuedCashFacility } = multipleMockGefFacilities({
  facilityEndDateEnabled: true,
});

let dealId;
let token;

let issuedCashFacilityId;
let issuedContingentFacilityId;
let unissuedCashFacilityId;
let unissuedContingentFacilityId;

const makeChangeButtonText = 'Make a change';

context('Amendments - Make a change button - FF_PORTAL_FACILITY_AMENDMENTS_ENABLED feature flag enabled', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        // creates Acknowledged AIN application and inserts facilities
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          dealId = body._id;
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_AIN);
          cy.submitDealAfterUkefIds(dealId, 'GEF', BANK1_CHECKER1_WITH_MOCK_ID);
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_AIN).then(() => {
            cy.apiCreateFacility(dealId, FACILITY_TYPE.CASH, token).then((facility) => {
              issuedCashFacilityId = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, issuedCashFacility);
            });

            cy.apiCreateFacility(dealId, FACILITY_TYPE.CASH, token).then((facility) => {
              unissuedCashFacilityId = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacility);
            });

            cy.apiCreateFacility(dealId, FACILITY_TYPE.CONTINGENT, token).then((facility) => {
              unissuedContingentFacilityId = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedContingentFacility);
            });

            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) => {
              issuedContingentFacilityId = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, issuedContingentFacility);
            });
          });
        });
      });
  });

  describe('when the user is a maker', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
    });

    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should display the make a change button for issued facilities', () => {
      applicationPreview.makeAChangeButton(issuedCashFacilityId).should('exist');
      cy.assertText(applicationPreview.makeAChangeButton(issuedCashFacilityId), makeChangeButtonText);

      applicationPreview.makeAChangeButton(issuedContingentFacilityId).should('exist');
      cy.assertText(applicationPreview.makeAChangeButton(issuedCashFacilityId), makeChangeButtonText);
    });

    it('should not display the make a change button for unissued facilities ', () => {
      applicationPreview.makeAChangeButton(unissuedCashFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedContingentFacilityId).should('not.exist');
    });
  });

  describe('when the user is not a maker', () => {
    before(() => {
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should not display the make a change button', () => {
      applicationPreview.makeAChangeButton(issuedCashFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(issuedContingentFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedCashFacilityId).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedContingentFacilityId).should('not.exist');
    });
  });
});
