import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Parties - user can view and edit agent', () => {
  let dealId;
  const dealFacilities = [];
  const businessSupportUser = MOCK_USERS.find((user) => user.teams.includes('BUSINESS_SUPPORT'));
  const nonBusinessSupportUser = MOCK_USERS.find((user) => !user.teams.includes('BUSINESS_SUPPORT'));

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

  describe('Agent page', () => {
    describe('when user is in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(businessSupportUser);
        cy.visit(relative(`/case/${dealId}/parties`));
      });

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
        pages.agentPage.agentUniqueRefInput().clear();
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

    describe('when user is NOT in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(nonBusinessSupportUser);
      });

      it('user cannot manually to the page', () => {
        cy.visit(`/case/${dealId}/parties/agent`);
        cy.url().should('eq', relative('/not-found'));
      });
    });
  });
});
