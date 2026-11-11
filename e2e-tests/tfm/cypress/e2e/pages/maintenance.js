export const maintenancePage = {
  // Heading
  heading: () => cy.get('[data-cy="service-unavailable-heading"]'),

  // Body
  message: () => cy.get('[data-cy="service-unavailable-message"]'),
  contact: () => cy.get('[data-cy="service-unavailable-contact"]'),
};
