const {createADeal, login} = require('../../missions');
const {deleteAllDeals, createManyDeals} = require('../../missions/deal-api');
const {contract} = require('../../pages');
const relative = require('../../relativeURL');

const maker = {username: 'MAKER', password: 'MAKER'};
const checker = {username: 'CHECKER', password: 'CHECKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('../maker/dashboard/twentyOneDeals');


context('Contracts viewed by role=checker, by status', () => {

  let deals = twentyOneDeals;

  const aDealInStatus = (status) => {
    const candidates = deals.filter(deal=>deal.details.status===status);
    expect(candidates.length > 0);
    return candidates[0];
  };

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( async() => {
    // clean down anything our test-users have created
    await deleteAllDeals(maker);
    // insert deals as each user
    deals = await createManyDeals(deals, { ...maker });
  });

  it('Status = Draft, returnToMaker = disabled, proceed to sbumit = disabled', () => {
    login({...checker});
    contract.visit(aDealInStatus('Draft'));

    // contract.canProceed().should('exist');
    // contract.cannotProceed().should('not.exist');

    contract.returnToMaker().should('exist')
                            .and('be.disabled');

    contract.proceedToSubmit().should('exist')
                            .and('be.disabled');


    contract.proceedToReview().should('not.exist');
    contract.abandon().should('not.exist');
  });

  it("Status = Further Maker's input required, returnToMaker = disabled, proceed to sbumit = disabled", () => {
    login({...checker});
    contract.visit(aDealInStatus("Further Maker's input required"));

    // contract.canProceed().should('exist');
    // contract.cannotProceed().should('not.exist');

    contract.returnToMaker().should('exist')
                            .and('be.disabled');

    contract.proceedToSubmit().should('exist')
                            .and('be.disabled');


    contract.proceedToReview().should('not.exist');
    contract.abandon().should('not.exist');
  });

  it("Status = Abandoned Deal, returnToMaker = disabled, proceed to sbumit = disabled", () => {
    login({...checker});
    contract.visit(aDealInStatus("Abandoned Deal"));

    // contract.canProceed().should('exist');
    // contract.cannotProceed().should('not.exist');

    contract.returnToMaker().should('exist')
                            .and('be.disabled');

    contract.proceedToSubmit().should('exist')
                            .and('be.disabled');


    contract.proceedToReview().should('not.exist');
    contract.abandon().should('not.exist');
  });

  it("Status = Acknowledged by UKEF, returnToMaker = disabled, proceed to sbumit = disabled", () => {
    login({...checker});
    contract.visit(aDealInStatus("Acknowledged by UKEF"));

    // contract.canProceed().should('exist');
    // contract.cannotProceed().should('not.exist');

    contract.returnToMaker().should('exist')
                            .and('be.disabled');

    contract.proceedToSubmit().should('exist')
                            .and('be.disabled');


    contract.proceedToReview().should('not.exist');
    contract.abandon().should('not.exist');
  });

  it("Status = Accepted by UKEF (without conditions), returnToMaker = disabled, proceed to sbumit = disabled", () => {
    login({...checker});
    contract.visit(aDealInStatus("Accepted by UKEF (without conditions)"));

    // contract.canProceed().should('exist');
    // contract.cannotProceed().should('not.exist');

    contract.returnToMaker().should('exist')
                            .and('be.disabled');

    contract.proceedToSubmit().should('exist')
                            .and('be.disabled');


    contract.proceedToReview().should('not.exist');
    contract.abandon().should('not.exist');
  });

  it("Status = Accepted by UKEF (with conditions), returnToMaker = disabled, proceed to sbumit = disabled", () => {
    login({...checker});
    contract.visit(aDealInStatus("Accepted by UKEF (with conditions)"));

    // contract.canProceed().should('exist');
    // contract.cannotProceed().should('not.exist');

    contract.returnToMaker().should('exist')
                            .and('be.disabled');

    contract.proceedToSubmit().should('exist')
                            .and('be.disabled');


    contract.proceedToReview().should('not.exist');
    contract.abandon().should('not.exist');
  });

  it("Status = Ready for Checker's approval, returnToMaker = enabled, proceed to sbumit = enabled", () => {
    login({...checker});
    contract.visit(aDealInStatus("Ready for Checker's approval"));

    //TODO any situation where these should not be enabled for a checker?
    contract.canProceed().should('exist');
    contract.reviewEligibilityChecklistForm().should('exist');
    contract.cannotProceed().should('not.exist');

    contract.returnToMaker().should('exist')
                            .and('not.be.disabled');

    contract.proceedToSubmit().should('exist')
                            .and('not.be.disabled');


    contract.proceedToReview().should('not.exist');
    contract.abandon().should('not.exist');
  });

  it("Status = Submitted, no options displayed", () => {
    login({...checker});
    contract.visit(aDealInStatus("Submitted"));

    contract.canProceed().should('not.exist');
    contract.cannotProceed().should('not.exist');
    contract.abandon().should('not.exist');
    contract.proceedToReview().should('not.exist');
    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

  it("Status = Rejected by UKEF, no options displayed", () => {
    login({...checker});
    contract.visit(aDealInStatus("Rejected by UKEF"));

    contract.canProceed().should('not.exist');
    contract.cannotProceed().should('not.exist');
    contract.abandon().should('not.exist');
    contract.proceedToReview().should('not.exist');
    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

});
