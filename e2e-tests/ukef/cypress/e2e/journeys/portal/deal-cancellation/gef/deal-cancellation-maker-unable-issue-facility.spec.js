import { DEAL_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import gefPages from '../../../../../../../gef/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT, MOCK_APPLICATION_MIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility, anUnissuedCashFacility, multipleMockGefFacilities } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { yesterday, tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';

import { TFM_URL, PIM_USER_1 } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Deal cancellation', () => {
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
        const deal = { ...insertedDeal };

        // updates a gef deal so has relevant fields
        cy.updateGefDeal(deal._id, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

        cy.createGefFacilities(deal._id, [facilities[index]], BANK1_MAKER1).then((createdFacilities) => {
          deal.facilities = createdFacilities;
          cy.makerSubmitGefDealForReview(deal);
          cy.checkerSubmitGefDealToUkef(deal);
          cy.clearCookie('dtfs-session');
          cy.clearCookie('_csrf');
          cy.getCookies().should('be.empty');

          cy.forceVisit(TFM_URL);
          cy.tfmLogin(PIM_USER_1);
          const effectiveDate = index % 2 === 0 ? tomorrow.date : yesterday.date;
          cy.submitDealCancellation({ dealId: deal._id, effectiveDate });
          // get deal with updated status for cancellation in past or in the future
          cy.getOneDeal(deal._id, BANK1_MAKER1).then((response) => deals.push({ ...response.deal, facilities: createdFacilities }));
        });
      });
    });
  });

  beforeEach(() => {
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
    cy.login(BANK1_MAKER1);
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  describe('Deal cancellations on tfm with effective dates in the past', () => {
    it('Gef AIN deal with issued facilities is submitted to UKEF, user cancel deal in the past in TFM. Maker unable to issue facility on portal', () => {
      const ainDealIssuedFacilitiesPast = deals.find(
        (deal) =>
          deal.submissionType === DEAL_SUBMISSION_TYPE.AIN &&
          deal.status === DEAL_STATUS.CANCELLED &&
          deal.facilities.find((facility) => facility.hasBeenIssued),
      );
      gefPages.applicationDetails.visit(ainDealIssuedFacilitiesPast._id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef AIN deal with unissued facilities is submitted to UKEF, user cancel deal in the past in TFM. Maker unable to issue facility on portal', () => {
      const ainDealUnissuedFacilitiesPast = deals.find(
        (deal) =>
          deal.submissionType === DEAL_SUBMISSION_TYPE.AIN &&
          deal.status === DEAL_STATUS.CANCELLED &&
          deal.facilities.find((facility) => !facility.hasBeenIssued),
      );
      gefPages.applicationDetails.visit(ainDealUnissuedFacilitiesPast._id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef MIN deal with issued facilities is submitted to UKEF, user cancel deal in the past in TFM. Maker unable to issue facility on portal', () => {
      const minDealIssuedFacilitiesPast = deals.find(
        (deal) =>
          deal.submissionType === DEAL_SUBMISSION_TYPE.MIN &&
          deal.status === DEAL_STATUS.CANCELLED &&
          deal.facilities.find((facility) => facility.hasBeenIssued),
      );
      gefPages.applicationDetails.visit(minDealIssuedFacilitiesPast._id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef MIN deal with unissued facilities is submitted to UKEF, user cancel deal in the past in TFM. Maker unable issue facility on portal', () => {
      const minDealUnissuedFacilitiesPast = deals.find(
        (deal) =>
          deal.submissionType === DEAL_SUBMISSION_TYPE.MIN &&
          deal.status === DEAL_STATUS.CANCELLED &&
          deal.facilities.find((facility) => !facility.hasBeenIssued),
      );
      gefPages.applicationDetails.visit(minDealUnissuedFacilitiesPast._id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });
  });

  describe('Deal cancellations on tfm with effective dates in the future', () => {
    it('Gef AIN deal with issued facilities is submitted to UKEF, user cancel deal in the future in TFM. Maker unable to issue facility on portal', () => {
      const ainDealIssuedFacilitiesFuture = deals.find(
        (deal) =>
          deal.submissionType === DEAL_SUBMISSION_TYPE.AIN &&
          deal.status === DEAL_STATUS.PENDING_CANCELLATION &&
          deal.facilities.find((facility) => facility.hasBeenIssued),
      );
      gefPages.applicationDetails.visit(ainDealIssuedFacilitiesFuture._id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef AIN deal with unissued facilities is submitted to UKEF, user cancel deal in the future in TFM. Maker unable to issue facility on portal', () => {
      const ainDealUnissuedFacilitiesFuture = deals.find(
        (deal) =>
          deal.submissionType === DEAL_SUBMISSION_TYPE.AIN &&
          deal.status === DEAL_STATUS.PENDING_CANCELLATION &&
          deal.facilities.find((facility) => !facility.hasBeenIssued),
      );
      gefPages.applicationDetails.visit(ainDealUnissuedFacilitiesFuture._id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef MIN deal with issued facilities is submitted to UKEF, user cancel deal in the future in TFM. Maker unable to issue facility on portal', () => {
      const minDealIssuedFacilitiesFuture = deals.find(
        (deal) =>
          deal.submissionType === DEAL_SUBMISSION_TYPE.MIN &&
          deal.status === DEAL_STATUS.PENDING_CANCELLATION &&
          deal.facilities.find((facility) => facility.hasBeenIssued),
      );
      gefPages.applicationDetails.visit(minDealIssuedFacilitiesFuture._id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef MIN deal with unissued facilities is submitted to UKEF, user cancel deal in the future in TFM. Maker unable issue facility on portal', () => {
      const minDealUnissuedFacilitiesFuture = deals.find(
        (deal) =>
          deal.submissionType === DEAL_SUBMISSION_TYPE.MIN &&
          deal.status === DEAL_STATUS.PENDING_CANCELLATION &&
          deal.facilities.find((facility) => !facility.hasBeenIssued),
      );
      gefPages.applicationDetails.visit(minDealUnissuedFacilitiesFuture._id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });
  });
});
