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
        const { dealType } = deal;

        const { mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType);
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


  describe('Indemnifier page', () => {
    it('should render edit page', () => {
      pages.partiesPage.indemnifierEditLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/parties/indemnifier`));
      pages.partiesPage.indemnifierEditLink().should('not.exist');

      pages.indemnifierPage.urnInput().should('exist');
      pages.indemnifierPage.heading().should('have.text', 'Edit indemnifier details');

      pages.indemnifierPage.saveButton().should('exist');
      pages.indemnifierPage.closeLink().should('exist');

      pages.indemnifierPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/parties`));
    });

    it('should save entered details', () => {
      const partyUrn = 'test partyurn';

      pages.partiesPage.indemnifierEditLink().click();
      pages.indemnifierPage.urnInput().type(partyUrn);

      pages.indemnifierPage.saveButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/parties`));

      pages.indemnifierPage.uniqueRef().invoke('text').then((text) => {
        expect(text.trim()).equal(partyUrn);
      });

      pages.partiesPage.indemnifierEditLink().click();
      pages.indemnifierPage.urnInput().invoke('val').then((value) => {
        expect(value.trim()).equal(partyUrn);
      });
    });
  });
});
