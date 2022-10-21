import Chance from 'chance';

const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const relative = require('../../../relativeURL');

const filters = dashboardFilters;

const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
  GEF_FACILITY_CASH,
  BSS_FACILITY_LOAN,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const chance = new Chance();

context('Dashboard facilities - sort', () => {
  const ALL_FACILITIES = [];
  const exporterNames = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then(({ _id }) => {
      cy.updateDeal(_id, {
        exporter: {
          companyName: chance.company(),
        },
        // adds company name to array
      }, BANK1_MAKER1).then((insertedDeal) => exporterNames.unshift(insertedDeal.exporter.companyName));

      const facilities = [
        BSS_FACILITY_LOAN,
      ];

      cy.createFacilities(_id, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility);
        });
      });
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then(({ _id }) => {
      cy.updateGefApplication(_id, {
        exporter: {
          companyName: chance.company(),
        },
        // adds company name to array
      }, BANK1_MAKER1).then((insertedDeal) => exporterNames.unshift(insertedDeal.exporter.companyName));
      GEF_FACILITY_CASH.dealId = _id;
      cy.insertOneGefFacility(GEF_FACILITY_CASH, BANK1_MAKER1).then((insertedFacility) => {
        ALL_FACILITIES.push(insertedFacility);
      });
    });
  });

  it('should show exporter column on facilities tab in insertion order', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    dashboardFacilities.rows().should('have.length', 2);

    dashboardFacilities.rows().eq(0).find('td').eq(0)
      .contains(exporterNames[0]);

    dashboardFacilities.rows().eq(1).find('td').eq(0)
      .contains(exporterNames[1]);
  });

  it('should only display one facility with exporter name when submitting filter', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply filter for first exporter name
    filters.panel.form.keyword.input().type(exporterNames[0]);
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/facilities/0'));

    dashboardFacilities.rows().should('have.length', 1);

    dashboardFacilities.rows().eq(0).find('td').eq(0)
      .contains(exporterNames[0]);

    filters.showHideButton().click();

    // apply filter for second exporter name
    filters.panel.form.keyword.input().clear().type(exporterNames[1]);
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/facilities/0'));

    dashboardFacilities.rows().should('have.length', 1);

    dashboardFacilities.rows().eq(0).find('td').eq(0)
      .contains(exporterNames[1]);
  });
});
