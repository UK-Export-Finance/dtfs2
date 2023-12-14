import { RandomValueGenerator } from '../../../../../../support/random-value-generator';

const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { dashboardFacilities } = require('../../../pages');
const { BSS_DEAL_DRAFT, GEF_DEAL_DRAFT, GEF_FACILITY_CASH, BSS_FACILITY_LOAN } = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const randomValueGenerator = new RandomValueGenerator();

context('Dashboard facilities - sort', () => {
  const ALL_FACILITIES = [];
  const exporterNames = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    // insert and update deals with random company names
    const manyBssDeals = Array.from(Array(15), () => BSS_DEAL_DRAFT);
    manyBssDeals.map((deal, index) => {
      cy.insertOneDeal(deal, BANK1_MAKER1).then(({ _id }) => {
        let companyName = '';
        // sets one company to lowercase
        if (index === 3) {
          companyName = randomValueGenerator.companyName({ lowerCase: true });
        } else {
          companyName = randomValueGenerator.companyName();
        }
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

    dashboardFacilities.rows().eq(0).find('td').eq(0).contains(exporterNames[0]);

    dashboardFacilities.rows().eq(19).find('td').eq(0).contains(exporterNames[19]);

    dashboardFacilities.next().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0).contains(exporterNames[20]);

    dashboardFacilities.rows().eq(5).find('td').eq(0).contains(exporterNames[25]);
  });

  it('should sort exporter alphabetically ascending if exporter button is clicked on facility page', () => {
    // sorts array alphabetically
    exporterNames.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    dashboardFacilities.exporterButton().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0).contains(exporterNames[0]);

    dashboardFacilities.rows().eq(19).find('td').eq(0).contains(exporterNames[19]);

    dashboardFacilities.next().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0).contains(exporterNames[20]);

    dashboardFacilities.rows().eq(5).find('td').eq(0).contains(exporterNames[25]);
  });

  it('should sort alphabetically descending if exporter is clicked twice', () => {
    // sorts array and then reverses so in reverse order
    exporterNames.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reverse();
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    dashboardFacilities.exporterButton().click();
    dashboardFacilities.exporterButton().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0).contains(exporterNames[0]);

    dashboardFacilities.rows().eq(19).find('td').eq(0).contains(exporterNames[19]);

    dashboardFacilities.next().click();

    dashboardFacilities.rows().eq(0).find('td').eq(0).contains(exporterNames[20]);

    dashboardFacilities.rows().eq(5).find('td').eq(0).contains(exporterNames[25]);
  });
});
