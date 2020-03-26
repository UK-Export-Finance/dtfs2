const landingPage = {
  email: () => cy.get('#email'),
  password: () => cy.get('#password'),
  login: () => cy.get('#LogIn'),
}

module.exports = landingPage;
