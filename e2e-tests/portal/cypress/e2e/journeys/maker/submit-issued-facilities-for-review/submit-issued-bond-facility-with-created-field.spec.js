const pages = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { FACILITY } = require('../../../../fixtures/constants');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');

const { today, oneMonth } = require('../../../../../../e2e-fixtures/dateConstants');

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
    pages.contract.proceedToReview().should('not.exist');

    const bondId = dealFacilities.bonds[0]._id;
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();

    cy.keyboardInput(pages.bondIssueFacility.issuedDateDayInput(), today.day);
    cy.keyboardInput(pages.bondIssueFacility.issuedDateMonthInput(), today.month);
    cy.keyboardInput(pages.bondIssueFacility.issuedDateYearInput(), today.year);

    cy.keyboardInput(pages.bondIssueFacility.coverEndDateDayInput(), oneMonth.day);
    cy.keyboardInput(pages.bondIssueFacility.coverEndDateMonthInput(), oneMonth.month);
    cy.keyboardInput(pages.bondIssueFacility.coverEndDateYearInput(), oneMonth.year);

    cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

    // insert populated text field on form
    cy.insertElement('issue-bond-form');

    cy.clickSubmitButton();

    cy.getFacility(deal._id, bondId, BANK1_MAKER1).then((bond) => {
      // check bond does not contain inserted field
      expect(bond.intruder).to.be.an('undefined');
    });
  });
});
