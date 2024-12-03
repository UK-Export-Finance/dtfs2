const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');

const { BANK1_MAKER1 } = MOCK_USERS;

context("A maker is informed of a bond's status before submitting an issued bond facility with a deal in `Acknowledged` status", () => {
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

      const bonds = mockFacilities.filter((f) => f.type === 'Bond');

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

  it('Starting to fill in the Issue Bond Facility form should change the Bond status from `Not started` to `Incomplete` and the Issue Facility link to `Facility issued`', () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('not.exist');

    const bondId = dealFacilities.bonds[0]._id;
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    cy.assertText(bondRow.bondStatus(), 'Not started');
    cy.assertText(bondRow.issueFacilityLink(), 'Issue facility');

    bondRow.issueFacilityLink().click();

    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

    // don't fill anything in. Submit and go back to deal page
    cy.clickSubmitButton();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

    cy.clickCancelButton();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // assert bond status has changed

    cy.assertText(bondRow.bondStatus(), 'Incomplete');

    // assert `Issue facility link` text has not changed
    cy.assertText(bondRow.issueFacilityLink(), 'Issue facility');
  });
});
