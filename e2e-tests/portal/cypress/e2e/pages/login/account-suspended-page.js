const accountSuspendedPage = {
  heading: () => cy.get('[data-cy="account-temporarily-suspended-heading"]'),
  bodyText: () => cy.get('[data-cy="account-temporarily-suspended-message"]'),
  contactLink: () => cy.get('[data-cy="contact-us-email"]'),
};

export default accountSuspendedPage;
