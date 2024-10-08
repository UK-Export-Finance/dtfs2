const facilityEndDate = {
  facilityEndDateError: () => cy.get('[data-cy="facility-end-date-inline-error"]'),
  facilityEndDateDay: () => cy.get('[data-cy="facility-end-date-day"]'),
  facilityEndDateMonth: () => cy.get('[data-cy="facility-end-date-month"]'),
  facilityEndDateYear: () => cy.get('[data-cy="facility-end-date-year"]'),
  facilityEndDateDetails: () => cy.get('[data-cy="facility-end-date-details"]'),
};

export default facilityEndDate;
