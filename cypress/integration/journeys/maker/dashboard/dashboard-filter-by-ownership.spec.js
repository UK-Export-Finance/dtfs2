const {createADeal, login} = require('../../../missions');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};
const maker2 = {username:'MAKER-2', password: 'MAKER-2'};
const maker3 = {username:'MAKER-3', password: 'MAKER-3'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

context('Dashboard Deals filter by ownership', () => {

  before( () => {
    // clean down anything our test-users have created
    // await deleteAllDeals(maker3);
    cy.deleteAllDeals(maker1);
    cy.deleteAllDeals(maker2);
    cy.deleteAllDeals(maker3);
    // insert deals as each user
    cy.createManyDeals(twentyOneDeals.slice(0,5), { ...maker1 });
    cy.createManyDeals(twentyOneDeals.slice(5,10), { ...maker2 });
    cy.createManyDeals(twentyOneDeals.slice(10,15), { ...maker3 });
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
      login({...maker1});
      dashboard.visit();
      cy.dealsAssociatedWithBank('Barclays Bank').then( (deals) => {
        dashboard.confirmDealsPresent(deals);
        dashboard.totalItems().invoke('text').then((text) => {
          expect(text.trim()).equal('(5 items)');
        });
      });

    // confirm that maker2 sees maker2's deals AND maker3's deals
    login({...maker2});
    dashboard.visit();
    cy.dealsAssociatedWithBank('HSBC').then( (deals) => {
      dashboard.confirmDealsPresent(deals);
      dashboard.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal('(10 items)');
      });

      dashboard.filterBySubmissionUser().should('have.value', 'all')
    });
  });

  it('Show me: created by colleagues - shows all deals created by other users from the users bank', () => {
    const notCreatedByMe = (allDeals) => {
      return allDeals.filter(deal=>deal.details.maker.username!==maker2.username);
    }

    // confirm that maker2 sees maker3's deals
    login({...maker2});
    dashboard.visit();

    dashboard.filterBySubmissionUser().select('createdByColleagues');
    dashboard.applyFilters().click();

    cy.dealsAssociatedWithBank('HSBC').then( (deals) => {
      dashboard.confirmDealsPresent(notCreatedByMe(deals));
      dashboard.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal('(5 items)');
      });

      dashboard.filterBySubmissionUser().should('have.value', 'createdByColleagues')
    });
  });

  it('Show me: created by me - shows all deals created by the user', () => {
    const createdByMe = (allDeals) => {
      return allDeals.filter(deal=>deal.details.maker.username===maker2.username);
    }

    // confirm that maker2 sees maker2's deals
    login({...maker2});
    dashboard.visit();

    dashboard.filterBySubmissionUser().select('createdByMe');
    dashboard.applyFilters().click();

    cy.dealsAssociatedWithBank('HSBC').then( (deals) => {
      dashboard.confirmDealsPresent(createdByMe(deals));
      dashboard.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal('(5 items)');
      });

      dashboard.filterBySubmissionUser().should('have.value', 'createdByMe')
    });
  });

});
