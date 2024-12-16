import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, TFM_URL } from '@ukef/dtfs2-common';
import relative from '../../../../relativeURL';
import gefPages from '../../../../../../../gef/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT, MOCK_APPLICATION_MIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility, anUnissuedCashFacility, multipleMockGefFacilities } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { yesterday, tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';

import { PIM_USER_1 } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1 } = MOCK_USERS;

context('When a deal has been cancelled on TFM, maker is unable to issue facility', () => {
  const ainDeals = Array(4).fill(MOCK_APPLICATION_AIN_DRAFT);
  const minDeals = Array(4).fill(MOCK_APPLICATION_MIN_DRAFT);
  const gefDeals = [...ainDeals, ...minDeals];
  const deals = [];

  const facilities = [
    anIssuedCashFacility({ facilityEndDateEnabled: true }),
    anIssuedCashFacility({ facilityEndDateEnabled: true }),
    anUnissuedCashFacility({ facilityEndDateEnabled: true }),
    multipleMockGefFacilities({ facilityEndDateEnabled: true }).unissuedContingentFacility,
    anIssuedCashFacility({ facilityEndDateEnabled: true }),
    anIssuedCashFacility({ facilityEndDateEnabled: true }),
    multipleMockGefFacilities({ facilityEndDateEnabled: true }).unissuedContingentFacility,
    anUnissuedCashFacility({ facilityEndDateEnabled: true }),
  ];

  before(() => {
    cy.insertManyGefDeals(gefDeals, BANK1_MAKER1).then((insertedDeals) => {
      insertedDeals.forEach((insertedDeal, index) => {
        const gefDeal = { ...insertedDeal };
        const mockDeal = index < 4 ? MOCK_APPLICATION_AIN_DRAFT : MOCK_APPLICATION_MIN_DRAFT;

        // updates a gef deal so has relevant fields
        cy.updateGefDeal(gefDeal._id, mockDeal, BANK1_MAKER1);

        cy.createGefFacilities(gefDeal._id, [facilities[index]], BANK1_MAKER1).then((createdFacilities) => {
          gefDeal.facilities = createdFacilities;
          cy.makerLoginSubmitGefDealForReview(gefDeal);
          cy.checkerLoginSubmitGefDealToUkef(gefDeal);
          cy.clearSessionCookies();

          cy.forceVisit(TFM_URL);
          cy.tfmLogin(PIM_USER_1);
          const effectiveDate = index % 2 === 0 ? tomorrow.date : yesterday.date;
          cy.submitDealCancellation({ dealId: gefDeal._id, effectiveDate });
          // get deal with updated status for cancellation in past or in the future
          cy.getOneGefDeal(gefDeal._id, BANK1_MAKER1).then((deal) => deals.push({ ...deal, facilities: createdFacilities }));
        });
      });
    });
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  describe('when a deal has unissued facilities submitted to UKEF and the deal has already been cancelled', () => {
    describe('AIN deal', () => {
      it('should not allow a Maker to issue facilities in portal', () => {
        const ainDealUnissuedFacilitiesPast = deals.find(
          (deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.CANCELLED && !deal.facilities.details.hasBeenIssued,
        );
        cy.visit(relative(`/gef/application-details/${ainDealUnissuedFacilitiesPast._id}`));
        gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
      });
    });
    describe('MIN deal', () => {
      it('should not allow a Maker to issue facilities in portal', () => {
        const minDealUnissuedFacilitiesPast = deals.find(
          (deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.CANCELLED && !deal.facilities.details.hasBeenIssued,
        );
        cy.visit(relative(`/gef/application-details/${minDealUnissuedFacilitiesPast._id}`));
        gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
      });
    });
  });

  describe('when a deal has issued facilities submitted to UKEF and the deal has already been cancelled', () => {
    describe('AIN Deal', () => {
      it('should not allow a Maker to issue facilities in portal', () => {
        const ainDealIssuedFacilitiesPast = deals.find(
          (deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.CANCELLED && deal.facilities.details.hasBeenIssued,
        );
        cy.visit(relative(`/gef/application-details/${ainDealIssuedFacilitiesPast._id}`));
        gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
      });
    });
    describe('MIN Deal', () => {
      it('should not allow a Maker to issue facilities in portal', () => {
        const minDealIssuedFacilitiesPast = deals.find(
          (deal) => deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.CANCELLED && deal.facilities.details.hasBeenIssued,
        );
        cy.visit(relative(`/gef/application-details/${minDealIssuedFacilitiesPast._id}`));
        gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
      });
    });
  });

  describe('when a deal has unissued facilities submitted to UKEF and the deal has been scheduled for cancellation', () => {
    describe('AIN Deal', () => {
      it('should not allow a Maker to issue facilities in portal', () => {
        const ainDealUnissuedFacilitiesFuture = deals.find(
          (deal) =>
            deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION && !deal.facilities.details.hasBeenIssued,
        );
        cy.visit(relative(`/gef/application-details/${ainDealUnissuedFacilitiesFuture._id}`));
        gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
      });
    });
    describe('MIN Deal', () => {
      it('should not allow a Maker to issue facilities in portal', () => {
        const minDealUnissuedFacilitiesFuture = deals.find(
          (deal) =>
            deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION && !deal.facilities.details.hasBeenIssued,
        );
        cy.visit(relative(`/gef/application-details/${minDealUnissuedFacilitiesFuture._id}`));
        gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
      });
    });
  });

  describe('when a deal has issued facilities submitted to UKEF and the deal has been scheduled for cancellation', () => {
    describe('AIN Deal', () => {
      it('should not allow a Maker to issue facilities in portal', () => {
        const ainDealIssuedFacilitiesFuture = deals.find(
          (deal) =>
            deal.submissionType === DEAL_SUBMISSION_TYPE.AIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION && deal.facilities.details.hasBeenIssued,
        );
        cy.visit(relative(`/gef/application-details/${ainDealIssuedFacilitiesFuture._id}`));
        gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
      });
    });
    describe('MIN Deal', () => {
      it('should not allow a Maker to issue facilities in portal', () => {
        const minDealIssuedFacilitiesFuture = deals.find(
          (deal) =>
            deal.submissionType === DEAL_SUBMISSION_TYPE.MIN && deal.status === DEAL_STATUS.PENDING_CANCELLATION && deal.facilities.details.hasBeenIssued,
        );
        cy.visit(relative(`/gef/application-details/${minDealIssuedFacilitiesFuture._id}`));
        gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
      });
    });
  });
});
