import { add } from 'date-fns';

const pages = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { FACILITY } = require('../../../../fixtures/constants');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const { oneMonth } = require('../../../../../../e2e-fixtures/dateConstants');

const { BANK1_MAKER1 } = MOCK_USERS;

const tomorrow = add(new Date(), { days: 1 });
const startDate = {
  day: tomorrow.getDate(),
  month: tomorrow.getMonth(),
  year: tomorrow.getFullYear(),
};

context('Issue Bond Form - Submit issued bond with inserted element on page', () => {
  let dealId;

  const dealFacilities = {
    bonds: [],
  };

  before(() => {
    cy.createBssEwcsDeal({});

    cy.getDealIdFromUrl(dealId).then((id) => {
      dealId = id;

      cy.url().then((url) => {
        const urlParts = url.split('/');
        dealId = urlParts[urlParts.length - 1];

        const { mockFacilities } = dealWithNotStartedFacilityStatuses;

        const bonds = mockFacilities.filter((f) => f.type === FACILITY.FACILITY_TYPE.BOND);

        cy.createFacilities(dealId, bonds, BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.bonds = createdFacilities;
        });
      });
    });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it("should not insert created element's data into the bond", () => {
    cy.loginGoToDealPage(BANK1_MAKER1);
    pages.dashboardDeals.visit();
    cy.clickDashboardDealLink();

    pages.contract.proceedToReview().should('not.exist');

    const bondId = dealFacilities.bonds[0]._id;

    pages.contract.bondTransactionsTable.row(bondId).uniqueNumberLink().click();

    pages.bondDetails.facilityStageIssuedInput().click();

    pages.bondDetails.requestedCoverStartDateDayInput().clear().type(startDate.day);
    pages.bondDetails.requestedCoverStartDateMonthInput().clear().type(startDate.month);
    pages.bondDetails.requestedCoverStartDateYearInput().clear().type(startDate.year);

    cy.completeDateFormFields({ idPrefix: 'coverEndDate', date: oneMonth.date });

    cy.keyboardInput(pages.bondIssueFacility.name(), '1234');

    // insert populated text field on form
    cy.insertElement('issue-bond-form');

    cy.clickSubmitButton();

    cy.getFacility(dealId, bondId, BANK1_MAKER1).then((bond) => {
      // check bond does not contain inserted field
      expect(bond.intruder).to.be.an('undefined');
    });
  });
});
