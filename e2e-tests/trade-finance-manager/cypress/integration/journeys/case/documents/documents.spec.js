import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Documents', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL_MIA._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
        const { dealType } = deal;

        const { mockFacilities } = MOCK_DEAL_MIA;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType);
      });
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  context('eStore', () => {
    beforeEach(() => {
      cy.login(MOCK_USERS[0]);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to documents page
      partials.caseSubNavigation.documentsLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/documents`));
    });

    it('should display a link to eStore', () => {
      pages.documentsPage.eStoreLink().invoke('text').then((value) => {
        expect(value.trim()).equal('View in eStore');
      });
    });
  });
});
