const pages = require('../../pages');
const mockUsers = require('../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.username === 'CHECKER-TFM'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'MAKER-TFM'));

const dealReadyToSubmit = require('./test-data/dealReadyToSubmit');

context('A TFM checker submits a deal', () => {
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
    cy.insertManyDeals([dealReadyToSubmit()], MAKER_LOGIN)
      .then(insertedDeals => {
        deal = insertedDeals[0];
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = dealReadyToSubmit();

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  afterEach(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });
  });

  it('TFM Checker submits a deal; UKEF deal and facility IDs are displayed', () => {
    cy.login(CHECKER_LOGIN);
    pages.contract.visit(deal);
    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    pages.contract.visit(deal);

    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for Checker\'s approval');
    });

    // IDs are generated via external API. We cannot check the actual ID.
    // We can only check that the ID values are not empty.
    pages.contract.ukefDealId().invoke('text').then((text) => {
      expect(text.trim()).not.to.equal('');
      expect(text.trim()).not.to.equal(' ');
    });

    const bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.ukefFacilityId().invoke('text').then((text) => {
      expect(text.trim()).not.to.equal('');
      expect(text.trim()).not.to.equal(' ');
    });

    const loanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.ukefFacilityId().invoke('text').then((text) => {
      expect(text.trim()).not.to.equal('');
      expect(text.trim()).not.to.equal(' ');
    });
  });
});
