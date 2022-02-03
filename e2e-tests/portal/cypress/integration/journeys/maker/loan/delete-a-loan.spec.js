const pages = require('../../../pages');
const partials = require('../../../partials');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

const now = new Date().valueOf();

const MOCK_DEAL = {
  bankInternalRefName: 'someDealId',
  additionalRefName: 'someDealName',
  status: 'Draft',
  details: {},
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
  mockFacilities: [
    {
      type: 'Loan',
      _id: '1000210',
      createdDate: now,
      facilityStage: 'Conditional',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      name: '',
      guaranteeFeePayableByBank: '18.0000',
      updatedAt: Date.now(),
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '20',
      coveredPercentage: '40',
      minimumQuarterlyFee: '',
      ukefExposure: '493.60',
      premiumType: 'At maturity',
      dayCountBasis: '365',
    },
    {
      type: 'Loan',
      _id: '1000210',
      createdDate: now,
      facilityStage: 'Conditional',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      name: '',
      guaranteeFeePayableByBank: '18.0000',
      updatedAt: Date.now(),
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '20',
      coveredPercentage: '40',
      minimumQuarterlyFee: '',
      ukefExposure: '493.60',
      premiumType: 'At maturity',
      dayCountBasis: '365',
    },
    {
      type: 'Loan',
      _id: '1000210',
      createdDate: now,
      facilityStage: 'Conditional',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      name: '',
      guaranteeFeePayableByBank: '18.0000',
      updatedAt: Date.now(),
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '20',
      coveredPercentage: '40',
      minimumQuarterlyFee: '',
      ukefExposure: '493.60',
      premiumType: 'At maturity',
      dayCountBasis: '365',
    },
  ],
};

context('Delete a Loan', () => {
  let deal;
  let dealId;
  let loanToDeleteId;
  const dealFacilities = {
    loans: [],
  };

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MOCK_DEAL, BANK1_MAKER1)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;

        const { mockFacilities } = MOCK_DEAL;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          const loans = createdFacilities.filter((f) => f.type === 'Loan');

          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.loans.forEach((facility) => {
      if (facility._id !== loanToDeleteId) {
        cy.deleteFacility(facility._id, BANK1_MAKER1);
      }
    });
  });

  it('Deleting a loan via the Deal page should remove the loan and redirect back to the Deal page with a success message', () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    pages.contract.loansTransactionsTableRows().should('have.length', 3);

    loanToDeleteId = dealFacilities.loans[1]._id;
    const loanToDeleteRow = pages.contract.loansTransactionsTable.row(loanToDeleteId);

    loanToDeleteRow.deleteLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanToDeleteId}/delete`));

    pages.loanDelete.submit().click();

    cy.url().should('eq', relative(`/contract/${dealId}`));

    partials.successMessage.successMessageListItem().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`Loan #${loanToDeleteId} has been deleted`);
    });

    pages.contract.loansTransactionsTableRows().should('have.length', 2);
  });
});
