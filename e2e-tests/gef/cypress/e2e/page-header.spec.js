import relative from './relativeURL';
import { BANK1_MAKER1 } from '../../../e2e-fixtures/portal-users.fixture';
import pageBanner from './pages/page-banner';

context('Check GEF GOVUK header displays correctly', () => {
  let dealId;

  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id;

        cy.login(BANK1_MAKER1);

        cy.visit(relative(`/gef/application-details/${dealId}`));
      });
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealId}`));
  });

  describe('GEF GOVUK header', () => {
    it('displays the header homelink correctly', () => {
      pageBanner.homeLink().contains('GOV.UK');
      pageBanner
        .homeLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk');
        });
      pageBanner
        .homeLink()
        .invoke('attr', 'title')
        .then((href) => {
          expect(href).to.equal('Go to the GOV.UK homepage');
        });
      pageBanner.crownLogoTitle().contains('GOVUK logo');
    });

    it('displays the serviceName correctly', () => {
      pageBanner.serviceName().contains('Get a guarantee for export finance');
      pageBanner
        .serviceName()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/dashboard');
        });
    });

    it('displays the navigation correctly', () => {
      pageBanner.userName().contains(`${BANK1_MAKER1.firstname} ${BANK1_MAKER1.surname}`);
      pageBanner.profile().contains('Profile');
      pageBanner.logout().contains('Sign out');
      pageBanner
        .logout()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/logout');
        });
    });

    it('displays the beta banner correctly', () => {
      pageBanner.userName().contains(`${BANK1_MAKER1.firstname} ${BANK1_MAKER1.surname}`);
      pageBanner.betaBanner().contains('This is a new service – your feedback will help us to improve it.');
      pageBanner.betaBanner().contains('beta');
      pageBanner.betaBannerHref().contains('feedback');
      pageBanner
        .betaBannerHref()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/feedback');
        });
    });
  });
});
