const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};
const maker2 = {username:'MAKER-2', password: 'MAKER-2'};
const maker3 = {username:'MAKER-3', password: 'MAKER-3'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

context('Dashboard Deals filter by ownership', () => {
  let allDealsFromBank1,
      dealsFromBank2User1,
      dealsFromBank2User2,
      allDealsFromBank2;

  before( () => {
    cy.deleteDeals(maker1);
    cy.deleteDeals(maker2);
    cy.deleteDeals(maker3);

    cy.insertManyDeals(twentyOneDeals.slice(0,5), { ...maker1 })
      .then( insertedDeals => allDealsFromBank1=insertedDeals );

    cy.insertManyDeals(twentyOneDeals.slice(5,10), { ...maker2 })
      .then( insertedDeals => dealsFromBank2User1=insertedDeals);

    cy.insertManyDeals(twentyOneDeals.slice(10,15), { ...maker3 })
      .then( (insertedDeals) => {
        dealsFromBank2User2=insertedDeals
        allDealsFromBank2 = dealsFromBank2User1.concat(dealsFromBank2User2);
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
    // confirm that maker1 sees maker1's deals
    cy.login({...maker1});
    dashboard.visit();
    dashboard.confirmDealsPresent( allDealsFromBank1 );
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });

    // confirm that maker2 sees maker2's deals AND maker3's deals
    cy.login({...maker2});
    dashboard.visit();

    dashboard.filterBySubmissionUser().should('have.value', 'all')

    dashboard.confirmDealsPresent( allDealsFromBank2 );
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(10 items)');
    });

  });

  it('Show me: created by colleagues - shows all deals created by other users from the users bank', () => {
    // confirm that maker2 sees maker3's deals
    cy.login({...maker2});
    dashboard.visit();

    dashboard.filterBySubmissionUser().select('createdByColleagues');
    dashboard.applyFilters().click();

    dashboard.confirmDealsPresent( dealsFromBank2User2 );
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });

    dashboard.filterBySubmissionUser().should('have.value', 'createdByColleagues')
  });

  it('Show me: created by me - shows all deals created by the user', () => {
    // confirm that maker2 sees maker2's deals
    cy.login({...maker2});
    dashboard.visit();

    dashboard.filterBySubmissionUser().select('createdByMe');
    dashboard.applyFilters().click();

    dashboard.confirmDealsPresent( dealsFromBank2User1 );
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });

    dashboard.filterBySubmissionUser().should('have.value', 'createdByMe')
  });

});
