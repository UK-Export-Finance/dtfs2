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


  describe('Buyer page', () => {
    it('should render edit page', () => {
      pages.partiesPage.buyerEditLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/parties/buyer`));
      pages.partiesPage.buyerEditLink().should('not.exist');

      pages.buyerPage.urnInput().should('exist');
      pages.buyerPage.heading().should('have.text', 'Edit buyer details');

      pages.buyerPage.saveButton().should('exist');
      pages.buyerPage.closeLink().should('exist');

      pages.buyerPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/parties`));
    });

    it('should save entered details', () => {
      const partyUrn = 'test partyurn';

      pages.partiesPage.buyerEditLink().click();
      pages.buyerPage.urnInput().type(partyUrn);

      pages.buyerPage.saveButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/parties`));

      pages.buyerPage.uniqueRef().invoke('text').then((text) => {
        expect(text.trim()).equal(partyUrn);
      });

      pages.partiesPage.buyerEditLink().click();
      pages.buyerPage.urnInput().invoke('val').then((value) => {
        expect(value.trim()).equal(partyUrn);
      });
    });
  });
});
