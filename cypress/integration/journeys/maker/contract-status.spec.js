const {createADeal, login} = require('../../missions');
const {deleteAllDeals, createManyDeals} = require('../../missions/deal-api');
const {contract} = require('../../pages');
const relative = require('../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('./dashboard/twentyOneDeals');


context('Contracts viewed by status', () => {

  let dealsFromMaker1 = twentyOneDeals;

  const aDealInStatus = (status) => {
    const candidates = dealsFromMaker1.filter(deal=>deal.details.status===status);
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
    await deleteAllDeals(maker1);
    // insert deals as each user
    dealsFromMaker1 = await createManyDeals(dealsFromMaker1, { ...maker1 });
  });

  it('Status = Draft, (//TODO validation) can be submitted, cannot be returned to Maker', () => {
    login({...maker1});
    contract.visit(aDealInStatus('Draft'));

    contract.abandon().should('exist')
                      .and('not.be.disabled');

    contract.proceedToReview().should('exist')
                              .and('not.be.disabled');

    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

  it("Status = Further Maker's input required, (//TODO validation) can be submitted, cannot be returned to Maker", () => {
    login({...maker1});
    contract.visit(aDealInStatus("Further Maker's input required"));

    contract.abandon().should('exist')
                      .and('not.be.disabled');

    contract.proceedToReview().should('exist')
                              .and('not.be.disabled');

    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

  it("Status = Abandoned Deal, cannot be submitted, cannot be returned to Maker", () => {
    login({...maker1});
    contract.visit(aDealInStatus("Abandoned Deal"));


    contract.abandon().should('exist')
                      .and('be.disabled');

    contract.proceedToReview().should('exist')
                              .and('be.disabled');

    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

  it("Status = Acknowledged by UKEF, cannot be submitted, cannot be returned to Maker", () => {
    login({...maker1});
    contract.visit(aDealInStatus("Acknowledged by UKEF"));

    contract.abandon().should('exist')
                      .and('be.disabled');

    contract.proceedToReview().should('exist')
                              .and('be.disabled');

    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

  it("Status = Accepted by UKEF (without conditions), cannot be submitted, cannot be returned to Maker", () => {
    login({...maker1});
    contract.visit(aDealInStatus("Accepted by UKEF (without conditions)"));

    contract.abandon().should('exist')
                      .and('be.disabled');

    contract.proceedToReview().should('exist')
                              .and('not.be.disabled');

    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

  it("Status = Accepted by UKEF (with conditions), cannot be submitted, cannot be returned to Maker", () => {
    login({...maker1});
    contract.visit(aDealInStatus("Accepted by UKEF (with conditions)"));

    contract.abandon().should('exist')
                      .and('be.disabled');

    contract.proceedToReview().should('exist')
                              .and('not.be.disabled');

    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

  it("Status = Ready for Checker's approval, cannot be submitted, cannot be returned to Maker", () => {
    login({...maker1});
    contract.visit(aDealInStatus("Ready for Checker's approval"));

    contract.abandon().should('exist')
                      .and('be.disabled');

    contract.proceedToReview().should('exist')
                              .and('be.disabled');

    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

  it("Status = Submitted, no buttons to submit/return are displayed", () => {
    login({...maker1});
    contract.visit(aDealInStatus("Submitted"));

    contract.abandon().should('not.exist');
    contract.proceedToReview().should('not.exist');
    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

  it("Status = Rejected by UKEF, no buttons to submit/return are displayed", () => {
    login({...maker1});
    contract.visit(aDealInStatus("Rejected by UKEF"));

    contract.abandon().should('not.exist');
    contract.proceedToReview().should('not.exist');
    contract.returnToMaker().should('not.exist');
    contract.proceedToSubmit().should('not.exist');
  });

});
