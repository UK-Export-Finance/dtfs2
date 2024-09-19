const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const mockDeal = require('./MIA-deal-submitted-to-ukef-with-issued-facilities-after-checker-returned-to-maker');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Given an MIA deal that has been submitted to UKEF, maker has issued facilities and a checker has returned the deal to maker', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(mockDeal, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = mockDeal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.bonds = bonds;
        dealFacilities.loans = loans;
      });
    });
  });

  after(() => {
    cy.deleteDeals(ADMIN);

    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('Maker can edit only the issued facilities details that have already been submitted to checker (but NOT submitted to UKEF)', () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    cy.assertText(pages.contract.status(), "Further Maker's input required");

    /**
     * Proceed to review button should not be visible
     * until maker has made changes to the facility
     */
    pages.contract.proceedToReview().should('not.exist');

    //---------------------------------------------------------------
    // facilities should be in correct shape,
    // maker can edit the issued facility,
    // maker can submit Issued Facility forms
    //---------------------------------------------------------------

    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.uniqueNumberLink().should('not.exist');
      bondRow.uniqueNumber().should('be.visible');

      cy.assertText(bondRow.bondStatus(), "Maker's input required");

      cy.assertText(bondRow.issueFacilityLink(), 'Facility issued');

      bondRow.issueFacilityLink().click();
      cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

      cy.keyboardInput(pages.bondIssueFacility.issuedDateDayInput(), dateConstants.todayDay);
      cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateDayInput(), `${dateConstants.oneMonthDay}-`);

      cy.clickSubmitButton();

      pages.bondIssueFacility.requestedCoverStartDateError().contains('The day for the requested Cover Start Date must include 1 or 2 numbers');

      cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateDayInput(), dateConstants.oneMonthDay);
      cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateMonthInput(), `${dateConstants.oneMonthMonth}3`);

      cy.clickSubmitButton();

      pages.bondIssueFacility.requestedCoverStartDateError().contains('The month for the requested Cover Start Date must include 1 or 2 numbers');

      cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateMonthInput(), dateConstants.oneMonthMonth);
      cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateYearInput(), `${dateConstants.oneMonthYear}/`);

      cy.clickSubmitButton();

      pages.bondIssueFacility.requestedCoverStartDateError().contains('The year for the requested Cover Start Date must include 4 numbers');

      cy.keyboardInput(pages.bondIssueFacility.requestedCoverStartDateYearInput(), dateConstants.oneMonthYear);
      cy.keyboardInput(pages.bondIssueFacility.coverEndDateDayInput(), `${dateConstants.twoMonthsDay}-`);

      cy.clickSubmitButton();

      pages.bondIssueFacility.coverEndDateError().contains('The day for the cover end date must only include 1 or 2 numbers');

      cy.keyboardInput(pages.bondIssueFacility.coverEndDateDayInput(), dateConstants.twoMonthsDay);
      cy.keyboardInput(pages.bondIssueFacility.coverEndDateMonthInput(), `${dateConstants.twoMonthsMonth}3`);

      cy.clickSubmitButton();

      pages.bondIssueFacility.coverEndDateError().contains('The month for the cover end date must only include 1 or 2 numbers');

      cy.keyboardInput(pages.bondIssueFacility.coverEndDateMonthInput(), dateConstants.twoMonthsMonth);
      cy.keyboardInput(pages.bondIssueFacility.coverEndDateYearInput(), `${dateConstants.twoMonthsYear}/`);

      cy.clickSubmitButton();

      pages.bondIssueFacility.coverEndDateError().contains('The year for the Cover End Date must include 4 numbers');

      cy.keyboardInput(pages.bondIssueFacility.coverEndDateYearInput(), dateConstants.twoMonthsYear);
      cy.clickSubmitButton();
    });

    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.nameLink().should('not.exist');
      loanRow.name().should('be.visible');

      cy.assertText(loanRow.loanStatus(), "Maker's input required");

      cy.assertText(loanRow.issueFacilityLink(), 'Facility issued');

      loanRow.issueFacilityLink().click();
      cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

      cy.keyboardInput(pages.loanIssueFacility.issuedDateDayInput(), dateConstants.todayDay);
      cy.clickSubmitButton();
    });

    //---------------------------------------------------------------
    // maker can re-submit the deal back to checker
    //---------------------------------------------------------------

    pages.contract.proceedToReview().should('not.be.disabled');
    cy.clickProceedToReviewButton();
    cy.keyboardInput(pages.contractReadyForReview.comments(), 'Updated issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the dashboard after successful submit
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
