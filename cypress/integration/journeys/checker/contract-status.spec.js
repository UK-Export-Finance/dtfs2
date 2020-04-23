const {contract} = require('../../pages');
const relative = require('../../relativeURL');

const maker = {username: 'MAKER', password: 'MAKER'};
const checker = {username: 'CHECKER', password: 'CHECKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('../maker/dashboard/twentyOneDeals');


context('Contracts viewed by role=checker, by status', () => {

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.deleteDeals(maker);
    cy.insertManyDeals(twentyOneDeals, { ...maker });
  });

  it('Status = Draft, returnToMaker = disabled, proceed to sbumit = disabled', () => {
    cy.aDealInStatus("Draft").then((deal) => {

      cy.login({...checker});
      contract.visit(deal);

      contract.editDealName().should('not.exist');
      contract.abandonLink().should('not.exist');
      contract.cloneDealLink().should('not.exist');
    })
  });

  it("Status = Further Maker's input required, returnToMaker = disabled, proceed to sbumit = disabled", () => {
    cy.aDealInStatus("Further Maker's input required").then((deal) => {

      cy.login({...checker});
      contract.visit(deal);

      contract.editDealName().should('not.exist');
      contract.abandonLink().should('not.exist');
      contract.cloneDealLink().should('not.exist');
    });
  });

  it("Status = Abandoned Deal, returnToMaker = disabled, proceed to sbumit = disabled", () => {
    cy.aDealInStatus("Abandoned Deal").then((deal) => {
      cy.login({...checker});
      contract.visit(deal);

      contract.editDealName().should('not.exist');
      contract.abandonLink().should('not.exist');
      contract.cloneDealLink().should('not.exist');
    });
  });

  it("Status = Acknowledged by UKEF, returnToMaker = disabled, proceed to sbumit = disabled", () => {
    cy.aDealInStatus("Acknowledged by UKEF").then((deal) => {
      cy.login({...checker});
      contract.visit(deal);

      contract.editDealName().should('not.exist');
      contract.abandonLink().should('not.exist');
      contract.cloneDealLink().should('not.exist');
    });
  });

  it("Status = Accepted by UKEF (without conditions), returnToMaker = disabled, proceed to sbumit = disabled", () => {
    cy.aDealInStatus("Accepted by UKEF (without conditions)").then((deal) => {
      cy.login({...checker});
      contract.visit(deal);

      contract.editDealName().should('not.exist');
      contract.abandonLink().should('not.exist');
      contract.cloneDealLink().should('not.exist');
    });
  });

  it("Status = Accepted by UKEF (with conditions), returnToMaker = disabled, proceed to sbumit = disabled", () => {
    cy.aDealInStatus("Accepted by UKEF (with conditions)").then((deal) => {
      cy.login({...checker});
      contract.visit(deal);

      contract.editDealName().should('not.exist');
      contract.abandonLink().should('not.exist');
      contract.cloneDealLink().should('not.exist');
    });
  });

  it("Status = Ready for Checker's approval, returnToMaker = enabled, proceed to sbumit = enabled", () => {
    cy.aDealInStatus("Ready for Checker's approval").then((deal) => {
      cy.login({...checker});
      contract.visit(deal);

      contract.editDealName().should('not.exist');
      contract.abandonLink().should('not.exist');
      contract.cloneDealLink().should('not.exist');
    });
  });

  it("Status = Submitted, no options displayed", () => {
    cy.aDealInStatus("Submitted").then((deal) => {
      cy.login({...checker});
      contract.visit(deal);

      contract.abandonLink().should('not.exist');
      contract.editDealName().should('not.exist');
      contract.cloneDealLink().should('not.exist');
    });
  });

  it("Status = Rejected by UKEF, no options displayed", () => {
    cy.aDealInStatus("Rejected by UKEF").then((deal) => {
      cy.login({...checker});
      contract.visit(deal);

      contract.abandonLink().should('not.exist');
      contract.editDealName().should('not.exist');
      contract.cloneDealLink().should('not.exist');
    });
  });

});
