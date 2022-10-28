import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Parties - user can view and edit agent', () => {
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

  describe('Agent page', () => {
    describe('when user is in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(BUSINESS_SUPPORT_USER_1);
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

        pages.agentPage.saveButton().click();

        pages.agentPage.errorSummary().contains('Enter a unique reference number');
        pages.agentPage.urnError().contains('Enter a unique reference number');

        pages.agentPage.agentUniqueRefInput().clear();
        pages.agentPage.agentUniqueRefInput().type('agent partyurn');

        pages.agentPage.saveButton().click();

        pages.agentPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type('12');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/agent`));
        pages.agentPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type('ABC123');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/agent`));
        pages.agentPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type('"!£!"£!"£!"£');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/agent`));
        pages.agentPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type('1234!');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/agent`));
        pages.agentPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type(' ');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/agent`));
        pages.agentPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');
      });

      it('should save entered details if partyUrn correctly entered', () => {
        const partyUrn = '12345';

        pages.partiesPage.agentEditLink().click();
        pages.agentPage.agentCommissionRateInput().type('2.5');
        pages.agentPage.agentUniqueRefInput().clear();
        pages.agentPage.agentUniqueRefInput().type(partyUrn);

        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.agentPage.agentUniqueRef().invoke('text').then((text) => {
          expect(text.trim()).equal(partyUrn);
        });
        pages.agentPage.agentCommissionRate().invoke('text').then((text) => {
          expect(text.trim()).equal('2.5');
        });
      });
    });

    describe('when user is NOT in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
      });

      it('user cannot manually to the page', () => {
        cy.visit(`/case/${dealId}/parties/agent`);
        cy.url().should('eq', relative('/not-found'));
      });
    });
  });
});
