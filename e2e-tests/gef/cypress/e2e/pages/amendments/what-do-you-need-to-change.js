const whatDoYouNeedToChange = {
  coverEndDateCheckbox: () => cy.get('[data-cy="cover-end-date-checkbox"]'),
  facilityValueCheckbox: () => cy.get('[data-cy="facility-value-checkbox"]'),
};

module.exports = whatDoYouNeedToChange;
