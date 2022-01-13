const { gefFacilitiesDashboard } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const dummyDeal = {
  bank: { id: MAKER_LOGIN.bank.id },
  bankInternalRefName: 'Mock GEF exporter',
};

let deal;
let facilities;

context('Dashboard Deals pagination controls', () => {
  before(() => {
    cy.deleteGefApplications(MAKER_LOGIN);
    cy.insertOneGefApplication(dummyDeal, MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;

        const dummyFacilities = new Array(21).fill('').map((_, i) => ({
          dealId: deal._id,
          type: 'Cash',
          name: `abc-${i + 1}-def`,
        }));

        cy.insertManyGefFacilities(dummyFacilities, MAKER_LOGIN)
          .then((insertedFacilities) => { facilities = insertedFacilities; });
      });
  });

  after(() => {
    cy.deleteGefFacilities(MAKER_LOGIN, deal._id);
  });

  it('Dashboard Deals displays 20 results, the total number of items, and working First/Previous/Next/Last links.', () => {
    // login and go to the dashboard
    cy.login(MAKER_LOGIN);
    gefFacilitiesDashboard.visit();

    // deals will be shown in update order, so expect them upsidedown..
    const page1 = facilities.slice(1, 21).reverse();
    const page2 = [facilities[0]];

    // test ininital dashboard page
    gefFacilitiesDashboard.confirmFacilitiesPresent(page1);
    gefFacilitiesDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    // prove the Next button
    gefFacilitiesDashboard.next().click();
    gefFacilitiesDashboard.confirmFacilitiesPresent(page2);

    // prove the Previous button
    gefFacilitiesDashboard.previous().click();
    gefFacilitiesDashboard.confirmFacilitiesPresent(page1);

    // prove the Last button
    gefFacilitiesDashboard.last().click();
    gefFacilitiesDashboard.confirmFacilitiesPresent(page2);

    // prove the First button
    gefFacilitiesDashboard.first().click();
    gefFacilitiesDashboard.confirmFacilitiesPresent(page1);
  });
});
