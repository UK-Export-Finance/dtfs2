import { RandomValueGenerator } from '../../../../../../support/random-value-generator';

const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { dashboardDeals } = require('../../../pages');
const { BSS_DEAL_DRAFT, GEF_DEAL_DRAFT } = require('../fixtures');

const { dashboardFilters } = require('../../../partials');

const filters = dashboardFilters;

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;
const randomValueGenerator = new RandomValueGenerator();

context('Dashboard Deals filters - filtering deal on wrong pagination page from deal', () => {
  const exporterNames = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    // insert and update deals with random company names
    const manyBssDeals = Array.from(Array(15), () => BSS_DEAL_DRAFT);
    manyBssDeals.map((deal) => {
      cy.insertOneDeal(deal, BANK1_MAKER1).then(({ _id }) => {
        const companyName = randomValueGenerator.companyName();
        cy.updateDeal(
          _id,
          {
            exporter: {
              companyName,
            },
            // adds company name to array
          },
          BANK1_MAKER1,
        ).then((insertedDeal) => exporterNames.unshift(insertedDeal.exporter.companyName));
      });

      return deal;
    });

    const manyGefDeals = Array.from(Array(15), () => GEF_DEAL_DRAFT);
    manyGefDeals.map((deal) => {
      cy.insertOneGefApplication(deal, BANK1_MAKER1).then(({ _id }) => {
        cy.updateGefApplication(
          _id,
          {
            exporter: {
              companyName: randomValueGenerator.companyName(),
            },
            // adds company name to array
          },
          BANK1_MAKER1,
        ).then((insertedDeal) => exporterNames.unshift(insertedDeal.exporter.companyName));
      });
      return deal;
    });
  });

  it('should show filtered deal', () => {
    cy.login(BANK1_MAKER1);

    dashboardDeals.visit();
    dashboardDeals.next().click();

    const dealToFilter = exporterNames[0];

    filters.showHideButton().click();
    filters.panel.form.keyword.input().type(dealToFilter);
    filters.panel.form.applyFiltersButton().click();

    dashboardDeals.rows().should('have.length', 1);

    dashboardDeals.rows().eq(0).find('td').eq(0).contains(dealToFilter);
  });
});
