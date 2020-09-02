const moment = require('moment');
const pages = require('../../../../pages');
const relative = require('../../../../relativeURL');
const mockDeal = require('./MIA-deal-submitted-to-ukef-with-issued-facilities-after-checker-returned-to-maker');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

// use a deal with MIA submission type
// further maker input required status

context('Given an MIA deal that has been submitted to UKEF, maker has issued facilities and a checker has returned the deal to maker', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(mockDeal, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Maker can edit only the issued facilities details that have already been submitted to checker (but NOT submitted to UKEF)', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Further Maker\'s input required');
    });

    //---------------------------------------------------------------
    // facilities should be in correct shape,
    // maker can edit the issued facility,
    // maker can submit Issued Facility forms
    //---------------------------------------------------------------

    deal.bondTransactions.items.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.uniqueNumberLink().should('not.be.visible');
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
      pages.bondIssueFacility.issuedDateDayInput().type(moment().add(1, 'day').format('DD'));
      pages.bondIssueFacility.submit().click();
    });

    deal.loanTransactions.items.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.bankReferenceNumberLink().should('not.be.visible');
      loanRow.bankReferenceNumber().should('be.visible');

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Maker\'s input required');
      });

      loanRow.issueFacilityLink().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });

      loanRow.issueFacilityLink().click();
      cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));
      pages.loanIssueFacility.issuedDateDayInput().clear();
      pages.loanIssueFacility.issuedDateDayInput().type(moment().add(1, 'day').format('DD'));
      pages.bondIssueFacility.submit().click();
    });

    //---------------------------------------------------------------
    // maker can re-submit the deal back to checker
    //---------------------------------------------------------------

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Updated issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the dashboard after successful submit
    cy.url().should('eq', relative('/dashboard/0'));
  });
});
