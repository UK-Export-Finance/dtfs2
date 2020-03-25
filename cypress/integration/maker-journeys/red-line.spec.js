context('Red Line eligibility checking', () => {
  beforeEach(() => {
    //[ dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('A deal that fails red-line checks is rejected.', () => {

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

    // click 'criteria met false' radio button
    cy.get('#criteriaMet-2').click();

    // submit 'before you start' form
    cy.get('button').click();

    // confirm we're in the fail case
    cy.url().should('eq', 'http://localhost:5000/unable-to-proceed');
  });

  it('A deal that passes red-line checks can progress to enter supply details.', () => {
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

    // confirm we're in the success case
    cy.url().should('eq', 'http://localhost:5000/before-you-start/bank-deal');
  });

})
