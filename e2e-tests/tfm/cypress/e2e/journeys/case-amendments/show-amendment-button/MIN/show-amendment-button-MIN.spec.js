import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import { MOCK_APPLICATION_MIA, MOCK_APPLICATION_MIN } from '../../../../../fixtures/mock-gef-deals';
import { MOCK_FACILITY_ONE } from '../../../../../fixtures/mock-gef-facilities';
import { T1_USER_1, PIM_USER_1, BANK1_MAKER1 } from '../../../../../../../e2e-fixtures';

import CONSTANTS from '../../../../../fixtures/constants';

context('Amendments page - show amendment button - MIN', () => {
  let dealId;
  let dealFacilities;

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      // updates a gef deal so has relevant fields
      cy.updateGefDeal(dealId, MOCK_APPLICATION_MIN, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [MOCK_FACILITY_ONE], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities = createdFacilities.details;
      });

      cy.submitDeal(dealId, CONSTANTS.DEAL_TYPE.GEF, PIM_USER_1);

      const statusConfirmed = {
        tfm: {
          stage: 'Confirmed',
        },
      };
      cy.updateTFMDeal(dealId, statusConfirmed);
    });
  });

  it('should render `add amendment` button when confirmed and PIM user', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
  });

  it('should NOT render `add amendment` button when not confirmed and NOT a PIM user', () => {
    cy.login(T1_USER_1);
    const facilityId = dealFacilities._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('not.exist');
  });
});
