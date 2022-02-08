import relative from './relativeURL';
import CREDENTIALS from '../fixtures/credentials.json';
import pageBanner from './pages/page-banner';

context('Check GEF GOVUK header displays correctly', () => {
  let dealId;

  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id;

        cy.login(CREDENTIALS.MAKER);

        cy.visit(relative(`/gef/application-details/${dealId}`));
      });
  });

  describe('GEF GOVUK header', () => {
    it('displays the header homelink correctly', () => {
      pageBanner.homeLink().contains('GOV.UK');
      pageBanner.homeLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('https://www.gov.uk');
      });
      pageBanner.homeLink().invoke('attr', 'title').then((href) => {
        expect(href).to.equal('Go to the GOV.UK homepage');
      });
      pageBanner.crownLogoTitle().contains('GOVUK logo');
    });

    it('displays the serviceName correctly', () => {
      pageBanner.serviceName().contains('Get a guarantee for export finance');
      pageBanner.serviceName().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('/dashboard');
      });
    });

    it('displays the navigation correctly', () => {
      pageBanner.userName().contains(CREDENTIALS.MAKER.username);
      pageBanner.profile().contains('Profile');
      pageBanner.logout().contains('Sign out');
      pageBanner.logout().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('/logout');
      });
    });
  });
});
