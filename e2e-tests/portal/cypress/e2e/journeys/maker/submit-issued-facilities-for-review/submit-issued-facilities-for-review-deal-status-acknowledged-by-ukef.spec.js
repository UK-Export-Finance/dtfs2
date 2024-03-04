const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { fillAndSubmitIssueBondFacilityForm } = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const { fillAndSubmitIssueLoanFacilityForm } = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('A maker can issue and submit issued bond and loan facilities with a deal in `Acknowledged` status', () => {
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

  after(() => {
    cy.deleteDeals(ADMIN);
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it("Completing Issue bond and Issue loan facility form's allows maker to re-submit the deal for review. Deal/facilities should be updated after submitting for review", () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);
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

    //---------------------------------------------------------------
    // Maker starts, but doesn't finish, a different Issue Facility form (Bond)
    //---------------------------------------------------------------
    const incompleteIssueFacilityBondId = dealFacilities.bonds[1]._id;
    const incompleteIssueFacilityBondRow = pages.contract.bondTransactionsTable.row(incompleteIssueFacilityBondId);

    incompleteIssueFacilityBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${incompleteIssueFacilityBondId}/issue-facility`));

    pages.bondIssueFacility.name().type('1234');
    pages.bondIssueFacility.submit().click();
    pages.bondIssueFacility.cancelButton().click();
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
    // Maker starts, but doesn't finish, a different Issue Facility form (Loan)
    //---------------------------------------------------------------
    const incompleteIssueFacilityLoanId = dealFacilities.loans[1]._id;
    const incompleteIssueFacilityLoanRow = pages.contract.loansTransactionsTable.row(incompleteIssueFacilityLoanId);

    incompleteIssueFacilityLoanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${incompleteIssueFacilityLoanId}/issue-facility`));

    pages.loanIssueFacility.disbursementAmount().type('1234');
    pages.loanIssueFacility.submit().click();
    pages.loanIssueFacility.cancelButton().click();
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

    //---------------------------------------------------------------
    // Maker submit's deal for review
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Issued a bond');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // Deal should be updated
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    pages.contract
      .status()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal("Ready for Checker's approval");
      });

    pages.contract
      .previousStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Acknowledged');
      });

    //---------------------------------------------------------------
    // Facilities that have been issued should have updated:
    // - status
    // - stage
    // - issue facility link/text
    //---------------------------------------------------------------
    firstBondRow
      .bondStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Ready for check');
      });

    firstBondRow
      .facilityStage()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Issued');
      });

    firstBondRow
      .issueFacilityLink()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });

    firstBondRow
      .issueFacilityLink()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal(`/contract/${dealId}/submission-details#bond-${firstBondId}`);
      });

    firstLoanRow
      .loanStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Ready for check');
      });

    firstLoanRow
      .facilityStage()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Unconditional');
      });

    firstLoanRow
      .issueFacilityLink()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });

    firstLoanRow
      .issueFacilityLink()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal(`/contract/${dealId}/submission-details#loan-${firstLoanId}`);
      });

    //---------------------------------------------------------------
    // Facilities that have had started, but not finished Issue Facility Form,
    // should not be updated
    //---------------------------------------------------------------
    incompleteIssueFacilityBondRow
      .bondStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Incomplete');
      });

    incompleteIssueFacilityBondRow
      .facilityStage()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Unissued');
      });

    incompleteIssueFacilityBondRow.issueFacilityLink().should('not.exist');

    incompleteIssueFacilityLoanRow
      .loanStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Incomplete');
      });

    incompleteIssueFacilityLoanRow
      .facilityStage()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Conditional');
      });

    incompleteIssueFacilityLoanRow.issueFacilityLink().should('not.exist');

    //---------------------------------------------------------------
    // Facilities that have been completed and submitted
    //---------------------------------------------------------------
    const completedIssueFacilityBondId = dealFacilities.bonds[2]._id;
    const completedIssueFacilityBondRow = pages.contract.bondTransactionsTable.row(completedIssueFacilityBondId);

    completedIssueFacilityBondRow
      .bondStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Ready for check');
      });

    completedIssueFacilityBondRow
      .facilityStage()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Issued');
      });

    completedIssueFacilityBondRow.issueFacilityLink().should('exist');

    const completedFacilityLoanId = dealFacilities.loans[2]._id;
    const completedFacilityLoanRow = pages.contract.loansTransactionsTable.row(completedFacilityLoanId);

    completedFacilityLoanRow
      .loanStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Ready for check');
      });

    completedFacilityLoanRow
      .facilityStage()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Unconditional');
      });

    completedFacilityLoanRow.issueFacilityLink().should('exist');

    //---------------------------------------------------------------
    // Contract/deal action buttons should not exist or be disabled since:
    // - no other facilities have had their details/forms completed
    // - the deal is now has `Ready for Checker\'s approval` status
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.exist');
    pages.contract.abandonButton().should('be.disabled');
  });
});
