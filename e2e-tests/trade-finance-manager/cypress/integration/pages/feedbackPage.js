const feedbackPage = {
  visit: () => cy.visit('/feedback'),

  errorSummary: () => cy.get('[data-cy="error-summary"]'),

  feedBackPageHeading: () => cy.get('[data-cy="heading"]'),
  role: () => cy.get('[data-cy="role"]'),
  roleHeading: () => cy.get('[data-cy="role-heading"]'),
  roleErrorMessage: () => cy.get('[data-cy="role-error-message"]'),
  team: () => cy.get('[data-cy="team"]'),
  teamHeading: () => cy.get('[data-cy="team-heading"]'),
  teamErrorMessage: () => cy.get('[data-cy="team-error-message"]'),
  whyUsingService: () => cy.get('[data-cy="why-using-service"]'),
  whyUsingServiceHeading: () => cy.get('[data-cy="why-using-service-heading"]'),
  whyUsingServiceErrorMessage: () => cy.get('[data-cy="why-using-service-error-message"]'),
  ratingHeading: () => cy.get('[data-cy="rating-heading"]'),
  easyToUse: () => cy.get('[data-cy="easy-to-use"]'),
  easyToUseSelection: () => cy.get('[data-cy="easy-to-use-neither-good-nor-poor"]'),
  easyToUseErrorMessage: () => cy.get('[data-cy="easy-to-use-error-message"]'),
  satisfied: () => cy.get('[data-cy="satisfied"]'),
  satisfiedSelection: () => cy.get('[data-cy="were-you-satisfied-very-satisfied"]'),
  satisfiedErrorMessage: () => cy.get('[data-cy="satisfied-error-message"]'),
  howCanWeImprove: () => cy.get('[data-cy="how-can-we-improve"]'),
  howCanWeImproveHeading: () => cy.get('[data-cy="how-can-we-improve-heading"]'),
  emailAddress: () => cy.get('[data-cy="email-address"]'),
  emailAddressHeading: () => cy.get('[data-cy="email-address-heading"]'),
  emailAddressHint: () => cy.get('[data-cy="email-address-hint"]'),
  emailAddressErrorMessage: () => cy.get('[data-cy="email-address-error-message"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),

  // thank you page
  thankYouPageHeading: () => cy.get('[data-cy="thank-you-heading"]'),
  thankYouPageText: () => cy.get('[data-cy="thankyou-copy"]'),
};

module.exports = feedbackPage;
