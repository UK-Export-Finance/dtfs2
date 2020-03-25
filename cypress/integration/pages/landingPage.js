const landingPage = {
  email: () => cy.get('#email'),
  password: () => cy.get('#passqword'),
  login: () => cy.get('#LogIn'),
}

module.exports = landingPage;
