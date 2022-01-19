const { BSS_DEAL_DRAFT, GEF_DEAL_DRAFT } = require('./mocks');
const mockUsers = require('../../../fixtures/mockUsers');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

describe('Dashboard Deals filters - filter by keyword', () => {
  const MOCK_KEYWORD = 'Special exporter';
  const ALL_DEALS = [];

  const BSS_DEAL_SPECIAL_EXPORTER = {
    ...BSS_DEAL_DRAFT,
    exporter: {
      companyName: MOCK_KEYWORD,
    },
  };
  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_SPECIAL_EXPORTER, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });
});
