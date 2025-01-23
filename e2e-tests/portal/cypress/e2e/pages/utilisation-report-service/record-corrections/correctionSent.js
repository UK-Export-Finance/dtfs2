const page = {
  emailText: () => cy.get('[data-cy="email-text"]'),
  emailList: () => cy.get('[data-cy="email-list"]'),
  ukefNotifiedText: () => cy.get('[data-cy="ukef-notified-text"]'),
};

module.exports = page;
