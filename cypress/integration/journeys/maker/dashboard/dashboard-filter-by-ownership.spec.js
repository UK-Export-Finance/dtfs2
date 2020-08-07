const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');
const BARCLAYS_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'Barclays Bank') );
const hsbc_makers = mockUsers.filter( user=> (user.roles.includes('maker') && user.bank.name === 'HSBC') );
const HSBC_MAKER_1 = hsbc_makers[0];
const HSBC_MAKER_2 = hsbc_makers[1];

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

context('Dashboard Deals filter by ownership', () => {
  let allBarclaysDeals,
      dealsFromBarclaysUser1,
      dealsFromBarclaysUser2,
      allDealsFromBarclays;

  before( () => {
    cy.deleteDeals(BARCLAYS_LOGIN);
    cy.deleteDeals(HSBC_MAKER_1);
    cy.deleteDeals(HSBC_MAKER_2);

    cy.insertManyDeals(twentyOneDeals.slice(0,5), BARCLAYS_LOGIN)
      .then( insertedDeals => allBarclaysDeals=insertedDeals );

    cy.insertManyDeals(twentyOneDeals.slice(5,10), HSBC_MAKER_1)
      .then( insertedDeals => dealsFromBarclaysUser1=insertedDeals);

    cy.insertManyDeals(twentyOneDeals.slice(10,15), HSBC_MAKER_2)
      .then( (insertedDeals) => {
        dealsFromBarclaysUser2=insertedDeals
        allDealsFromBarclays = dealsFromBarclaysUser1.concat(dealsFromBarclaysUser2);
      });

  });

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('Show me: All - shows all deals from the users bank', () => {
    // confirm that BARCLAYS_LOGIN sees BARCLAYS_LOGIN's deals
    cy.login(BARCLAYS_LOGIN);
    dashboard.visit();
    dashboard.confirmDealsPresent( allBarclaysDeals );
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });

    // confirm that HSBC_MAKER_1 sees HSBC_MAKER_1's deals AND HSBC_MAKER_2's deals
    cy.login(HSBC_MAKER_1);
    dashboard.visit();

    dashboard.filterBySubmissionUser().should('have.value', 'all')

    dashboard.confirmDealsPresent( allDealsFromBarclays );
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(10 items)');
    });

  });

  it('Show me: created by colleagues - shows all deals created by other users from the users bank', () => {
    // confirm that HSBC_MAKER_1 sees HSBC_MAKER_2's deals
    cy.login(HSBC_MAKER_1);
    dashboard.visit();

    dashboard.filterBySubmissionUser().select('createdByColleagues');
    dashboard.applyFilters().click();

    dashboard.confirmDealsPresent( dealsFromBarclaysUser2 );
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });

    dashboard.filterBySubmissionUser().should('have.value', 'createdByColleagues')
  });

  it('Show me: created by me - shows all deals created by the user', () => {
    // confirm that HSBC_MAKER_1 sees HSBC_MAKER_1's deals
    cy.login(HSBC_MAKER_1);
    dashboard.visit();

    dashboard.filterBySubmissionUser().select('createdByMe');
    dashboard.applyFilters().click();

    dashboard.confirmDealsPresent( dealsFromBarclaysUser1 );
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });

    dashboard.filterBySubmissionUser().should('have.value', 'createdByMe')
  });

});
