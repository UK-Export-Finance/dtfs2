const {contract} = require('../../pages');
const relative = require('../../relativeURL');

const maker1 = {username: 'BARCLAYS-MAKER-1', password: 'BARCLAYS-MAKER-1'};
const maker2 = {username: 'BARCLAYS-MAKER-2', password: 'BARCLAYS-MAKER-2'};

// test data we want to set up + work with..
const twentyOneDeals = require('./dashboard/twentyOneDeals');


context('Contracts viewed by role=maker, by status', () => {

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.deleteDeals(maker1);
    cy.insertManyDeals(twentyOneDeals, { ...maker1 });
  });

  it('Status = Draft, (//TODO validation) abandon = enabled, proceed to review = enabled, edit name = enabled', () => {
    cy.aDealInStatus("Draft").then( (deal) => {
      cy.login({...maker1});
      contract.visit(deal);

      // since we're deliberately not applying validation at this point we check this
      contract.canProceed().should('exist');
      contract.cannotProceed().should('not.exist');
      contract.proceedToReview().should('exist').and('not.be.disabled');
      contract.editDealName().should('exist').and('not.be.disabled');
      contract.abandonButton().should('exist').and('not.be.disabled');
      contract.abandonLink().should('exist').and('not.be.disabled');
      contract.returnToMaker().should('not.exist');
      contract.proceedToSubmit().should('not.exist');
    });

  });

  it('Status = Draft, abandon = disabled if the user does not own the deal', () => {
    cy.aDealInStatus("Draft").then( (deal) => {
      cy.login({...maker2});
      contract.visit(deal);

      contract.abandonButton().should('exist').and('be.disabled');
      contract.abandonLink().should('not.exist');
    });
  });

  it("Status = Further Maker's input required, (//TODO validation)  abandon = enabled, proceed to review = enabled, edit name = enabled", () => {
    cy.aDealInStatus("Further Maker's input required").then( (deal) => {
      cy.login({...maker1});
      contract.visit(deal);

      // since we're deliberately not applying validation at this point we check this
      contract.canProceed().should('exist');
      contract.cannotProceed().should('not.exist');
      contract.proceedToReview().should('exist').and('not.be.disabled');
      contract.editDealName().should('exist').and('not.be.disabled');
      contract.abandonButton().should('exist').and('not.be.disabled');
      contract.abandonLink().should('exist').and('not.be.disabled');
      contract.returnToMaker().should('not.exist');
      contract.proceedToSubmit().should('not.exist');
    });

  });

  it("Status = Further Maker's input required, abandon = disabled if the user does not own the deal", () => {
    cy.aDealInStatus("Further Maker's input required").then( (deal) => {
      cy.login({...maker2});
      contract.visit(deal);

      contract.abandonButton().should('exist').and('be.disabled');
      contract.abandonLink().should('not.exist');
    });
  });

  it("Status = Abandoned Deal, abandon = disabled, proceed to review = disabled, edit name = unavailable", () => {
    cy.aDealInStatus("Abandoned Deal").then( (deal) => {
      cy.login({...maker1});
      contract.visit(deal);

      contract.canProceed().should('not.exist');
      contract.cannotProceed().should('not.exist');
      contract.abandonButton().should('exist').and('be.disabled');
      contract.abandonLink().should('not.exist');
      contract.editDealName().should('not.exist');
      contract.proceedToReview().should('exist').and('be.disabled');
      contract.returnToMaker().should('not.exist');
      contract.proceedToSubmit().should('not.exist');
    });
  });

  it("Status = Acknowledged by UKEF, abandon = disabled, proceed to review = disabled, edit name = unavailable", () => {
    cy.aDealInStatus("Acknowledged by UKEF").then( (deal) => {
      cy.login({...maker1});
      contract.visit(deal);

      contract.canProceed().should('not.exist');
      contract.cannotProceed().should('not.exist');
      contract.abandonButton().should('exist').and('be.disabled');
      contract.abandonLink().should('not.exist');
      contract.proceedToReview().should('exist').and('be.disabled');
      contract.editDealName().should('not.exist');
      contract.returnToMaker().should('not.exist');
      contract.proceedToSubmit().should('not.exist');
    });
  });

  it("Status = Accepted by UKEF (without conditions), abandon = disabled, proceed to review = enabled, edit name = unavailable", () => {
    cy.aDealInStatus("Accepted by UKEF (without conditions)").then( (deal) => {
      cy.login({...maker1});
      contract.visit(deal);

      contract.canProceed().should('not.exist');
      contract.cannotProceed().should('not.exist');
      contract.abandonButton().should('exist').and('be.disabled');
      contract.abandonLink().should('not.exist');
      contract.proceedToReview().should('exist').and('not.be.disabled');
      contract.editDealName().should('not.exist');
      contract.returnToMaker().should('not.exist');
      contract.proceedToSubmit().should('not.exist');
    });
  });

  it("Status = Accepted by UKEF (with conditions), abandon = disabled, proceed to review = enabled, edit name = unavailable", () => {
    cy.aDealInStatus("Accepted by UKEF (with conditions)").then( (deal) => {
      cy.login({...maker1});
      contract.visit(deal);

      contract.canProceed().should('not.exist');
      contract.cannotProceed().should('not.exist');
      contract.abandonButton().should('exist').and('be.disabled');
      contract.abandonLink().should('not.exist');
      contract.proceedToReview().should('exist').and('not.be.disabled');
      contract.editDealName().should('not.exist');
      contract.returnToMaker().should('not.exist');
      contract.proceedToSubmit().should('not.exist');
    });

  });

  it("Status = Ready for Checker's approval, abandon = disabled, proceed to review = disabled, edit name = unavailable", () => {
    cy.aDealInStatus("Ready for Checker's approval").then( (deal) => {
      cy.login({...maker1});
      contract.visit(deal);

      contract.canProceed().should('not.exist');
      contract.cannotProceed().should('not.exist');
      contract.abandonButton().should('exist').and('be.disabled');
      contract.abandonLink().should('not.exist');
      contract.proceedToReview().should('exist').and('be.disabled');
      contract.editDealName().should('not.exist');
      contract.returnToMaker().should('not.exist');
      contract.proceedToSubmit().should('not.exist');
    });
  });

  it("Status = Submitted, no options displayed", () => {
    cy.aDealInStatus("Submitted").then( (deal) => {
      cy.login({...maker1});
      contract.visit(deal);

      contract.canProceed().should('not.exist');
      contract.cannotProceed().should('not.exist');
      contract.abandonButton().should('not.exist');
      contract.abandonLink().should('not.exist');
      contract.proceedToReview().should('not.exist');
      contract.returnToMaker().should('not.exist');
      contract.proceedToSubmit().should('not.exist');
      contract.editDealName().should('not.exist');
    });
  });

  it("Status = Rejected by UKEF, no options displayed", () => {
    cy.aDealInStatus("Rejected by UKEF").then( (deal) => {
      cy.login({...maker1});
      contract.visit(deal);

      contract.canProceed().should('not.exist');
      contract.cannotProceed().should('not.exist');
      contract.abandonButton().should('not.exist');
      contract.abandonLink().should('not.exist');
      contract.proceedToReview().should('not.exist');
      contract.returnToMaker().should('not.exist');
      contract.proceedToSubmit().should('not.exist');
      contract.editDealName().should('not.exist');
    });
  });

});
