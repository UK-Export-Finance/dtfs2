/* eslint-disable no-undef */
const { gefDashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.roles.length === 1));

const mockDeal = require('../../../../../fixtures/mockDeals');

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View a deal', () => {
  context('no checker', () => {
    let deal;

    const dummyDeal = {
      bank: { id: MAKER_LOGIN.bank.id },
      bankInternalRefName: 'Mock GEF exporter',
      userId: MAKER_LOGIN._id,
    };

    beforeEach(() => {
      // same or gef
      cy.deleteGefApplications(MAKER_LOGIN);
      cy.insertOneGefApplication(dummyDeal, MAKER_LOGIN).then((insertedDeal) => { deal = insertedDeal; });
    });

    it('A created GEF deal appears on the dashboard', () => {
      // login and go to dashboard
      cy.login(MAKER_LOGIN);
      gefDashboard.visit();

      const id = deal._id;

      const {
        bankRef, product, updated, link,
      } = gefDashboard.row;

      bankRef(id).invoke('text').then((text) => {
        expect(text.trim()).equal('Mock GEF exporter');
      });

      product(id).invoke('text').then((text) => {
        expect(text.trim()).equal('GEF');
      });

      // TODO: add check for status when statuses for GEF are finalised

      updated(id).invoke('text').then((text) => {
        expect(text.trim()).to.match(regexDateTime);
      });

      link(id).click();

      cy.url().should('eq', relative(`/gef/application-details/${id}`));
    });

    it('should tick the checkbox and refresh the page', () => {
      // login and go to dashboard
      cy.login(MAKER_LOGIN);
      gefDashboard.visit();

      const id = deal._id;

      cy.get('[data-cy="created-by-you"]').check();

      const { bankRef } = gefDashboard.row;

      bankRef(id).invoke('text').then((text) => {
        expect(text.trim()).equal('Mock GEF exporter');
      });
    });
  });
});

context('Sort exporters alphabetically', () => {
  let deals;

  const mockDeals = [
    mockDeal.MOCK_DEAL_ONE,
    mockDeal.MOCK_DEAL_TWO,
    mockDeal.MOCK_DEAL_THREE,
    mockDeal.MOCK_DEAL_FOUR,
  ];

  beforeEach(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.deleteGefApplications(MAKER_LOGIN);
    cy.insertManyGefApplications(mockDeals, MAKER_LOGIN).then((insertedDeals) => {
      deals = insertedDeals;
    });
  });

  it('multiple GEF deals appears on the dashboard', () => {
    // login and go to dashboard
    cy.login(MAKER_LOGIN);
    gefDashboard.visit();

    // ensures all deals are in the table
    gefDashboard.rows().should('have.length', mockDeals.length);
    /* in order of insertion
    ensures that correct text is in correct row
    ensures that whole row changes and not just exporter
    */
    cy.get('table tr').eq(1).find(`[data-cy="deal__exporter--${deals[3]._id}"]`).should('exist')
      .should('contain', deals[3].exporter.companyName);
    cy.get('table tr').eq(1).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[3]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_FOUR.bankInternalRefName);

    cy.get('table tr').eq(2).find(`[data-cy="deal__exporter--${deals[2]._id}"]`).should('exist')
      .should('contain', deals[2].exporter.companyName);
    cy.get('table tr').eq(2).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[2]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_THREE.bankInternalRefName);

    cy.get('table tr').eq(3).find(`[data-cy="deal__exporter--${deals[1]._id}"]`).should('exist')
      .should('contain', deals[1].exporter.companyName);
    cy.get('table tr').eq(3).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[1]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_TWO.bankInternalRefName);

    cy.get('table tr').eq(4).find(`[data-cy="deal__exporter--${deals[0]._id}"]`).should('exist')
      .should('contain', deals[0].exporter.companyName);
    cy.get('table tr').eq(4).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[0]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_ONE.bankInternalRefName);
  });

  it('sort alphabetically (ascending first)', () => {
    cy.login(MAKER_LOGIN);

    // login and go to dashboard
    gefDashboard.visit();

    // ensures the sort is set to none (default) at start
    gefDashboard.tableHeader('exporter').invoke('attr', 'aria-sort').should('eq', 'none');

    gefDashboard.tableHeader('exporter').find('button').click();
    // ensures set to ascending
    gefDashboard.tableHeader('exporter').invoke('attr', 'aria-sort').should('eq', 'ascending');

    // check order
    cy.get('table tr').eq(1).find(`[data-cy="deal__exporter--${deals[3]._id}"]`).should('exist')
      .should('contain', deals[3].exporter.companyName);
    cy.get('table tr').eq(1).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[3]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_FOUR.bankInternalRefName);

    cy.get('table tr').eq(2).find(`[data-cy="deal__exporter--${deals[2]._id}"]`).should('exist')
      .should('contain', deals[2].exporter.companyName);
    cy.get('table tr').eq(2).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[2]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_THREE.bankInternalRefName);

    cy.get('table tr').eq(3).find(`[data-cy="deal__exporter--${deals[1]._id}"]`).should('exist')
      .should('contain', deals[1].exporter.companyName);
    cy.get('table tr').eq(3).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[1]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_TWO.bankInternalRefName);

    cy.get('table tr').eq(4).find(`[data-cy="deal__exporter--${deals[0]._id}"]`).should('exist')
      .should('contain', deals[0].exporter.companyName);
    cy.get('table tr').eq(4).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[0]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_ONE.bankInternalRefName);
  });

  it('sort alphabetically (descending first)', () => {
    cy.login(MAKER_LOGIN);
    // login and go to dashboard
    gefDashboard.visit();

    gefDashboard.tableHeader('exporter').find('button').click();
    gefDashboard.tableHeader('exporter').find('button').click();
    // makes sure is set to descending after clicking twice
    gefDashboard.tableHeader('exporter').invoke('attr', 'aria-sort').should('eq', 'descending');

    cy.get('table tr').eq(4).find(`[data-cy="deal__exporter--${deals[3]._id}"]`).should('exist')
      .should('contain', deals[3].exporter.companyName);
    cy.get('table tr').eq(4).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[3]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_FOUR.bankInternalRefName);

    cy.get('table tr').eq(3).find(`[data-cy="deal__exporter--${deals[2]._id}"]`).should('exist')
      .should('contain', deals[2].exporter.companyName);
    cy.get('table tr').eq(3).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[2]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_THREE.bankInternalRefName);

    cy.get('table tr').eq(2).find(`[data-cy="deal__exporter--${deals[1]._id}"]`).should('exist')
      .should('contain', deals[1].exporter.companyName);
    cy.get('table tr').eq(2).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[1]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_TWO.bankInternalRefName);

    cy.get('table tr').eq(1).find(`[data-cy="deal__exporter--${deals[0]._id}"]`).should('exist')
      .should('contain', deals[0].exporter.companyName);
    cy.get('table tr').eq(1).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[0]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_ONE.bankInternalRefName);
  });

  it('Reset sort after going to deal', () => {
    // login and go to dashboard
    cy.login(MAKER_LOGIN);

    gefDashboard.visit();
    gefDashboard.tableHeader('exporter').find('button').click();

    gefDashboard.tableHeader('exporter').invoke('attr', 'aria-sort').should('eq', 'ascending');

    // checks that it resets once you click on a deal and go back
    gefDashboard.row.link(deals[0]._id).click();
    gefDashboard.visit();
    gefDashboard.tableHeader('exporter').invoke('attr', 'aria-sort').should('eq', 'none');

    cy.get('table tr').eq(1).find(`[data-cy="deal__exporter--${deals[3]._id}"]`).should('exist')
      .should('contain', deals[3].exporter.companyName);
    cy.get('table tr').eq(1).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[3]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_FOUR.bankInternalRefName);

    cy.get('table tr').eq(2).find(`[data-cy="deal__exporter--${deals[2]._id}"]`).should('exist')
      .should('contain', deals[2].exporter.companyName);
    cy.get('table tr').eq(2).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[2]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_THREE.bankInternalRefName);

    cy.get('table tr').eq(3).find(`[data-cy="deal__exporter--${deals[1]._id}"]`).should('exist')
      .should('contain', deals[1].exporter.companyName);
    cy.get('table tr').eq(3).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[1]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_TWO.bankInternalRefName);

    cy.get('table tr').eq(4).find(`[data-cy="deal__exporter--${deals[0]._id}"]`).should('exist')
      .should('contain', deals[0].exporter.companyName);
    cy.get('table tr').eq(4).find(`[data-cy="deal__bankRef--bankInternalRefName${deals[0]._id}"]`).should('exist')
      .should('contain', mockDeal.MOCK_DEAL_ONE.bankInternalRefName);
  });
});
