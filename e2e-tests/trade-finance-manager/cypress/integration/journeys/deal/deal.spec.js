import relative from '../../relativeURL';
import pages from '../../pages';
import MOCK_DEAL from '../../../fixtures/deal';

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
    // cy.login(MOCK_USER);

    cy.visit(relative(`/case/deal/${dealId}`));

    pages.caseDealPage.caseSummary().should('exist');
    pages.caseDealPage.caseSubNavigation().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
    pages.caseDealPage.mgaVersion().should('exist');
  });

  it('should render correct MGA version', () => {
    pages.caseDealPage.mgaVersion().should('have.text', 'January 2020');
  });

  describe('facilities table', () => {
    it('clicking `Facility ID` link should take user to facility details page when', () => {
      // cy.login(MOCK_USER);
      cy.visit(relative(`/case/deal/${dealId}`));

      const facilityId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      cy.url().should('eq', relative(`/case/facility/${facilityId}`));
    });
  });
});
