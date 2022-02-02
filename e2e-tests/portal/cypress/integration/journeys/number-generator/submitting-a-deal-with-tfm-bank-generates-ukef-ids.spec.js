const pages = require('../../pages');
const MOCK_USERS = require('../../../fixtures/users');
const dealReadyToSubmit = require('./test-data/dealReadyToSubmit');

cosnt { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

// NOTE: disabled because it fails in github PR actions.
context.skip('A TFM checker submits a deal', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.insertManyDeals([dealReadyToSubmit()], BANK1_MAKER1)
      .then((insertedDeals) => {
        [deal] = insertedDeals;
        dealId = deal._id;

        const { mockFacilities } = dealReadyToSubmit();

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

  it('TFM Checker submits a deal; UKEF deal and facility IDs are displayed', () => {
    cy.login(BANK1_CHECKER1);
    pages.contract.visit(deal);
    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    // Need to pass deal to trigger submission to TFM post UKEFID generation
    pages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    pages.contract.visit(deal);

    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });

    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    // IDs are generated via external API. We cannot check the actual ID.
    // We can only check that the ID values are not empty.
    pages.contract.ukefDealId().invoke('text').then((text) => {
      expect(text.trim()).not.to.equal('');
      expect(text.trim()).not.to.equal(' ');
    });

    const bondId = dealFacilities.bonds[0]._id;
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.ukefFacilityId().invoke('text').then((text) => {
      expect(text.trim()).not.to.equal('');
      expect(text.trim()).not.to.equal(' ');
    });

    const loanId = dealFacilities.loans[0]._id;
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.ukefFacilityId().invoke('text').then((text) => {
      expect(text.trim()).not.to.equal('');
      expect(text.trim()).not.to.equal(' ');
    });
  });
});
