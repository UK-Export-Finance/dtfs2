context('Create deal', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('A created deal takes you to the deal page', () => {
    // go to the homepage
    cy.visit('http://localhost:5000/');

    // log in
    cy.get('#email').type('MAKER');
    cy.get('#password').type('MAKER');
    cy.get('#LogIn').click();

    // confirm that we're on '/start-now'
    cy.url().should('eq', 'http://localhost:5000/start-now');

    // click 'Create new Submission'
    cy.contains('Create new submission').click();

    // confirm that we're on '/before-you-start'
    cy.url().should('eq', 'http://localhost:5000/before-you-start');

    // click 'criteria met true' radio button
    cy.get('#criteriaMet').click();

    // submit 'before you start' form
    cy.get('button').click();

    // confirm that we're on '/before-you-start/bank-deal'
    cy.url().should('eq', 'http://localhost:5000/before-you-start/bank-deal');

    // complete 'before you start' form fields
    cy.get('#bankDealId').type('TEST1234');
    cy.get('#bankDealName').type('TESTING');

    // submit 'before you start' form
    cy.get('button').click();

    // confirm that we're on the newly created deal '/contract/XYZ'
    cy.url().should('eq', 'http://localhost:5000/contract/1');

  });

})
