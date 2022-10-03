import Chance from 'chance';

const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardFacilities } = require('../../../pages');
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

    // insert and update deals with random company names
    const manyBssDeals = Array.from(Array(15), () => BSS_DEAL_DRAFT);
    manyBssDeals.map((deal) => {
      cy.insertOneDeal(deal, BANK1_MAKER1).then(({ _id }) => {
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

      return deal;
    });

    const manyGefDeals = Array.from(Array(15), () => GEF_DEAL_DRAFT);
    manyGefDeals.map((deal) => {
      cy.insertOneGefApplication(deal, BANK1_MAKER1).then(({ _id }) => {
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
      return deal;
    });
  });

  it('should show exporter column on facilities tab in insertion order', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    dashboardFacilities.rows().should('be.visible');
    dashboardFacilities.exporterButton().contains('Exporter');

    dashboardFacilities.rows().eq(0).find('td').eq(0)
      .contains(exporterNames[0]);

    dashboardFacilities.rows().eq(19).find('td').eq(0)
      .contains(exporterNames[19]);

    dashboardFacilities.next().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0)
      .contains(exporterNames[20]);

    dashboardFacilities.rows().eq(5).find('td').eq(0)
      .contains(exporterNames[25]);
  });

  it('should sort exporter alphabetically ascending if exporter button is clicked on facility page', () => {
    // sorts array alphabetically
    exporterNames.sort();
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    dashboardFacilities.exporterButton().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0)
      .contains(exporterNames[0]);

    dashboardFacilities.rows().eq(19).find('td').eq(0)
      .contains(exporterNames[19]);

    dashboardFacilities.next().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0)
      .contains(exporterNames[20]);

    dashboardFacilities.rows().eq(5).find('td').eq(0)
      .contains(exporterNames[25]);
  });

  it('should sort alphabetically descending if exporter is clicked twice', () => {
    // sorts array and then reverses so in reverse order
    exporterNames.sort().reverse();
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    dashboardFacilities.exporterButton().click();
    dashboardFacilities.exporterButton().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0)
      .contains(exporterNames[0]);

    dashboardFacilities.rows().eq(19).find('td').eq(0)
      .contains(exporterNames[19]);

    dashboardFacilities.next().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0)
      .contains(exporterNames[20]);

    dashboardFacilities.rows().eq(5).find('td').eq(0)
      .contains(exporterNames[25]);
  });
});
