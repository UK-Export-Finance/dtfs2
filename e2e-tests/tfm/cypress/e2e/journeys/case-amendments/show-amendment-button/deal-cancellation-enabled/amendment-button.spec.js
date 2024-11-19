import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../../fixtures/deal-AIN';
import { T1_USER_1, PIM_USER_1, BANK1_MAKER1 } from '../../../../../../../e2e-fixtures';

context('Amendments page - deal cancellation feature flag enabled', () => {
  describe('cancelled deal', () => {
    let dealId;
    const dealFacilities = [];

    before(() => {
      cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType, T1_USER_1);
        cy.login(PIM_USER_1);

        cy.submitDealCancellation({ dealId });
      });
    });

    it('should NOT render `add amendment` button', () => {
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });
  });
});
