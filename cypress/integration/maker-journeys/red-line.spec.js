const missions = require('../missions');
const {unableToProceed} = require('../pages');

context('Red Line eligibility checking', () => {

  beforeEach(() => {

    //[dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack)
      return false
    })

  });

  it('A deal that fails red-line checks is rejected.', async () => {
    missions.logInAs('MAKER', 'MAKER');

    const beforeYouStartPage = missions.createNewSubmission();
    beforeYouStartPage.false().click();
    beforeYouStartPage.submit().click();

    cy.url().should('include', '/unable-to-proceed');
  });

  it('A deal that passes red-line checks can progress to enter supply details.', () => {
    missions.logInAs('MAKER', 'MAKER');

    const beforeYouStartPage = missions.createNewSubmission();
    beforeYouStartPage.true().click();
    beforeYouStartPage.submit().click();

    cy.url().should('include', '/before-you-start/bank-deal');
  });

})
