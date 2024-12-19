import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { MOCK_APPLICATION_MIA, MOCK_APPLICATION_MIN } from '../../../../fixtures/mock-gef-deals';
import { T1_USER_1, PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';
import CONSTANTS from '../../../../fixtures/constants';

import { anUnissuedCashFacility } from '../../../../../../e2e-fixtures/mock-gef-facilities';

context('Amendments page', () => {
  describe('AIN', () => {
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

    it('should render `add amendment` button if AIN and PIM user', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('exist');
      amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    });

    it('should NOT render `add amendment` button if AIN and not PIM user', () => {
      cy.login(T1_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });
  });

  describe('MIA', () => {
    let dealId;
    const dealFacilities = [];

    before(() => {
      cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
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

    it('should NOT renders `add amendment` button if MIA and PIM user', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });

    it('should NOT render `add amendment` button if MIA and not PIM user', () => {
      cy.login(T1_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });
  });

  describe('MIN', () => {
    let dealId;
    let dealFacilities;

    before(() => {
      // inserts a gef deal
      cy.insertOneGefDeal(MOCK_APPLICATION_MIA, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        cy.updateGefDeal(dealId, MOCK_APPLICATION_MIN, BANK1_MAKER1);

        cy.createGefFacilities(dealId, [anUnissuedCashFacility()], BANK1_MAKER1).then((createdFacilities) => {
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

    it('should render `add amendment` button if MIN and confirmed and PIM user', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('exist');
      amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    });

    it('should NOT render `add amendment` button if MIN and not confirmed and PIM user', () => {
      cy.login(T1_USER_1);
      const facilityId = dealFacilities._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });
  });
});
