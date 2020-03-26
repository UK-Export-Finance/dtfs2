const {passRedLine} = require('../../missions');
const {bankDetails} = require('../../pages');
const relative = require('../../relativeURL');

context('Create deal', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('When the a user fills in the bank detais they progress to the deal page', () => {
    passRedLine({username:'MAKER', password:'MAKER'});

    // confirm that we're on '/before-you-start/bank-deal'
    cy.url().should('eq', relative('/before-you-start/bank-deal'));

    // complete 'before you start' form fields
    bankDetails.bankDealId().type('TEST1234');
    bankDetails.bankDealName().type('TESTING');
    bankDetails.create().click();

    // confirm that we're on the newly created deal '/contract/XYZ'
    cy.url().should('include', '/contract/');

  });

})
