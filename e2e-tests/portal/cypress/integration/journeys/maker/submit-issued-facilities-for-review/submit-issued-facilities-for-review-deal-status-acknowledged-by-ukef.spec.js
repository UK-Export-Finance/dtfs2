const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const mockUsers = require('../../../../fixtures/mockUsers');
const { fillAndSubmitIssueBondFacilityForm } = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const { fillAndSubmitIssueLoanFacilityForm } = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));

context('A maker can issue and submit issued bond and loan facilities with a deal in `Acknowledged by UKEF` status', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = dealWithNotStartedFacilityStatuses;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });
  });

  it('Completing Issue bond and Issue loan facility form\'s allows maker to re-submit the deal for review. Deal/facilities should be updated after submitting for review', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('be.disabled');

    const firstBondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const firstBondRow = pages.contract.bondTransactionsTable.row(firstBondId);

    const firstLoanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
    const firstLoanRow = pages.contract.loansTransactionsTable.row(firstLoanId);

    //---------------------------------------------------------------
    // check initial facility stage, status and issue facility link
    //---------------------------------------------------------------
    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Unissued');
      });

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Not started');
      });

      bondRow.issueFacilityLink().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Issue facility');
      });

      bondRow.issueFacilityLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/contract/${dealId}/bond/${bondId}/issue-facility`);
      });
    });

    //---------------------------------------------------------------
    // check initial Loan stage, status and issue facility link
    //---------------------------------------------------------------
    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Conditional');
      });

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Not started');
      });

      loanRow.issueFacilityLink().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Issue facility');
      });

      loanRow.issueFacilityLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/contract/${dealId}/loan/${loanId}/issue-facility`);
      });
    });

    //---------------------------------------------------------------
    // makers completes one Bond Issue Facility form
    //---------------------------------------------------------------
    firstBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${firstBondId}/issue-facility`));

    fillAndSubmitIssueBondFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond facility link and status should be updated
    //---------------------------------------------------------------
    firstBondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    firstBondRow.bondStatus().invoke('text').then((text) => {
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
    firstLoanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    firstLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    //---------------------------------------------------------------
    // Maker starts, but doesn't finish, a different Issue Facility form (Bond)
    //---------------------------------------------------------------
    const incompleteIssueFacilityBondId = dealFacilities.bonds[1]._id; // eslint-disable-line no-underscore-dangle
    const incompleteIssueFacilityBondRow = pages.contract.bondTransactionsTable.row(incompleteIssueFacilityBondId);

    incompleteIssueFacilityBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${incompleteIssueFacilityBondId}/issue-facility`));

    pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');
    pages.bondIssueFacility.submit().click();
    pages.bondIssueFacility.cancelButton().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond with incomplete Issue Facility form
    // - status should not be updated
    // - link remains the same
    //---------------------------------------------------------------
    incompleteIssueFacilityBondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issue facility');
    });

    incompleteIssueFacilityBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Incomplete');
    });

    //---------------------------------------------------------------
    // Maker starts, but doesn't finish, a different Issue Facility form (Loan)
    //---------------------------------------------------------------
    const incompleteIssueFacilityLoanId = dealFacilities.loans[1]._id; // eslint-disable-line no-underscore-dangle
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
    incompleteIssueFacilityLoanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issue facility');
    });

    incompleteIssueFacilityLoanRow.loanStatus().invoke('text').then((text) => {
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

    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for Checker\'s approval');
    });

    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });

    //---------------------------------------------------------------
    // Facilities that have been issued should have updated:
    // - status
    // - stage
    // - issue facility link/text
    //---------------------------------------------------------------
    firstBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    firstBondRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issued');
    });

    firstBondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    firstBondRow.issueFacilityLink().invoke('attr', 'href').then((href) => {
      expect(href).to.equal(`/contract/${dealId}/submission-details#bond-${firstBondId}`);
    });

    firstLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    firstLoanRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Unconditional');
    });

    firstLoanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    firstLoanRow.issueFacilityLink().invoke('attr', 'href').then((href) => {
      expect(href).to.equal(`/contract/${dealId}/submission-details#loan-${firstLoanId}`);
    });

    //---------------------------------------------------------------
    // Facilities that have had started, but not finished Issue Facility Form,
    // should not be updated
    //---------------------------------------------------------------
    incompleteIssueFacilityBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Incomplete');
    });

    incompleteIssueFacilityBondRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Unissued');
    });

    incompleteIssueFacilityBondRow.issueFacilityLink().should('not.exist');


    incompleteIssueFacilityLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Incomplete');
    });

    incompleteIssueFacilityLoanRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Conditional');
    });

    incompleteIssueFacilityLoanRow.issueFacilityLink().should('not.exist');


    //---------------------------------------------------------------
    // Facilities that have NOT started should not be updated
    //---------------------------------------------------------------
    const notStartedIssueFacilityBondId = dealFacilities.bonds[2]._id; // eslint-disable-line no-underscore-dangle
    const notStartedIssueFacilityBondRow = pages.contract.bondTransactionsTable.row(notStartedIssueFacilityBondId);

    notStartedIssueFacilityBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    notStartedIssueFacilityBondRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Unissued');
    });

    notStartedIssueFacilityBondRow.issueFacilityLink().should('not.exist');


    const notStartedFacilityLoanId = dealFacilities.loans[2]._id; // eslint-disable-line no-underscore-dangle
    const notStartedFacilityLoanRow = pages.contract.loansTransactionsTable.row(notStartedFacilityLoanId);

    notStartedFacilityLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    notStartedFacilityLoanRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Conditional');
    });

    notStartedFacilityLoanRow.issueFacilityLink().should('not.exist');

    //---------------------------------------------------------------
    // Contract/deal action buttons should not exist or be disabled since:
    // - no other facilities have had their details/forms completed
    // - the deal is now has `Ready for Checker\'s approval` status
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.exist');
    pages.contract.abandonButton().should('be.disabled');
  });
});
