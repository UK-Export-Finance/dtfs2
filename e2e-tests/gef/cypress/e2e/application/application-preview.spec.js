import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, GEF_FACILITY_TYPE } from '@ukef/dtfs2-common';
import relative from '../relativeURL';
import { MOCK_APPLICATION_AIN, MOCK_APPLICATION_MIN } from '../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../e2e-fixtures/mock-gef-facilities';
import applicationPreview from '../pages/application-preview';

const { unissuedCashFacility, unissuedContingentFacility } = multipleMockGefFacilities();

const deals = [];
let dealId;
let token;
const mockDeals = [MOCK_APPLICATION_AIN, MOCK_APPLICATION_MIN];

context('Application preview page', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        mockDeals.forEach((mockDeal) => {
          // creates application and inserts facilities and changes status
          cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
            dealId = body._id;
            cy.apiUpdateApplication(dealId, token, mockDeal).then((response) => {
              deals.push(response.body);
              cy.apiCreateFacility(dealId, GEF_FACILITY_TYPE.CASH, token).then((facility) => {
                cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacility);
              });
              cy.apiCreateFacility(dealId, GEF_FACILITY_TYPE.CONTINGENT, token).then((facility) =>
                cy.apiUpdateFacility(facility.body.details._id, token, unissuedContingentFacility),
              );
              cy.apiSetApplicationStatus(dealId, token, DEAL_STATUS.UKEF_ACKNOWLEDGED);
            });
          });
        });
      });
  });

  beforeEach(() => {
    cy.saveSession();
    cy.login(BANK1_MAKER1);
  });

  describe('Application preview page with AIN Deal', () => {
    // ensures that banner is populated correctly
    it('should display the information banner', () => {
      const ainDeal = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN);
      cy.visit(relative(`/gef/application-details/${ainDeal._id}`));
      applicationPreview.facilityInformationBanner().should('exist');
      cy.assertText(applicationPreview.facilityInformationBanner(), 'Check your records for the most up-to-date facility details.');
    });
  });

  describe('Application preview page with MIA Deal', () => {
    // ensures that banner is populated correctly
    it('should display the information banner', () => {
      const miaDeal = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN);
      cy.visit(relative(`/gef/application-details/${miaDeal._id}`));
      applicationPreview.facilityInformationBanner().should('exist');
      cy.assertText(applicationPreview.facilityInformationBanner(), 'Check your records for the most up-to-date facility details.');
    });
  });
});
