const pages = require('../../pages');
const mockUsers = require('../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.username === 'BANK1_CHECKER1'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

const dealReadyToSubmit = require('./test-data/dealReadyToSubmit');

// NOTE: disabled because it fails in github PR actions.
context.skip('A TFM checker submits a deal', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.insertManyDeals([dealReadyToSubmit()], MAKER_LOGIN)
      .then((insertedDeals) => {
        [deal] = insertedDeals;
        dealId = deal._id;

        const { mockFacilities } = dealReadyToSubmit();

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'Bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'Loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN);
    });
  });

  it('TFM Checker submits a deal; UKEF deal and facility IDs are displayed', () => {
    cy.login(CHECKER_LOGIN);
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
