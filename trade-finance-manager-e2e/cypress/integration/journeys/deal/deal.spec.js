import relative from '../../relativeURL';
import pages from '../../pages';

const MOCK_USER = {
  username: 'MAKER',
  password: 'AbC!2345',
  firstname: 'Hugo',
  surname: 'Drax',
  email: 'maker@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: ['maker'],
  bank: {
    id: '956',
    name: 'Barclays Bank',
    emails: [
      'maker4@ukexportfinance.gov.uk',
      'checker4@ukexportfinance.gov.uk',
    ],
  },
};

const ADMIN_LOGIN = {
  username: 'ADMIN',
  password: 'AbC!2345',
  firstname: 'Julius',
  surname: 'No',
  email: '',
  timezone: 'Europe/London',
  roles: ['maker', 'editor', 'admin'],
  bank: {
    id: '*',
  },
};

const MOCK_DEAL = {
  _id: '1000676',
  details: {
    bankSupplyContractID: 'mock',
    bankSupplyContractName: 'test',
    submissionDate: 1597406043000,
  },
  submissionDetails: {
    'supplier-name': 'Supplier name',
    supplyContractCurrency: {
      id: 'GBP',
    },
    'buyer-name': 'Buyer name',
    'supply-contract-description': 'Test description',
    destinationOfGoodsAndServices: {
      name: 'United Kingdom',
    },
  },
};

context('User can view a case deal', () => {
  let deal;
  let dealId;

  before(() => {
    cy.deleteDeals(MOCK_DEAL._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL, MOCK_USER)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  // TODO: user flow etc (once built...)
  // this is more a POC of 'we can test things in cypress'
  // TODO: should we test for all data or seperate with component tests?
  // what's more robust?

  it('should render case deal components', () => {
    cy.login(MOCK_USER);

    // NOTE: temp for dev
    // expect to land on deal page
    cy.url().should('eq', relative(`/case/deal/${dealId}`));

    pages.caseDealPage.caseSummary().should('exist');
    pages.caseDealPage.caseSubNavigation().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
  });
});
