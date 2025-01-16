const page = {
  emailText: () => cy.get('[data-cy="email-text"]'),
  emailListItem: (email) => cy.get(`[data-cy="email-list"] li:contains(${email})`),
  ukefNotifiedText: () => cy.get('[data-cy="ukef-notified-text"]'),
};

module.exports = page;
