/* eslint-disable no-undef */
const { gefDashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.roles.length === 1));

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View a deal', () => {
  context('no checker', () => {
    let deal;

    const dummyDeal = {
      bankId: MAKER_LOGIN.bank.id,
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
  let mockDeals = [];

  const dealOne = {
    bankId: MAKER_LOGIN.bank.id,
    bankInternalRefName: 'Mock1',
    userId: MAKER_LOGIN._id,
    exporter: { companyName: 'ddd', __typename: 'Exporter' },
  };

  const dealTwo = {
    bankId: MAKER_LOGIN.bank.id,
    bankInternalRefName: 'Mock2',
    userId: MAKER_LOGIN._id,
    exporter: { companyName: 'aaa', __typename: 'Exporter' },
  };

  const dealThree = {
    bankId: MAKER_LOGIN.bank.id,
    bankInternalRefName: 'Mock3',
    userId: MAKER_LOGIN._id,
    exporter: { companyName: 'gggg', __typename: 'Exporter' },
  };

  mockDeals = [
    dealOne,
    dealTwo,
    dealThree,
  ];

  beforeEach(() => {
    // same or gef
    cy.deleteGefApplications(MAKER_LOGIN);
    cy.insertManyGefApplications(mockDeals, MAKER_LOGIN).then((insertedDeals) => { deals = insertedDeals; });
  });

  it('multiple GEF deals appears on the dashboard', () => {
    // login and go to dashboard
    cy.login(MAKER_LOGIN);
    gefDashboard.visit();

    gefDashboard.rows().should('have.length', mockDeals.length);
  });
});
