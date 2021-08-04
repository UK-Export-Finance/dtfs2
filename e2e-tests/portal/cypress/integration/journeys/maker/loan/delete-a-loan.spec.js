const moment = require('moment');
const pages = require('../../../pages');
const partials = require('../../../partials');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
    status: 'DRAFT',
  },
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
  mockFacilities: [
    {
      "facilityType": "loan",
      "_id": "1000210",
      "createdDate": moment().utc().valueOf(),
      "facilityStage": "Conditional",
      "ukefGuaranteeInMonths": "12",
      "bankReferenceNumber": "",
      "guaranteeFeePayableByBank": "18.0000",
      "lastEdited": moment().utc().valueOf(),
      "facilityValue": "1234.00",
      "currencySameAsSupplyContractCurrency": "true",
      "interestMarginFee": "20",
      "coveredPercentage": "40",
      "minimumQuarterlyFee": "",
      "ukefExposure": "493.60",
      "premiumType": "At maturity",
      "dayCountBasis": "365"
    },
    {
      "facilityType": "loan",
      "_id": "1000210",
      "createdDate": moment().utc().valueOf(),
      "facilityStage": "Conditional",
      "ukefGuaranteeInMonths": "12",
      "bankReferenceNumber": "",
      "guaranteeFeePayableByBank": "18.0000",
      "lastEdited": moment().utc().valueOf(),
      "facilityValue": "1234.00",
      "currencySameAsSupplyContractCurrency": "true",
      "interestMarginFee": "20",
      "coveredPercentage": "40",
      "minimumQuarterlyFee": "",
      "ukefExposure": "493.60",
      "premiumType": "At maturity",
      "dayCountBasis": "365"
    },
    {
      "facilityType": "loan",
      "_id": "1000210",
      "createdDate": moment().utc().valueOf(),
      "facilityStage": "Conditional",
      "ukefGuaranteeInMonths": "12",
      "bankReferenceNumber": "",
      "guaranteeFeePayableByBank": "18.0000",
      "lastEdited": moment().utc().valueOf(),
      "facilityValue": "1234.00",
      "currencySameAsSupplyContractCurrency": "true",
      "interestMarginFee": "20",
      "coveredPercentage": "40",
      "minimumQuarterlyFee": "",
      "ukefExposure": "493.60",
      "premiumType": "At maturity",
      "dayCountBasis": "365"
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
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MOCK_DEAL, MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const loans = createdFacilities.filter((f) => f.facilityType === 'loan');

          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.loans.forEach((facility) => {
      if (facility._id !== loanToDeleteId) {
        cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
      }
    });
  });


  it('Deleting a loan via the Deal page should remove the loan and redirect back to the Deal page with a success message', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.loansTransactionsTableRows().should('have.length', 3);

    loanToDeleteId = dealFacilities.loans[1]._id; // eslint-disable-line no-underscore-dangle
    const loanToDeleteRow = pages.contract.loansTransactionsTable.row(loanToDeleteId);

    loanToDeleteRow.deleteLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanToDeleteId}/delete`));

    pages.loanDelete.submit().click();

    cy.url().should('eq', relative(`/contract/${dealId}`));

    partials.successMessage.successMessageListItem().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`Loan #${loanToDeleteId} has been deleted`);
    });

    pages.contract.loansTransactionsTableRows().should('have.length', 2);
    pages.contract.loansTransactionsTable.row(loanToDeleteId).row.should('not.exist');
  });
});
