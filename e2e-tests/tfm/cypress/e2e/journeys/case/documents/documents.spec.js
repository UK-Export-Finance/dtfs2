import relative from '../../../relativeURL';
import partials from '../../../partials';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { T1_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

context('Documents', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, T1_USER_1);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  context('eStore', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to documents page
      partials.caseSubNavigation.documentsLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/documents`));
    });
  });
});
