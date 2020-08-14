const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithIssuedFacilitiesReturnedToMaker = require('./dealWithIssuedFacilitiesReturnedToMaker');
const mockUsers = require('../../../../fixtures/mockUsers');
const { fillAndSubmitIssueBondFacilityForm } = require('./fillAndSubmitIssueBondFacilityForm');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('A maker can resubmit issued bond & loan facilities with a deal in `Further Maker\'s input required` status', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealWithIssuedFacilitiesReturnedToMaker, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Updating an Issue bond & Issue loan Facility form allows maker to re-submit the deal for review. Only the updated Deal/facilities should be updated after submitting for review', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('not.be.disabled');

    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Further Maker\'s input required');
    });

    const bondWithIssueFacilityDetailsProvided = deal.bondTransactions.items.find((b) =>
      b.issueFacilityDetailsProvided === true);

    const bondId = bondWithIssueFacilityDetailsProvided._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.bondStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issued');
    });

    bondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    bondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

    fillAndSubmitIssueBondFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // expect issue facility link text to not be changed
    bondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    const loanWithIssueFacilityDetailsProvided = deal.loanTransactions.items.find((l) =>
      l.issueFacilityDetailsProvided === true);

    const loanId = loanWithIssueFacilityDetailsProvided._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Unconditional');
    });

    loanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    loanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

    pages.loanIssueFacility.disbursementAmount().clear().type('5678');
    pages.loanIssueFacility.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // expect issue facility link text to not be changed
    loanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    pages.contract.proceedToReview().should('not.be.disabled');


    // submit deal for review
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Updated issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the /dashboard page
    cy.url().should('include', '/dashboard');

    pages.contract.visit(deal);

    // expect the deal status to be updated
    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for Checker\'s approval');
    });

    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Further Maker\'s input required');
    });

    // expect the bond status to be updated
    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    // expect the bond facility stage to be the same
    bondRow.bondStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issued');
    });

    // expect bond issue facility link text to be changed
    bondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    // expect the loan status to be updated
    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    // expect the loan facility stage to be the same
    loanRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Unconditional');
    });

    // expect loan issue facility link text to be changed
    loanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    // expect the bond we did not change to not have changes
    const bondWeDidNotChange = deal.bondTransactions.items.find((b) =>
      b._id !== bondId); // eslint-disable-line no-underscore-dangle

    const bondWeDidNotChangeId = bondWeDidNotChange._id;// eslint-disable-line no-underscore-dangle
    const bondWeDidNotChangeRow = pages.contract.bondTransactionsTable.row(bondWeDidNotChangeId);

    bondWeDidNotChangeRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Maker\'s input required');
    });

    bondWeDidNotChangeRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issue facility');
    });

    // expect the loan we did not change to not have a status change
    const loanWeDidNotChange = deal.loanTransactions.items.find((l) =>
      l._id !== loanId); // eslint-disable-line no-underscore-dangle

    const loanWeDidNotChangeId = loanWeDidNotChange._id;// eslint-disable-line no-underscore-dangle
    const loanWeDidNotChangeRow = pages.contract.loansTransactionsTable.row(loanWeDidNotChangeId);

    loanWeDidNotChangeRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Maker\'s input required');
    });

    loanWeDidNotChangeRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issue facility');
    });

    // since no other facilities have had their details/forms completed
    // and the deal is now has `Ready for Checker\'s approval` status
    // Proceed to Review button should not exist,
    // Abandon button should be disabled.
    pages.contract.proceedToReview().should('not.exist');
    pages.contract.abandonButton().should('be.disabled');
  });
});
