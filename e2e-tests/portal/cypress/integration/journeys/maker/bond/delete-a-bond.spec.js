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
      facilityType: 'bond',
      createdDate: moment().utc().valueOf(),
      bondIssuer: 'test',
      bondType: 'Bid bond',
      facilityStage: 'Unissued',
      ukefGuaranteeInMonths: '12',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      facilityValue: '21313.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '20',
      coveredPercentage: '30',
      minimumRiskMarginFee: '',
      ukefExposure: '6,393.90',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
    },
    {
      facilityType: 'bond',
      createdDate: moment().utc().valueOf(),
      bondIssuer: 'test',
      bondType: 'Bid bond',
      facilityStage: 'Unissued',
      ukefGuaranteeInMonths: '12',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      facilityValue: '21313.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '20',
      coveredPercentage: '30',
      minimumRiskMarginFee: '',
      ukefExposure: '6,393.90',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
    },
    {
      facilityType: 'bond',
      createdDate: moment().utc().valueOf(),
      bondIssuer: 'test',
      bondType: 'Bid bond',
      facilityStage: 'Unissued',
      ukefGuaranteeInMonths: '12',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      facilityValue: '21313.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '20',
      coveredPercentage: '30',
      minimumRiskMarginFee: '',
      ukefExposure: '6,393.90',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
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
          const bonds = createdFacilities.filter((f) => f.facilityType === 'bond');

          dealFacilities.bonds = bonds;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      if (facility._id !== bondToDeleteId) {
        cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
      }
    });
  });

  it('Deleting a bond via the Deal page should remove the bond and redirect back to the Deal page with a success message', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.bondTransactionsTableRows().should('have.length', 3);

    bondToDeleteId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondToDeleteRow = pages.contract.bondTransactionsTable.row(bondToDeleteId);

    bondToDeleteRow.deleteLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondToDeleteId}/delete`));

    pages.bondDelete.submit().click();

    cy.url().should('eq', relative(`/contract/${dealId}`));

    partials.successMessage.successMessageListItem().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`Bond #${bondToDeleteId} has been deleted`);
    });

    pages.contract.bondTransactionsTableRows().should('have.length', 2);
    pages.contract.bondTransactionsTable.row(bondToDeleteId).row.should('not.exist');
  });
});
