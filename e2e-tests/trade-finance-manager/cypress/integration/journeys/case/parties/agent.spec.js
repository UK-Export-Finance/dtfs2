import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('User can view party details', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.visit(relative(`/case/${dealId}/parties`));
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });


  describe('Agent page', () => {
    it('should render edit page', () => {
      pages.partiesPage.agentEditLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/parties/agent`));
      pages.partiesPage.agentEditLink().should('not.exist');

      pages.agentPage.agentUniqueRefInput().should('exist');
      pages.agentPage.heading().should('have.text', 'Edit agent details');

      pages.agentPage.saveButton().should('exist');
      pages.agentPage.closeLink().should('exist');

      pages.agentPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/parties`));
    });

    it('should save entered details', () => {
      pages.partiesPage.agentEditLink().click();
      pages.agentPage.agentUniqueRefInput().type('agent partyurn');
      pages.agentPage.agentCommissionRateInput().type('2.5');

      pages.agentPage.saveButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/parties`));

      pages.agentPage.agentUniqueRef().invoke('text').then((text) => {
        expect(text.trim()).equal('agent partyurn');
      });
      pages.agentPage.agentCommissionRate().invoke('text').then((text) => {
        expect(text.trim()).equal('2.5');
      });

      pages.partiesPage.agentEditLink().click();
      pages.agentPage.agentUniqueRefInput().invoke('val').then((value) => {
        expect(value.trim()).equal('agent partyurn');
      });
      pages.agentPage.agentCommissionRateInput().invoke('val').then((value) => {
        expect(value.trim()).equal('2.5');
      });
    });
  });
});
