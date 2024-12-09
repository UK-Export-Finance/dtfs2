import { DEAL_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import relative from '../relativeURL';
import applicationPreview from '../pages/application-preview';
import { MOCK_APPLICATION_AIN, MOCK_APPLICATION_MIN, MOCK_APPLICATION_MIA } from '../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../e2e-fixtures/mock-gef-facilities';

const { unissuedCashFacility, unissuedContingentFacility } = multipleMockGefFacilities();

const deals = [];

const mockDeals = [MOCK_APPLICATION_AIN, MOCK_APPLICATION_MIN, MOCK_APPLICATION_MIA];

context('Application preview page', () => {
  before(() => {
    mockDeals.forEach((mockDeal) => {
      cy.createAndConfigureApplicationStatus(
        mockDeal,
        unissuedCashFacility,
        unissuedContingentFacility,
        mockDeal.submissionType === DEAL_SUBMISSION_TYPE.MIA ? DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS : DEAL_STATUS.UKEF_ACKNOWLEDGED,
      ).then((response) => {
        // return back the updated deal with cy.wrap
        deals.push(response.body);
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

  describe('Application preview page with MIA Deal and status Accepted by UKEF (with conditions)', () => {
    // ensures that banner is not displayed
    it('should not display the information banner', () => {
      const miaDeal = deals.find((deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIA);
      cy.visit(relative(`/gef/application-details/${miaDeal._id}`));
      applicationPreview.facilityInformationBanner().should('not.exist');
    });
  });
});
