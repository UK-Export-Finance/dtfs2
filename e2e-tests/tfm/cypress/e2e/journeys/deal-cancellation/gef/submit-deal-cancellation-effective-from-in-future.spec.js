import { TFM_DEAL_STAGE, TFM_FACILITY_STAGE } from '@ukef/dtfs2-common';
import relative from '../../../relativeURL';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../e2e-fixtures';
import caseDealPage from '../../../pages/caseDealPage';
import { today, tomorrow } from '../../../../../../e2e-fixtures/dateConstants';
import checkDetailsPage from '../../../pages/deal-cancellation/check-details';
import dealsPage from '../../../pages/dealsPage';
import { caseSubNavigation, successBanner } from '../../../partials';
import facilitiesPage from '../../../pages/facilitiesPage';
import activitiesPage from '../../../pages/activities/activitiesPage';
import { MOCK_APPLICATION_AIN } from '../../../../fixtures/mock-gef-deals';
import { anIssuedCashFacility } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { DEAL_TYPE } from '../../../../../../gef/cypress/fixtures/constants';

context('Deal cancellation - submit cancellation with "effectiveFrom" in future', () => {
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

  const submitDealCancellation = () => {
    caseDealPage.cancelDealButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date`));
    cy.completeDateFormFields({ idPrefix: 'bank-request-date' });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));
    cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: tomorrow.date });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
    checkDetailsPage.dealDeletionButton().click();
  };

  describe('when logged in as a PIM user', () => {
    before(() => {
      cy.login(PIM_USER_1);
      cy.visit(relative(`/case/${dealId}/deal`));
      submitDealCancellation();
    });

    describe('after submitting the cancellation', () => {
      const expectedSuccessBannerText = `Deal ${ukefDealId} scheduled for cancellation on ${tomorrow.d_MMMM_yyyy}`;

      it('should redirect you to the deal summary page', () => {
        cy.url().should('eq', relative(`/case/${dealId}/deal`));
      });

      it('should display the deal cancelled banner which should persist on page reload', () => {
        cy.url().should('eq', relative(`/case/${dealId}/deal`));

        successBanner().should('exist');
        cy.assertText(successBanner(), expectedSuccessBannerText);

        cy.reload();
        successBanner().should('exist');
        cy.assertText(successBanner(), expectedSuccessBannerText);
      });

      it('should not show the "Cancel Deal" button', () => {
        caseDealPage.cancelDealButton().should('not.exist');
      });

      it('should show the original deal status', () => {
        cy.assertText(caseDealPage.dealStage(), TFM_DEAL_STAGE.CONFIRMED);
      });

      it(`should show the original facility statuses`, () => {
        const facilityId = facility._id;

        cy.assertText(caseDealPage.dealFacilitiesTable.row(facilityId).facilityStage(), TFM_FACILITY_STAGE.ISSUED);
      });

      it(`should show the original deal stage on the "All deals" page`, () => {
        cy.visit(relative(`/deals/0`));

        const row = dealsPage.dealsTable.row(dealId);
        cy.assertText(row.stage(), TFM_DEAL_STAGE.CONFIRMED);
      });

      it(`should show the original facility stage on the "All facilities" page`, () => {
        cy.visit(relative(`/facilities/0`));
        const facilityId = facility._id;

        const row = facilitiesPage.facilitiesTable.row(facilityId);
        cy.assertText(row.facilityStage(), TFM_FACILITY_STAGE.ISSUED);
      });

      it('should add an entry on the activity and comments page', () => {
        caseSubNavigation.activityLink().click();

        activitiesPage.activitiesTimeline().contains('Deal stage:');
        activitiesPage.activitiesTimeline().contains('Cancelled');
        activitiesPage.activitiesTimeline().contains(`Bank request date: ${today.d_MMMM_yyyy}`);
        activitiesPage.activitiesTimeline().contains(`Date effective from: ${tomorrow.d_MMMM_yyyy}`);
        activitiesPage.activitiesTimeline().contains(`Comments: -`);
      });

      it('should display the cancellation success banner on each of the other sub navigation tabs', () => {
        caseSubNavigation.tasksLink().click();
        cy.assertText(successBanner(), expectedSuccessBannerText);

        caseSubNavigation.partiesLink().click();
        cy.assertText(successBanner(), expectedSuccessBannerText);

        caseSubNavigation.documentsLink().click();
        cy.assertText(successBanner(), expectedSuccessBannerText);

        caseSubNavigation.activityLink().click();
        cy.assertText(successBanner(), expectedSuccessBannerText);

        caseSubNavigation.underwritingLink().click();
        cy.assertText(successBanner(), expectedSuccessBannerText);
      });
    });
  });
});
