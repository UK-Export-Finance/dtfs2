const statusBanner = {
  // application banner/summary
  applicationBanner: () => cy.get('[data-cy="application-banner"]'),
  bannerStatus: () => cy.get('[data-cy="status"]'),
  bannerProduct: () => cy.get('[data-cy="product"]'),
  bannerDateCreated: () => cy.get('[data-cy="date-created"]'),
  bannerSubmissionType: () => cy.get('[data-cy="submission-type"]'),
  bannerCreatedBy: () => cy.get('[data-cy="created-by"]'),
  bannerExporter: () => cy.get('[data-cy="exporter"]'),
  bannerCheckedBy: () => cy.get('[data-cy="checked-by"]'),
  bannerBuyer: () => cy.get('[data-cy="buyer"]'),
  bannerDateSubmitted: () => cy.get('[data-cy="date-submitted"]'),
  bannerUkefDealId: () => cy.get('[data-cy="ukef-deal-id"]'),
};

export default statusBanner;
