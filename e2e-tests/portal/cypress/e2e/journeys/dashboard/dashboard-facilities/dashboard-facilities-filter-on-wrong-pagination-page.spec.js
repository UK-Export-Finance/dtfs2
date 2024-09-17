import { RandomValueGenerator } from '../../../../../../support/random-value-generator';

const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { dashboardFacilities } = require('../../../pages');
const { BSS_DEAL_DRAFT, GEF_DEAL_DRAFT, GEF_FACILITY_CASH, BSS_FACILITY_LOAN } = require('../fixtures');
const { dashboardFilters } = require('../../../partials');

const filters = dashboardFilters;

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const randomValueGenerator = new RandomValueGenerator();

context('Dashboard facilities - filtering facility on wrong pagination page from facility', () => {
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

        const facilities = [BSS_FACILITY_LOAN];

        cy.createFacilities(_id, facilities, BANK1_MAKER1);
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
        GEF_FACILITY_CASH.dealId = _id;
        cy.insertOneGefFacility(GEF_FACILITY_CASH, BANK1_MAKER1);
      });
      return deal;
    });
  });

  it('should show filtered facility', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    // go to next page (different page to facility we are searching for)
    dashboardFacilities.next().click();

    filters.showHideButton().click();

    const facilityToSearch = exporterNames[0];

    cy.keyboardInput(filters.panel.form.keyword.input(), facilityToSearch);
    filters.panel.form.applyFiltersButton().click();

    dashboardFacilities.rows().should('have.length', 1);

    dashboardFacilities.rows().eq(0).find('td').eq(0).contains(facilityToSearch);
  });
});
