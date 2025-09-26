const { today } = require('@ukef/dtfs2-common/test-helpers');
const { BOND_TYPE, CURRENCY } = require('@ukef/dtfs2-common');
const pages = require('../../pages');
const partials = require('../../partials');
const relative = require('../../relativeURL');
const { ADMIN, BANK1_MAKER1 } = require('../../../../../e2e-fixtures');

const now = today.unixMilliseconds;

const MOCK_DEAL = {
  bankInternalRefName: 'someDealId',
  additionalRefName: 'someDealName',
  status: 'Draft',
  submissionDetails: {
    supplyContractCurrency: {
      id: CURRENCY.GBP,
    },
  },
  mockFacilities: [
    {
      type: 'Bond',
      createdDate: now,
      bondIssuer: 'test',
      bondType: BOND_TYPE.BID_BOND,
      facilityStage: 'Unissued',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      value: '21313.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '20',
      coveredPercentage: '30',
      minimumRiskMarginFee: '',
      ukefExposure: '6,393.90',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: CURRENCY.GBP,
      },
    },
    {
      type: 'Bond',
      createdDate: now,
      bondIssuer: 'test',
      bondType: BOND_TYPE.BID_BOND,
      facilityStage: 'Unissued',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      value: '21313.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '20',
      coveredPercentage: '30',
      minimumRiskMarginFee: '',
      ukefExposure: '6,393.90',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: CURRENCY.GBP,
      },
    },
    {
      type: 'Bond',
      createdDate: now,
      bondIssuer: 'test',
      bondType: BOND_TYPE.BID_BOND,
      facilityStage: 'Unissued',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      value: '21313.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '20',
      coveredPercentage: '30',
      minimumRiskMarginFee: '',
      ukefExposure: '6,393.90',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: CURRENCY.GBP,
      },
    },
  ],
};

context('Delete a Bond', () => {
  let deal;
  let dealId;
  let bondToDeleteId;
  const dealFacilities = {
    bonds: [],
  };

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MOCK_DEAL, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = MOCK_DEAL;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');

        dealFacilities.bonds = bonds;
      });
    });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      if (facility._id !== bondToDeleteId) {
        cy.deleteFacility(facility._id, BANK1_MAKER1);
      }
    });
  });

  it('Deleting a bond via the Deal page should remove the bond and redirect back to the Deal page with a success message', () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    pages.contract.bondTransactionsTableRows().should('have.length', 3);

    bondToDeleteId = dealFacilities.bonds[0]._id;
    const bondToDeleteRow = pages.contract.bondTransactionsTable.row(bondToDeleteId);

    bondToDeleteRow.deleteLink().contains('Delete bond');
    bondToDeleteRow.deleteLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondToDeleteId}/delete`));

    cy.clickSubmitButton();

    cy.url().should('eq', relative(`/contract/${dealId}`));

    cy.assertText(partials.successMessage.successMessageListItem(), `Bond #${bondToDeleteId} has been deleted`);

    pages.contract.bondTransactionsTableRows().should('have.length', 2);
  });
});
