const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardFacilities } = require('../../../pages');
const {
  BSS_DEAL_AIN,
  BSS_FACILITY_BOND_ISSUED,
} = require('../fixtures');
const contract = require('../../../pages/contract');
const bondDetails = require('../../../pages/bondDetails');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Facilities - Name link', () => {
  let facilityId;
  let dealId;

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      dealId = deal._id;

      const facilities = [BSS_FACILITY_BOND_ISSUED];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          facilityId = facility._id;
        });
      });
    });

    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('if facility name not entered, link shows Not entered', () => {
    cy.get(`[data-cy="facility__name--link--${facilityId}"]`).contains('Not entered');
    cy.get(`[data-cy="facility__name--link--${facilityId}"]`).invoke('attr', 'href').then((href) => {
      expect(href).to.equal(`/contract/${dealId}`);
    });
  });

  it('if facility name set, facility name is showed', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.get(`[data-cy="facility__name--link--${facilityId}"]`).click();
    // sets name to test
    contract.bondTransactionsTable.row(facilityId).uniqueNumberLink().click();
    bondDetails.facilityStageIssuedInput().click();
    bondDetails.nameInput().type('Test');
    bondDetails.saveGoBackButton().click();
    // checks name is set
    dashboardFacilities.visit();
    cy.get(`[data-cy="facility__name--link--${facilityId}"]`).contains('Test');
    cy.get(`[data-cy="facility__name--link--${facilityId}"]`).invoke('attr', 'href').then((href) => {
      expect(href).to.equal(`/contract/${dealId}`);
    });
  });
});
