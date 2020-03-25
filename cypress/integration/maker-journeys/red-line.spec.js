context('Red Line eligibility checking', () => {

  beforeEach(() => {

    //[dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack)
      return false
    })

  });

  it('A deal that fails red-line checks is rejected.', () => {

// go to the homepage
    cy.visit('http://localhost:5000/');

// log in
    cy.get('#email').type('testing');
    cy.get('#password').type('testing');
    cy.get('#LogIn').click();
    // confirm that we're on '/start-now'

// click 'Create new Submission'
    cy.contains('Create new submission').click();
    // confirm that we're on '/before-you-start'

    cy.get('#criteria-met-2').click();
    cy.get('#submit-red-line').click();

    // confirm we're in the fail case
  });

  it('A deal that passes red-line checks can progress to enter supply details.', () => {
    // go to the homepage
        cy.visit('http://localhost:5000/');

    // log in
        cy.get('#email').type('testing');
        cy.get('#password').type('testing');
        cy.get('#LogIn').click();
        // confirm that we're on '/start-now'

    // click 'Create new Submission'
        cy.contains('Create new submission').click();
        // confirm that we're on '/before-you-start'

        cy.get('#criteria-met').click();
        cy.get('#submit-red-line').click();

        // confirm we're in the success case
  });

})
