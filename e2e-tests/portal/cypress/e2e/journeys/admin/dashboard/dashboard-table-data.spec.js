const { dashboardDeals, dashboardFacilities } = require('../../../pages');
const partials = require('../../../partials');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relative = require('../../../relativeURL');

const { GEF_DEAL_DRAFT, GEF_FACILITY_CASH, GEF_FACILITY_CONTINGENT } = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Admin dashboard', () => {
  let gefDeal;
  const ALL_FACILITIES = [];

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.deleteGefApplications(ADMIN);
    // resets all facilities array
    ALL_FACILITIES.length = 0;

    cy.createBssEwcsDeal({});

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((dealGef) => {
      const { _id: dealId } = dealGef;

      gefDeal = dealGef;

      const facilities = [
        { ...GEF_FACILITY_CASH, dealId, name: 'Cash Facility name' },
        { ...GEF_FACILITY_CONTINGENT, dealId, name: 'Contingent Facility name' },
      ];

      cy.insertManyGefFacilities(facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility.details);
        });
      });
    });
  });

  it('Bank column should appear for admin user', () => {
    // login and go to dashboard
    cy.login(ADMIN);

    // check the fields we understand
    expect(dashboardDeals.tableHeader('bankRef').should('exist'));
    expect(dashboardDeals.rowIndex.bankRef().should('exist'));
  });

  it('clicking on a gef deal takes you to application details page (Admin)', () => {
    cy.login(ADMIN);
    dashboardDeals.row.link(gefDeal._id).click();
    cy.url().should('eq', relative(`/gef/application-details/${gefDeal._id}`));
  });

  it('clicking on a bss deal takes you to application details page (Admin)', () => {
    cy.login(ADMIN);
    dashboardDeals.rowIndex.link(2).click();
    cy.url().should('include', '/contract');
  });

  it('renders all facilities (Admin)', () => {
    cy.login(ADMIN);
    dashboardFacilities.visit();
    dashboardFacilities.rows().should('be.visible');
    dashboardFacilities.row.nameLink(ALL_FACILITIES[0]._id).should('exist');
    dashboardFacilities.row.nameLink(ALL_FACILITIES[1]._id).should('exist');
    dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
  });

  it('clicking on a gef facility takes you to application details focussing on the facility (Admin)', () => {
    cy.login(ADMIN);
    dashboardFacilities.visit();
    dashboardFacilities.rows().should('be.visible');
    dashboardFacilities.row.nameLink(ALL_FACILITIES[0]._id).click();
    cy.url().should('eq', relative(`/gef/application-details/${ALL_FACILITIES[0].dealId}#${ALL_FACILITIES[0]._id}`));
  });

  it('clicking on a bss facility takes you to application details focussing on the facility (Admin)', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.rowIndex.link(2).click();
    // adds bond
    cy.addBondToDeal();
    // gets bond id
    partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
      const bondId = bondIdHiddenInput[0].value;

      dashboardFacilities.visit();
      dashboardFacilities.row.nameLink(bondId).click();
      cy.url().should('include', '/contract');
    });

    // adds loan
    cy.addLoanToDeal();
    // gets loan id
    partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
      const loanId = loanIdHiddenInput[0].value;

      dashboardFacilities.visit();
      dashboardFacilities.row.nameLink(loanId).click();
      cy.url().should('include', `/contract`);
    });
  });

  // TODO: ADD lighthouse checks DTFS2-4994
});
