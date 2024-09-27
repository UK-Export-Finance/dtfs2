const effectiveFromDatePage = {
  effectiveFromDateDay: () => cy.get('[data-cy="effective-from-date-day"]'),
  effectiveFromDateMonth: () => cy.get('[data-cy="effective-from-date-month"]'),
  effectiveFromDateYear: () => cy.get('[data-cy="effective-from-date-year"]'),
};

module.exports = effectiveFromDatePage;
