import Chance from 'chance';

const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardDeals } = require('../../../pages');
const {
  BSS_DEAL_MIA,
  GEF_DEAL_DRAFT,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;
const chance = new Chance();

context('Dashboard Deals filters - filter by multiple fields with multiple values', () => {
  const ALL_DEALS = [];
  const GEF_DEAL = { ...GEF_DEAL_DRAFT };

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);
    // insert and update deals with random company names
    const manyBssDeals = Array.from(Array(13), () => BSS_DEAL_MIA);
    manyBssDeals.map((deal) => {
      cy.insertOneDeal(deal, BANK1_MAKER1).then(({ _id }) => {
        cy.updateDeal(_id, {
          exporter: {
            companyName: chance.company(),
          },
          // adds company name to array
        }, BANK1_MAKER1).then((insertedDeal) => ALL_DEALS.unshift(insertedDeal.exporter.companyName));
      });
      return deal;
    });

    const manyGefDeals = Array.from(Array(13), () => GEF_DEAL);
    manyGefDeals.map((deal) => {
      cy.insertOneGefApplication(deal, BANK1_MAKER1).then(({ _id }) => {
        cy.updateGefApplication(_id, {
          exporter: {
            companyName: chance.company(),
          },
          // adds company name to array
        }, BANK1_MAKER1).then((insertedDeal) => ALL_DEALS.unshift(insertedDeal.exporter.companyName));
      });
      return deal;
    });
  });

  describe('Sort dashboard alphabetically - Company name', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should have the deals in insertion order (not alphabetical)', () => {
      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[0]);

      dashboardDeals.rows().eq(19).find('td').eq(0)
        .contains(ALL_DEALS[19]);

      dashboardDeals.next().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[20]);

      dashboardDeals.rows().eq(5).find('td').eq(0)
        .contains(ALL_DEALS[25]);
    });

    it('should sort alphabetically ascending if exporter is clicked ', () => {
      // sorts array alphabetically
      ALL_DEALS.sort();
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));

      dashboardDeals.exporterButton().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[0]);

      dashboardDeals.rows().eq(19).find('td').eq(0)
        .contains(ALL_DEALS[19]);

      dashboardDeals.next().click();
      dashboardDeals.exporterButton().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[20]);

      dashboardDeals.rows().eq(5).find('td').eq(0)
        .contains(ALL_DEALS[25]);
    });

    it('should sort alphabetically descending if exporter is clicked twice', () => {
      // sorts array and then reverses so in reverse order
      ALL_DEALS.sort().reverse();
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));

      dashboardDeals.exporterButton().click();
      dashboardDeals.exporterButton().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[0]);

      dashboardDeals.rows().eq(19).find('td').eq(0)
        .contains(ALL_DEALS[19]);

      dashboardDeals.next().click();
      dashboardDeals.exporterButton().click();
      dashboardDeals.exporterButton().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[20]);

      dashboardDeals.rows().eq(5).find('td').eq(0)
        .contains(ALL_DEALS[25]);
    });
  });
});
