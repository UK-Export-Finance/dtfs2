const { gefFacilitiesDashboard } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find(
  (user) => (user.roles.includes('maker')
    && !user.roles.includes('admin')
    && !user.roles.includes('checker')
  ),
);

const dummyDeal = {
  bankId: MAKER_LOGIN.bank.id,
  bankInternalRefName: 'Mock GEF exporter',
};

let deal;
let facility;

context('View a deal', () => {
  before(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err) => {
      console.log(err.stack);
      return false;
    });

    cy.on('uncaught:exception', (err) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteGefApplications(MAKER_LOGIN);
    cy.insertOneGefApplication(dummyDeal, MAKER_LOGIN).then((insertedDeal) => {
      deal = insertedDeal;

      cy.insertOneGefFacility({
        applicationId: deal._id,
        ukefFacilityId: '00000001',
        type: 'CASH',
        name: 'abc-1-def',
        hasBeenIssued: true,
        value: '123.00',
        currency: 'GBP',
        submittedAsIssuedDate: Date.parse('2020-09-01'),
      }, MAKER_LOGIN)
        .then((insertedFacility) => { facility = insertedFacility; });
    });
  });

  after(() => {
    cy.deleteGefFacilities(MAKER_LOGIN, deal._id);
  });

  it('A created deal appears on the transaction Dashboard', () => {
    // login and go to transactionDashboard
    cy.login(MAKER_LOGIN);
    gefFacilitiesDashboard.visit();

    const facilityId = facility.details.name;

    gefFacilitiesDashboard.bankFacilityId(facilityId).should('contain', 'abc-1-def');
    gefFacilitiesDashboard.ukefFacilityId(facilityId).should('contain', '00000001');
    gefFacilitiesDashboard.facilityType(facilityId).should('contain', 'Cash');
    gefFacilitiesDashboard.noticeType(facilityId).should('contain', '-');
    gefFacilitiesDashboard.facilityValue(facilityId).should('contain', 'GBP 123.00');
    gefFacilitiesDashboard.bankStage(facilityId).should('contain', 'Issued');
    gefFacilitiesDashboard.issuedDate(facilityId).should('contain', '1 Sep 2020');
  });
});
