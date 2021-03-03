import relative from '../../relativeURL';
import partials from '../../partials';
import MOCK_DEAL from '../../../fixtures/deal';
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

context('Facility page', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('renders case summary with deal data', () => {
    const facilityId = dealFacilities[0]._id; // eslint-disable-line no-underscore-dangle
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    // check that a couple of case summary elements have data
    // (no need to check all in E2E test)
    partials.caseSummary.ukefDealId().should('be.visible');
    partials.caseSummary.ukefDealId().invoke('text').then((text) => {
      expect(text.trim()).equal(MOCK_DEAL.details.ukefDealId);
    });

    partials.caseSummary.supplierName().should('be.visible');
    partials.caseSummary.supplierName().invoke('text').then((text) => {
      expect(text.trim()).equal(MOCK_DEAL.submissionDetails['supplier-name']);
    });
  });

  it('user can navigate back to parties page via sub navigation', () => {
    const facilityId = dealFacilities[0]._id; // eslint-disable-line no-underscore-dangle
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    partials.caseSubNavigation.partiesLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/parties`));
  });
});
