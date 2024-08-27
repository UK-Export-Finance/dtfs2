const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { fillAndSubmitIssueBondFacilityForm } = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const { fillAndSubmitIssueLoanFacilityForm } = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('A maker should not be able to submit the deal if it has atleast one `Incomplete` facility', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = dealWithNotStartedFacilityStatuses;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.bonds = bonds;
        dealFacilities.loans = loans;
      });
    });
  });

  beforeEach(() => {
    // Login and visit the deal
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);
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

  it('Complete few facilities for submission', () => {
    pages.contract.proceedToReview().should('not.exist');

    const firstBondId = dealFacilities.bonds[0]._id;
    const firstBondRow = pages.contract.bondTransactionsTable.row(firstBondId);

    const thirdBondId = dealFacilities.bonds[2]._id;
    const thirdBondRow = pages.contract.bondTransactionsTable.row(thirdBondId);

    const firstLoanId = dealFacilities.loans[0]._id;
    const firstLoanRow = pages.contract.loansTransactionsTable.row(firstLoanId);

    const thirdLoanId = dealFacilities.loans[2]._id;
    const thirdLoanRow = pages.contract.loansTransactionsTable.row(thirdLoanId);

    //---------------------------------------------------------------
    // check initial facility stage, status and issue facility link
    //---------------------------------------------------------------
    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow
        .facilityStage()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Unissued');
        });

      bondRow
        .bondStatus()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Not started');
        });

      bondRow
        .issueFacilityLink()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Issue facility');
        });

      bondRow
        .issueFacilityLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/contract/${dealId}/bond/${bondId}/issue-facility`);
        });
    });

    //---------------------------------------------------------------
    // check initial Loan stage, status and issue facility link
    //---------------------------------------------------------------
    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow
        .facilityStage()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Conditional');
        });

      loanRow
        .loanStatus()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Not started');
        });

      loanRow
        .issueFacilityLink()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Issue facility');
        });

      loanRow
        .issueFacilityLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/contract/${dealId}/loan/${loanId}/issue-facility`);
        });
    });

    //---------------------------------------------------------------
    // makers completes first Bond Issue Facility form
    //---------------------------------------------------------------
    firstBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${firstBondId}/issue-facility`));

    fillAndSubmitIssueBondFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond facility link and status should be updated
    //---------------------------------------------------------------
    firstBondRow
      .issueFacilityLink()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });

    firstBondRow
      .bondStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

    //---------------------------------------------------------------
    // makers completes third Bond Issue Facility form
    //---------------------------------------------------------------
    thirdBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${thirdBondId}/issue-facility`));

    fillAndSubmitIssueBondFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond facility link and status should be updated
    //---------------------------------------------------------------
    thirdBondRow
      .issueFacilityLink()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });

    thirdBondRow
      .bondStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

    //---------------------------------------------------------------
    // makers completes one Loan Issue Facility form
    //---------------------------------------------------------------
    firstLoanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${firstLoanId}/issue-facility`));

    fillAndSubmitIssueLoanFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Loan facility link and status should be updated
    //---------------------------------------------------------------
    firstLoanRow
      .issueFacilityLink()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });

    firstLoanRow
      .loanStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

    //---------------------------------------------------------------
    // makers completes third Loan Issue Facility form
    //---------------------------------------------------------------
    thirdLoanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${thirdLoanId}/issue-facility`));

    fillAndSubmitIssueLoanFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Loan facility link and status should be updated
    //---------------------------------------------------------------
    thirdLoanRow
      .issueFacilityLink()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });

    thirdLoanRow
      .loanStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Completed');
      });
  });

  it('Maker start a bond and a loan and does not finish the whole journey', () => {
    //---------------------------------------------------------------
    // Maker starts, but does not finish, a different Issue Facility form (Bond)
    //---------------------------------------------------------------
    const incompleteIssueFacilityBondId = dealFacilities.bonds[1]._id;
    const incompleteIssueFacilityBondRow = pages.contract.bondTransactionsTable.row(incompleteIssueFacilityBondId);

    incompleteIssueFacilityBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${incompleteIssueFacilityBondId}/issue-facility`));

    pages.bondIssueFacility.name().type('1234');
    cy.clickSubmitButton();
    cy.clickCancelButton();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond with incomplete Issue Facility form
    // - status should not be updated
    // - link remains the same
    //---------------------------------------------------------------
    incompleteIssueFacilityBondRow
      .issueFacilityLink()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Issue facility');
      });

    incompleteIssueFacilityBondRow
      .bondStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Incomplete');
      });

    //---------------------------------------------------------------
    // Maker starts, but does not finish, a different Issue Facility form (Loan)
    //---------------------------------------------------------------
    const incompleteIssueFacilityLoanId = dealFacilities.loans[1]._id;
    const incompleteIssueFacilityLoanRow = pages.contract.loansTransactionsTable.row(incompleteIssueFacilityLoanId);

    incompleteIssueFacilityLoanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${incompleteIssueFacilityLoanId}/issue-facility`));

    pages.loanIssueFacility.disbursementAmount().type('1234');
    cy.clickSubmitButton();
    cy.clickCancelButton();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Loan with incomplete Issue Facility form
    // - status should not be updated
    // - link remains the same
    //---------------------------------------------------------------
    incompleteIssueFacilityLoanRow
      .issueFacilityLink()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Issue facility');
      });

    incompleteIssueFacilityLoanRow
      .loanStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Incomplete');
      });
  });

  it('Maker is unable to submit the application', () => {
    //---------------------------------------------------------------
    // Ensure Maker cannot submit a deal with `Incomplete` facilities
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.exist');
  });
});
