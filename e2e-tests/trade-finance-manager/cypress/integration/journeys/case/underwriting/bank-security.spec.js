import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';

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
  teams: ['UNDERWRITERS'],
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

context('Case Underwriting - Bank Security', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL_MIA._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_MIA;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });
  });

  beforeEach(() => {
    const underWritingSupportUser = MOCK_USERS.find((user) =>
      user.teams.includes('UNDERWRITERS'));

    cy.login(underWritingSupportUser);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.bankSecurityLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/bank-security`));
  });

  afterEach(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('bank security page should display security details', () => {
    partials.underwritingSubNav.bankSecurityLink().should('have.class', 'moj-side-navigation__item--active');
    pages.underwritingBankSecurity.bankSecurityHeading().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Bank Security');
    });

    pages.underwritingBankSecurity.bankSecurityText().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_DEAL_MIA.dealFiles.security);
    });
  });
});
