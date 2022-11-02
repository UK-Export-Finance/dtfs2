const pages = require('../../../../pages');
const relative = require('../../../../relativeURL');
const mockDeal = require('./MIA-deal-submitted-to-ukef-with-issued-facilities-after-checker-returned-to-maker');
const MOCK_USERS = require('../../../../../fixtures/users');
const dateConstants = require('../../../../../../../e2e-fixtures/dateConstants');

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
    cy.insertOneDeal(mockDeal, BANK1_MAKER1)
      .then((insertedDeal) => {
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

    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Further Maker\'s input required');
    });

    //---------------------------------------------------------------
    // 'proceed to review' button should be enabled
    // purely because facility statuses are 'Maker's input required'
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');

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

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Maker\'s input required');
      });

      bondRow.issueFacilityLink().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });

      bondRow.issueFacilityLink().click();
      cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));
      pages.bondIssueFacility.issuedDateDayInput().clear();
      pages.bondIssueFacility.issuedDateDayInput().type(dateConstants.todayDay);
      pages.bondIssueFacility.requestedCoverStartDateDayInput().clear().type(`${dateConstants.oneMonthDay}-`);
      pages.bondIssueFacility.submit().click();
      pages.bondIssueFacility.requestedCoverStartDateError().contains('The day for the requested Cover Start Date must include 1 or 2 numbers');
      pages.bondIssueFacility.requestedCoverStartDateDayInput().clear().type(dateConstants.oneMonthDay);
      pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear().type(`${dateConstants.oneMonthMonth}3`);
      pages.bondIssueFacility.submit().click();
      pages.bondIssueFacility.requestedCoverStartDateError().contains('The month for the requested Cover Start Date must include 1 or 2 numbers');
      pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear().type(dateConstants.oneMonthMonth);
      pages.bondIssueFacility.requestedCoverStartDateYearInput().clear().type(`${dateConstants.oneMonthYear}/`);
      pages.bondIssueFacility.submit().click();
      pages.bondIssueFacility.requestedCoverStartDateError().contains('The year for the requested Cover Start Date must include 4 numbers');
      pages.bondIssueFacility.requestedCoverStartDateYearInput().clear().type(dateConstants.oneMonthYear);
      pages.bondIssueFacility.coverEndDateDayInput().clear().type(`${dateConstants.twoMonthsDay}-`);
      pages.bondIssueFacility.submit().click();
      pages.bondIssueFacility.coverEndDateError().contains('The day for the cover end date must only include 1 or 2 numbers');
      pages.bondIssueFacility.coverEndDateDayInput().clear().type(dateConstants.twoMonthsDay);
      pages.bondIssueFacility.coverEndDateMonthInput().clear().type(`${dateConstants.twoMonthsMonth}3`);
      pages.bondIssueFacility.submit().click();
      pages.bondIssueFacility.coverEndDateError().contains('The month for the cover end date must only include 1 or 2 numbers');
      pages.bondIssueFacility.coverEndDateMonthInput().clear().type(dateConstants.twoMonthsMonth);
      pages.bondIssueFacility.coverEndDateYearInput().clear().type(`${dateConstants.twoMonthsYear}/`);
      pages.bondIssueFacility.submit().click();
      pages.bondIssueFacility.coverEndDateError().contains('The year for the Cover End Date must include 4 numbers');
      pages.bondIssueFacility.coverEndDateYearInput().clear().type(dateConstants.twoMonthsYear);
      pages.bondIssueFacility.submit().click();
    });

    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.nameLink().should('not.exist');
      loanRow.name().should('be.visible');

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Maker\'s input required');
      });

      loanRow.issueFacilityLink().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });

      loanRow.issueFacilityLink().click();
      cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));
      pages.loanIssueFacility.issuedDateDayInput().clear();
      pages.loanIssueFacility.issuedDateDayInput().type(dateConstants.todayDay);
      pages.bondIssueFacility.submit().click();
    });

    //---------------------------------------------------------------
    // maker can re-submit the deal back to checker
    //---------------------------------------------------------------

    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Updated issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the dashboard after successful submit
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
