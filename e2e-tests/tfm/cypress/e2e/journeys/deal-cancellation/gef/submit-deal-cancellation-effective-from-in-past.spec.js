import { TFM_DEAL_STAGE, TFM_FACILITY_STAGE } from '@ukef/dtfs2-common';
import relative from '../../../relativeURL';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../e2e-fixtures';
import caseDealPage from '../../../pages/caseDealPage';
import { today, yesterday } from '../../../../../../e2e-fixtures/dateConstants';
import dealsPage from '../../../pages/dealsPage';
import facilitiesPage from '../../../pages/facilitiesPage';
import { caseSubNavigation, successBanner } from '../../../partials';
import activitiesPage from '../../../pages/activities/activitiesPage';
import { MOCK_APPLICATION_AIN } from '../../../../fixtures/mock-gef-deals';
import { anIssuedCashFacility } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { DEAL_TYPE } from '../../../../../../gef/cypress/fixtures/constants';

context('Deal cancellation - submit cancellation with "effectiveFrom" in past', () => {
  let dealId;
  let facility;
  const ukefDealId = 10000001;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      // updates a gef deal so has relevant fields
      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [anIssuedCashFacility()], BANK1_MAKER1).then((createdFacility) => {
        facility = createdFacility.details;
      });

      cy.submitDeal(dealId, DEAL_TYPE.GEF, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    cy.deleteFacility(facility._id, BANK1_MAKER1);
  });

  describe('when logged in as a PIM user', () => {
    before(() => {
      cy.login(PIM_USER_1);
      cy.visit(relative(`/case/${dealId}/deal`));
    });

    describe('after submitting the cancellation', () => {
      it('should redirect you to the deal summary page with the success banner visible once', () => {
        caseDealPage.submitDealCancellation(dealId, yesterday.date);

        cy.url().should('eq', relative(`/case/${dealId}/deal`));

        successBanner().should('exist');
        cy.assertText(successBanner(), `Deal ${ukefDealId} cancelled`);

        cy.reload();
        successBanner().should('not.exist');
      });

      it('should not show the "Cancel Deal" button', () => {
        caseDealPage.cancelDealButton().should('not.exist');
      });

      it(`should show the deal status as ${TFM_DEAL_STAGE.CANCELLED}`, () => {
        cy.assertText(caseDealPage.dealStage(), TFM_DEAL_STAGE.CANCELLED);
      });

      it(`should show the facility statuses as ${TFM_FACILITY_STAGE.RISK_EXPIRED}`, () => {
        const facilityId = facility._id;

        cy.assertText(caseDealPage.dealFacilitiesTable.row(facilityId).facilityStage(), TFM_FACILITY_STAGE.RISK_EXPIRED);
      });

      it(`should show the deal stage on the "All deals" page as ${TFM_DEAL_STAGE.CANCELLED}`, () => {
        cy.visit(relative(`/deals/0`));

        const row = dealsPage.dealsTable.row(dealId);
        cy.assertText(row.stage(), TFM_DEAL_STAGE.CANCELLED);
      });

      it(`should show the facility stage on the "All facilities" page as ${TFM_FACILITY_STAGE.RISK_EXPIRED}`, () => {
        cy.visit(relative(`/facilities/0`));
        const facilityId = facility._id;

        const row = facilitiesPage.facilitiesTable.row(facilityId);
        cy.assertText(row.facilityStage(), TFM_FACILITY_STAGE.RISK_EXPIRED);
      });

      it('should add an entry on the activity and comments page', () => {
        caseSubNavigation.activityLink().click();

        activitiesPage.activitiesTimeline().contains('Deal stage:');
        activitiesPage.activitiesTimeline().contains('Cancelled');
        activitiesPage.activitiesTimeline().contains(`Bank request date: ${today.d_MMMM_yyyy}`);
        activitiesPage.activitiesTimeline().contains(`Date effective from: ${yesterday.d_MMMM_yyyy}`);
        activitiesPage.activitiesTimeline().contains(`Comments: -`);
      });
    });
  });
});
