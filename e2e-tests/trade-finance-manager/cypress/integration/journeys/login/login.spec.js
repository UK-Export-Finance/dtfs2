import relative from '../../relativeURL';
import pages from '../../pages';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../fixtures/users';

const MOCK_MAKER_TFM = {
  username: 'MAKER-TFM',
  password: 'AbC!2345',
  firstname: 'Tamil',
  surname: 'Rahani',
  email: 'maker@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'checker@ukexportfinance.gov.uk',
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

context('User can login', () => {
  let dealId;

  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        dealId = insertedDeal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM);

        cy.submitDeal(dealId);
      });
  });

  it('should login and redirect to /deals when successful', () => {
    pages.landingPage.visit();
    pages.landingPage.email().type(MOCK_USERS[0].username);
    pages.landingPage.submitButton().click();
    cy.url().should('eq', relative('/deals'));
  });

  it('should not login and redirect to /deals when successful', () => {
    pages.landingPage.visit();
    pages.landingPage.email().type('wrongUser');
    pages.landingPage.submitButton().click();
    cy.url().should('eq', relative('/'));
  });
});
