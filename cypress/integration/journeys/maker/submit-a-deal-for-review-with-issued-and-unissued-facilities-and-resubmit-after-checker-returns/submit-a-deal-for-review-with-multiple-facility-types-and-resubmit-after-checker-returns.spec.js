const pages = require('../../../pages');
const mockUsers = require('../../../../fixtures/mockUsers');
const dealReadyToSubmitToChecker = require('./dealReadyToSubmitToChecker');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('A maker and checker can submit and re-submit a deal to each other multiple times', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealReadyToSubmitToChecker, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  const assertFacilityTableValuesWithDealStatusInDraft = () => {
    deal.bondTransactions.items.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.bondStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.bondStage);
      });
      bondRow.deleteLink().should('be.visible');
      bondRow.issueFacilityLink().should('not.be.visible');
    });

    deal.loanTransactions.items.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.deleteLink().should('be.visible');
      loanRow.issueFacilityLink().should('not.be.visible');
    });
  };

  const assertFacilityTableValuesWithDealStatusInFurtherMakerInputRequired = () => {
    const unissuedBonds = deal.bondTransactions.items.filter((b) => b.bondStage === 'Unissued');
    const issuedBonds = deal.bondTransactions.items.filter((b) => b.bondStage === 'Issued');

    const conditionalLoans = deal.loanTransactions.items.filter((l) => l.facilityStage === 'Conditional');
    const unconditionalLoans = deal.loanTransactions.items.filter((l) => l.facilityStage === 'Unconditional');

    unissuedBonds.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.bondStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.bondStage);
      });

      bondRow.issueFacilityLink().should('be.visible');
      bondRow.issueFacilityLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/contract/${dealId}/bond/${bondId}/issue-facility`);
      });
      bondRow.deleteLink().should('not.be.visible');
    });

    issuedBonds.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.bondStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.bondStage);
      });

      bondRow.issueFacilityLink().should('not.be.visible');
      bondRow.deleteLink().should('not.be.visible');
    });

    conditionalLoans.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.issueFacilityLink().should('be.visible');
      loanRow.issueFacilityLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/contract/${dealId}/loan/${loanId}/issue-facility`);
      });
      loanRow.deleteLink().should('not.be.visible');
    });

    unconditionalLoans.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.issueFacilityLink().should('not.be.visible');
      loanRow.deleteLink().should('not.be.visible');
    });
  };

  const assertFacilityTableValuesWithDealStatusInReadyForChecker = () => {
    const unissuedBonds = deal.bondTransactions.items.filter((b) => b.bondStage === 'Unissued');
    const issuedBonds = deal.bondTransactions.items.filter((b) => b.bondStage === 'Issued');

    const conditionalLoans = deal.loanTransactions.items.filter((l) => l.facilityStage === 'Conditional');
    const unconditionalLoans = deal.loanTransactions.items.filter((l) => l.facilityStage === 'Unconditional');

    unissuedBonds.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.bondStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.bondStage);
      });

      bondRow.issueFacilityLink().should('be.visible');
      bondRow.issueFacilityLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/contract/${dealId}/bond/${bondId}/preview`);
      });
      bondRow.deleteLink().should('not.be.visible');
    });

    issuedBonds.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.bondStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.bondStage);
      });

      bondRow.issueFacilityLink().should('not.be.visible');
      bondRow.deleteLink().should('not.be.visible');
    });

    conditionalLoans.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.issueFacilityLink().should('be.visible');
      loanRow.issueFacilityLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/contract/${dealId}/loan/${loanId}/preview`);
      });
      loanRow.deleteLink().should('not.be.visible');
    });

    unconditionalLoans.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.issueFacilityLink().should('not.be.visible');
      loanRow.deleteLink().should('not.be.visible');
    });
  };

  it('Unchanged/unissued Facility statuses should be retained as they were in Draft (`Completed`) during all stages of submits/re-submits; `Delete` or `Issue Facility` links should appear for correct facility types.', () => {
    //---------------------------------------------------------------
    // maker submits deal to checker
    //---------------------------------------------------------------

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    assertFacilityTableValuesWithDealStatusInDraft();

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Ready for review');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker returns deal to maker
    //---------------------------------------------------------------

    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.returnToMaker().click();
    pages.contractReturnToMaker.comments().type('Nope');
    pages.contractReturnToMaker.returnToMaker().click();

    //---------------------------------------------------------------
    // maker views deal
    //---------------------------------------------------------------

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    assertFacilityTableValuesWithDealStatusInFurtherMakerInputRequired();

    //---------------------------------------------------------------
    // maker re-submits deal with no changes
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Ready for review');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    pages.contract.visit(deal);

    assertFacilityTableValuesWithDealStatusInReadyForChecker();
  });
});
