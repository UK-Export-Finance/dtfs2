import page from '../pages/header';

const relative = require('../relativeURL');
const { dashboardDeals } = require('../pages');
const MOCK_USERS = require('../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Portal GOVUK header displays correctly', () => {
  before(() => {
    cy.login(BANK1_MAKER1);
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  beforeEach(() => {
    cy.saveSession();
    dashboardDeals.visit();
  });

  describe('portal GOVUK header when logged in', () => {
    it('displays the header homelink correctly', () => {
      page.homeLink().contains('GOV.UK');
      page
        .homeLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk');
        });
      page
        .homeLink()
        .invoke('attr', 'title')
        .then((href) => {
          expect(href).to.equal('Go to the GOV.UK homepage');
        });
      page.crownLogoTitle().contains('GOVUK logo');
    });

    it('displays the serviceName correctly', () => {
      page.serviceNameLink().contains('Get a guarantee for export finance');
      page
        .serviceNameLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/dashboard');
        });
    });

    it('displays the navigation correctly', () => {
      page.userNameLink().contains(`${BANK1_MAKER1.firstname} ${BANK1_MAKER1.surname}`);
      page.profileLink().contains('Profile');
      page.logoutLink().contains('Sign out');
      page
        .logoutLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/logout');
        });
    });

    it('displays the beta banner correctly', () => {
      page.betaBanner().contains('This is a new service – your feedback will help us to improve it.');
      page.betaBanner().contains('beta');
      page.betaBannerHref().contains('feedback');
      page
        .betaBannerHref()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/feedback');
        });
    });
  });

  describe('portal GOVUK header when logged out ', () => {
    it('Logout from portal', () => {
      page.logoutLink().click();
    });

    it('displays the header homelink correctly', () => {
      page.homeLink().contains('GOV.UK');
      page
        .homeLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk');
        });
      page
        .homeLink()
        .invoke('attr', 'title')
        .then((href) => {
          expect(href).to.equal('Go to the GOV.UK homepage');
        });
      page.crownLogoTitle().contains('GOVUK logo');
    });

    it('displays the serviceName correctly', () => {
      page.serviceNameLink().contains('Get a guarantee for export finance');
      page
        .serviceNameLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/dashboard');
        });
    });

    it('displays the navigation correctly', () => {
      page.navigation().should('not.exist');
      page.userNameLink().should('not.exist');
      page.profileLink().should('not.exist');
      page.logoutLink().should('not.exist');
    });

    it('displays the beta banner correctly', () => {
      page.betaBanner().contains('This is a new service – your feedback will help us to improve it.');
      page.betaBanner().contains('beta');
      page.betaBannerHref().contains('feedback');
      page
        .betaBannerHref()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/feedback');
        });
    });
  });
});
