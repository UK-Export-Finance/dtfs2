const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardFacilities } = require('../../../pages');
const MIADraftDeal = require('../fixtures/MIA-draft-deal-with-issued-facilities');
const MIASubmittedDeal = require('../fixtures/MIA-deal-with-accepted-status-issued-facilities-cover-start-date-in-past');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Facilities - Unissued Stage', () => {
  let facilityId;
  let dealId;

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(MIADraftDeal, BANK1_MAKER1).then((deal) => {
      dealId = deal._id;

      const { mockFacilities } = MIADraftDeal;

      cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          facilityId = facility._id;
        });
      });
    });

    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('as deal is not submitted, facility stage is shown as Unissued', () => {
    dashboardFacilities.row.bankStage(facilityId).contains('Unissued');
  });
});

context('Dashboard Facilities - Issued Stage', () => {
  let facilityId;
  let dealId;

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(MIASubmittedDeal, BANK1_MAKER1).then((deal) => {
      dealId = deal._id;

      const { mockFacilities } = MIASubmittedDeal;

      cy.createFacilities(dealId, [mockFacilities[1]], BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          facilityId = facility._id;
        });
      });
    });

    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('if deal submitted and facility is issued, then stage will show as Issued', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    dashboardFacilities.row.bankStage(facilityId).contains('Issued');
  });
});
