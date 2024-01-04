const pages = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { FACILITY } = require('../../../../fixtures/constants');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Issue Bond Form - Submit issued bond with inserted element on page', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
  };

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = dealWithNotStartedFacilityStatuses;

      const bonds = mockFacilities.filter((f) => f.type === FACILITY.FACILITY_TYPE.BOND);

      cy.createFacilities(dealId, bonds, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.bonds = createdFacilities;
      });
    });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it("should not insert created element's data into the bond", () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('be.disabled');

    const bondId = dealFacilities.bonds[0]._id;
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();

    pages.bondIssueFacility.issuedDateDayInput().type(dateConstants.todayDay);
    pages.bondIssueFacility.issuedDateMonthInput().type(dateConstants.todayMonth);
    pages.bondIssueFacility.issuedDateYearInput().type(dateConstants.todayYear);

    pages.bondIssueFacility.coverEndDateDayInput().type(dateConstants.oneMonthDay);
    pages.bondIssueFacility.coverEndDateMonthInput().type(dateConstants.oneMonthMonth);
    pages.bondIssueFacility.coverEndDateYearInput().type(dateConstants.oneMonthYear);

    pages.bondIssueFacility.name().type('1234');

    // insert populated text field on form
    cy.insertElement('issue-bond-form');

    pages.bondIssueFacility.submit().click();

    cy.getFacility(deal._id, bondId, BANK1_MAKER1).then((bond) => {
      // check bond does not contain inserted field
      expect(bond.intruder).to.be.an('undefined');
    });
  });
});
