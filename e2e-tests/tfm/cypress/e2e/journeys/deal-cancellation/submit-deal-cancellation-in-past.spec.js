import { TFM_DEAL_STAGE, TFM_FACILITY_STAGE } from '@ukef/dtfs2-common';
import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import { yesterday } from '../../../../../e2e-fixtures/dateConstants';
import checkDetailsPage from '../../pages/deal-cancellation/check-details';
import facilitiesPage from '../../pages/facilitiesPage';

context('Deal cancellation - effective from date in past', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, PIM_USER_1);
    });
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  describe('when logged in as a PIM user', () => {
    before(() => {
      cy.login(PIM_USER_1);

      cy.visit(relative(`/case/${dealId}/deal`));

      caseDealPage.cancelDealButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date`));
      cy.completeDateFormFields({ idPrefix: 'bank-request-date' });
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));
      cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: yesterday.date });
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      checkDetailsPage.dealDeletionButton().click();
    });

    it('should redirect you to the deal summary page', () => {
      cy.url().should('eq', relative(`/case/${dealId}/deal`));
    });

    it('should not show the "Cancel Deal" button', () => {
      caseDealPage.cancelDealButton().should('not.exist');
    });

    it('should show the deal status as "Cancelled"', () => {
      cy.assertText(caseDealPage.dealStage(), TFM_DEAL_STAGE.CANCELLED);
    });

    it('should show the facility statuses as "Risk Expired"', () => {
      const facilityId = dealFacilities[0]._id;

      cy.assertText(caseDealPage.dealFacilitiesTable.row(facilityId).facilityStage(), TFM_FACILITY_STAGE.RISK_EXPIRED);
    });

    it(`should show the facility stage on the "All facilities" page as ${TFM_FACILITY_STAGE.RISK_EXPIRED}`, () => {
      cy.visit(relative(`/facilities/0`));
      const facilityId = dealFacilities[0]._id;

      const row = facilitiesPage.facilitiesTable.row(facilityId);
      cy.assertText(row.facilityStage(), TFM_FACILITY_STAGE.RISK_EXPIRED);
    });
  });
});
