const { format, addMonths } = require('date-fns');

const pages = require('../../pages');
const relative = require('../../relativeURL');
const AINDeal = require('./fixtures/AIN-deal-submitted-3-months-more');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { LONG_FORM_DATE_FORMAT } = require('../../../fixtures/constants');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Issue facilities beyond 3 months of submission - errors', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const submissionDate = new Date(AINDeal.details.submissionDate);
  const submissionDateFormatted = format(submissionDate, LONG_FORM_DATE_FORMAT);
  const submissionDatePlus3Months = format(addMonths(submissionDate, 3), LONG_FORM_DATE_FORMAT);

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(AINDeal, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = AINDeal;

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

  it('should show an error for bond cover start date beyond 3 years from submission date', () => {
    cy.login(BANK1_MAKER1);

    pages.contract.visit(deal);

    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.issueFacilityLink().click();
      cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

      // cover starts on submission
      pages.bondIssueFacility.issuedDateDayInput().clear().type(day);
      pages.bondIssueFacility.issuedDateMonthInput().clear().type(month);
      pages.bondIssueFacility.issuedDateYearInput().clear().type(year);

      pages.bondIssueFacility.coverEndDateDayInput().clear().type(day);
      pages.bondIssueFacility.coverEndDateMonthInput().clear().type(month);
      pages.bondIssueFacility
        .coverEndDateYearInput()
        .clear()
        .type(year + 1);

      cy.clickSubmitButton();
      pages.bondIssueFacility
        .requestedCoverStartDateError()
        .contains(`Requested Cover Start Date must be between ${submissionDateFormatted} and ${submissionDatePlus3Months}`);

      // cover starts beyond 3 months from submission

      pages.bondIssueFacility.requestedCoverStartDateDayInput().clear().type(day);
      pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear().type(month);
      pages.bondIssueFacility
        .requestedCoverStartDateYearInput()
        .clear()
        .type(year + 1);

      cy.clickSubmitButton();
      pages.bondIssueFacility
        .requestedCoverStartDateError()
        .contains(`Requested Cover Start Date must be between ${submissionDateFormatted} and ${submissionDatePlus3Months}`);
      pages.bondIssueFacility.coverEndDateError().contains('Cover End Date must be after the Requested Cover Start Date');
    });
  });

  it('should show an error for loan cover start date beyond 3 years from submission date', () => {
    cy.login(BANK1_MAKER1);

    pages.contract.visit(deal);

    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.issueFacilityLink().click();
      cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

      // cover starts on submission

      pages.loanIssueFacility.issuedDateDayInput().clear().type(day);
      pages.loanIssueFacility.issuedDateMonthInput().clear().type(month);
      pages.loanIssueFacility.issuedDateYearInput().clear().type(year);

      pages.loanIssueFacility.coverEndDateDayInput().clear().type(day);
      pages.loanIssueFacility.coverEndDateMonthInput().clear().type(month);
      pages.loanIssueFacility
        .coverEndDateYearInput()
        .clear()
        .type(year + 1);

      cy.clickSubmitButton();
      pages.loanIssueFacility
        .requestedCoverStartDateError()
        .contains(`Requested Cover Start Date must be between ${submissionDateFormatted} and ${submissionDatePlus3Months}`);

      // cover starts beyond 3 months from submission

      pages.loanIssueFacility.requestedCoverStartDateDayInput().clear().type(day);
      pages.loanIssueFacility.requestedCoverStartDateMonthInput().clear().type(month);
      pages.loanIssueFacility.requestedCoverStartDateYearInput().clear().type(year);

      cy.clickSubmitButton();
      pages.loanIssueFacility
        .requestedCoverStartDateError()
        .contains(`Requested Cover Start Date must be between ${submissionDateFormatted} and ${submissionDatePlus3Months}`);
    });
  });
});

context('Issue facilities beyond 3 months of submission specialIssuePermission - no errors', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(AINDeal, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = AINDeal;

      mockFacilities[0].specialIssuePermission = true;
      mockFacilities[1].specialIssuePermission = true;

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

  it('should not show an error for bond cover start date beyond 3 months from submission date and issue the facility', () => {
    cy.login(BANK1_MAKER1);

    pages.contract.visit(deal);

    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.issueFacilityLink().click();
      cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

      // cover starts on submission
      pages.bondIssueFacility.issuedDateDayInput().clear().type(day);
      pages.bondIssueFacility.issuedDateMonthInput().clear().type(month);
      pages.bondIssueFacility.issuedDateYearInput().clear().type(year);

      pages.bondIssueFacility.coverEndDateDayInput().clear().type(day);
      pages.bondIssueFacility.coverEndDateMonthInput().clear().type(month);
      pages.bondIssueFacility
        .coverEndDateYearInput()
        .clear()
        .type(year + 1);

      cy.clickSubmitButton();
      cy.url().should('eq', relative(`/contract/${dealId}`));

      cy.assertText(bondRow.issueFacilityLink(), 'Facility issued');

      bondRow.issueFacilityLink().click();
      pages.bondIssueFacility.requestedCoverStartDateDayInput().clear().type(day);
      pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear().type(month);
      pages.bondIssueFacility.requestedCoverStartDateYearInput().clear().type(year);

      cy.clickSubmitButton();
      cy.url().should('eq', relative(`/contract/${dealId}`));

      cy.assertText(bondRow.issueFacilityLink(), 'Facility issued');
    });
  });

  it('should not show an error for loan cover start date beyond 3 months from submission date and issue the facility', () => {
    cy.login(BANK1_MAKER1);

    pages.contract.visit(deal);

    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.issueFacilityLink().click();
      cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

      // cover starts on submission

      pages.loanIssueFacility.issuedDateDayInput().clear().type(day);
      pages.loanIssueFacility.issuedDateMonthInput().clear().type(month);
      pages.loanIssueFacility.issuedDateYearInput().clear().type(year);

      pages.loanIssueFacility.coverEndDateDayInput().clear().type(day);
      pages.loanIssueFacility.coverEndDateMonthInput().clear().type(month);
      pages.loanIssueFacility
        .coverEndDateYearInput()
        .clear()
        .type(year + 1);

      cy.clickSubmitButton();
      cy.url().should('eq', relative(`/contract/${dealId}`));

      cy.assertText(loanRow.issueFacilityLink(), 'Facility issued');

      // cover starts beyond 3 months from submission
      loanRow.issueFacilityLink().click();

      pages.loanIssueFacility.requestedCoverStartDateDayInput().clear().type(day);
      pages.loanIssueFacility.requestedCoverStartDateMonthInput().clear().type(month);
      pages.loanIssueFacility.requestedCoverStartDateYearInput().clear().type(year);

      cy.clickSubmitButton();
      cy.url().should('eq', relative(`/contract/${dealId}`));

      cy.assertText(loanRow.issueFacilityLink(), 'Facility issued');
    });
  });
});
