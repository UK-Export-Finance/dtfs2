import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import relative from '../relativeURL';
import applicationPreview from '../pages/application-preview';
import { MOCK_APPLICATION_AIN, MOCK_APPLICATION_MIN } from '../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../e2e-fixtures/mock-gef-facilities';

const { unissuedCashFacility, unissuedContingentFacility } = multipleMockGefFacilities();

const deals = [];
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
          cy.createAndConfigureApplicationStatus(BANK1_MAKER1, token, mockDeal, unissuedCashFacility, unissuedContingentFacility).then((response) => {
            deals.push(response.body);
          });
        });
      });
  });

  beforeEach(() => {
    cy.saveSession();
    cy.login(BANK1_MAKER1);
  });

  describe('Application preview page with AIN Deal and status Acknowledged', () => {
    // ensures that banner is populated correctly
    it('should display the information banner', () => {
      const ainDeal = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN);
      cy.visit(relative(`/gef/application-details/${ainDeal._id}`));
      applicationPreview.facilityInformationBanner().should('exist');
      cy.assertText(applicationPreview.facilityInformationBanner(), 'Check your records for the most up-to-date facility details.');
    });
  });

  describe('Application preview page with MIN Deal and status Acknowledged', () => {
    // ensures that banner is populated correctly
    it('should display the information banner', () => {
      const minDeal = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN);
      cy.visit(relative(`/gef/application-details/${minDeal._id}`));
      applicationPreview.facilityInformationBanner().should('exist');
      cy.assertText(applicationPreview.facilityInformationBanner(), 'Check your records for the most up-to-date facility details.');
    });
  });
});
