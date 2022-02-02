const relative = require('../../relativeURL');

import page from '../../pages/header';

const { dashboard } = require('../../pages');

const mockUsers = require('../../../fixtures/mockUsers');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Portal GOVUK header displays correctly', () => {
  before(() => {
    cy.login(BANK1_MAKER1);
    dashboard.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  describe('portal GOVUK header when logged in', () => {
    it('displays the header homelink correctly', () => {
      page.homeLink().contains('GOV.UK');
      page.homeLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('https://www.gov.uk');
      });
      page.homeLink().invoke('attr', 'title').then((href) => {
        expect(href).to.equal('Go to the GOV.UK homepage');
      });
      page.crownLogoTitle().contains('GOVUK logo');
    });

    it('displays the serviceName correctly', () => {
      page.serviceNameLink().contains('Get a guarantee for export finance');
      page.serviceNameLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('/dashboard');
      });
    });

    it('displays the navigation correctly', () => {
      page.userNameLink().contains(BANK1_MAKER1.username);
      page.profileLink().contains('Profile');
      page.logoutLink().contains('Sign out');
      page.logoutLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('/logout');
      });
    });
  });

  describe('portal GOVUK header when logged out ', () => {
    before(() => {
      page.logoutLink().click();
    });
    it('displays the header homelink correctly', () => {
      page.homeLink().contains('GOV.UK');
      page.homeLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('https://www.gov.uk');
      });
      page.homeLink().invoke('attr', 'title').then((href) => {
        expect(href).to.equal('Go to the GOV.UK homepage');
      });
      page.crownLogoTitle().contains('GOVUK logo');
    });

    it('displays the serviceName correctly', () => {
      page.serviceNameLink().contains('Get a guarantee for export finance');
      page.serviceNameLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('/dashboard');
      });
    });

    it('displays the navigation correctly', () => {
      page.navigation().should('not.exist');
      page.userNameLink().should('not.exist');
      page.profileLink().should('not.exist');
      page.logoutLink().should('not.exist');
    });
  });
});
