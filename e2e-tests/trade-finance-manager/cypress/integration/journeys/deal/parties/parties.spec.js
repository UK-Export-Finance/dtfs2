import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL from '../../../../fixtures/deal';

const MOCK_MAKER_TFM = {
  username: 'MAKER-TFM',
  password: 'AbC!2345',
  firstname: 'Tamil',
  surname: 'Rahani',
  email: 'maker@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'checker@ukexportfinance.gov.uk',
    ],
  },
};

const ADMIN_LOGIN = {
  username: 'ADMIN',
  password: 'AbC!2345',
  firstname: 'Julius',
  surname: 'No',
  email: '',
  timezone: 'Europe/London',
  roles: ['maker', 'editor', 'admin'],
  bank: {
    id: '*',
  },
};

context('User can view party details', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.visit(relative(`/case/deal/${dealId}`));
        pages.caseDealPage.partiesLink().click();
      });
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  describe('Parties pages', () => {
    it('should render components in party page', () => {
      cy.url().should('eq', relative(`/case/parties/${dealId}`));

      pages.partiesPage.exporterArea().should('exist');
      pages.partiesPage.buyerArea().should('exist');
      pages.partiesPage.agentArea().should('exist');
      pages.partiesPage.indemnifierArea().should('exist');

      pages.partiesPage.exporterEditLink().should('have.length', 1);
      pages.partiesPage.buyerEditLink().should('have.length', 1);
      pages.partiesPage.agentEditLink().should('have.length', 1);
      pages.partiesPage.indemnifierEditLink().should('have.length', 1);
    });
  });
});
