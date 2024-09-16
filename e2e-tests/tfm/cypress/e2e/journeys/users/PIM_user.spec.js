import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import partials from '../../partials';
import pages from '../../pages';

import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('PIM User', () => {
  describe('PIM user should have read-only access', () => {
    let dealId;
    const dealFacilities = [];

    before(() => {
      cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType, PIM_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
      dealFacilities.forEach((facility) => {
        cy.deleteFacility(facility._id, BANK1_MAKER1);
      });
    });

    it('should not allow PIM users to assign a lead underwriter', () => {
      cy.login({ user: PIM_USER_1 });
      cy.visit(relative(`/case/${dealId}/deal`));

      pages.leadUnderwriterPage.assignLeadUnderwriterLink().should('not.exist');
      pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('not.exist');
    });

    it('should not allow PIM users to change the facility risk profile', () => {
      cy.login({ user: PIM_USER_1 });
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));

      partials.caseSubNavigation.underwritingLink().click();

      // change link should not be visible
      const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

      facilityRow.changeRiskProfileLink().should('not.exist');

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeLossGivenDefaultLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');
    });

    it('should not allow PIM users to set underwriter manager decision', () => {
      cy.login({ user: PIM_USER_1 });

      cy.visit(relative(`/case/${dealId}/deal`));

      partials.caseSubNavigation.underwritingLink().click();

      pages.managersDecisionPage.addDecisionLink().should('not.exist');
    });
  });
});
