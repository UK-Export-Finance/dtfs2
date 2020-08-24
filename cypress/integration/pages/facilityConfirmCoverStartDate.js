const page = {
  needToChangeCoverStartDateYes: () => cy.get('[data-cy="need-to-change-cover-start-date-yes"]'),
  coverStartDateDay: () => cy.get('[data-cy="requestedCoverStartDate-day"]'),
  coverStartDateMonth: () => cy.get('[data-cy="requestedCoverStartDate-month"]'),
  coverStartDateYear: () => cy.get('[data-cy="requestedCoverStartDate-year"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
};

module.exports = page;
