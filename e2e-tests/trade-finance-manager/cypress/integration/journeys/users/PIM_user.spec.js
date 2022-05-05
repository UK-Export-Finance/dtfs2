import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import partials from '../../partials';
import pages from '../../pages';

import { PIM_USER_1 } from '../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../fixtures/users-portal';

context('PIM User', () => {
  describe('PIM user should have read-only access', () => {
    let dealId;
    const dealFacilities = [];

    before(() => {
      cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType);
      });
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN_LOGIN);
      dealFacilities.forEach((facility) => {
        cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
      });
    });

    it('it should not allow PIM users to assign a lead underwriter', () => {
      cy.login(PIM_USER_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      partials.caseSubNavigation.underwritingLink().click();
      partials.underwritingSubNav.leadUnderwriterLink().click();

      pages.leadUnderwriterPage.assignLeadUnderwriterLink().should('not.exist');
      pages.leadUnderwriterPage.changeLeadUnderwriterLink().should('not.exist');
    });

    it('it should not allow PIM users to change the facility risk profile', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));

      partials.caseSubNavigation.underwritingLink().click();

      // change link should not be visible
      const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

      facilityRow.changeRiskProfileLink().should('not.exist');

      pages.underwritingPricingAndRiskPage.addRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeLossGivenDefaultLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');
    });

    it('it should not allow PIM users to set underwriter manager decision', () => {
      cy.login(PIM_USER_1);

      cy.visit(relative(`/case/${dealId}/deal`));

      partials.caseSubNavigation.underwritingLink().click();

      partials.underwritingSubNav.underwriterManagerDecisionLink().click();

      pages.managersDecisionPage.addDecisionLink().should('not.exist');
    });
  });
});
