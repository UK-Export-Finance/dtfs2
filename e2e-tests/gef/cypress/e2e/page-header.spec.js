const page = require('./pages/header');
const MOCK_USERS = require('../../../e2e-fixtures/portal-users.fixture');
const relative = require('./relativeURL');

const { BANK1_MAKER1, ADMIN, BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

beforeEach(() => {
  cy.saveSession();

  cy.visit(relative('/gef/mandatory-criteria'));
});

context('Check GEF GOVUK header displays correctly', () => {
  describe('signed-out user header', () => {
    it('should ensure the header component exist', () => {
      page.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      page.header().contains('GOV.UK');

      page
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      page.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      page.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      page.navigationLink().contains('Get a guarantee for export finance');

      page
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should not display any service navigation links', () => {
      page.dashboard().should('not.exist');
      page.reports().should('not.exist');
      page.uploadReport().should('not.exist');
      page.previousReport().should('not.exist');
      page.recordCorrectionLog().should('not.exist');
      page.users().should('not.exist');
      page.profile().should('not.exist');
      page.logout().should('not.exist');
    });

    it('should ensure the beta banner component exist', () => {
      page.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      page.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(page.betaBannerTag(), 'Beta');

      page.betaBannerHref().contains('feedback');

      page
        .betaBannerHref()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/feedback');
        });
    });
  });

  describe('signed-in maker user header', () => {
    before(() => {
      cy.login(BANK1_MAKER1);

      cy.visit(relative('/gef/mandatory-criteria'));
      cy.url().should('eq', relative('/gef/mandatory-criteria'));
    });

    it('should ensure the header component exist', () => {
      page.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      page.header().contains('GOV.UK');

      page
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      page.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      page.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      page.navigationLink().contains('Get a guarantee for export finance');

      page
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should display all the maker service navigation links', () => {
      page.dashboard().should('exist');
      page.reports().should('exist');
      page.profile().should('exist');
      page.logout().should('exist');
    });

    it('should ensure the beta banner component exist', () => {
      page.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      page.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(page.betaBannerTag(), 'Beta');

      page.betaBannerHref().contains('feedback');

      page
        .betaBannerHref()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/feedback');
        });
    });
  });

  describe('signed-in admin user header', () => {
    before(() => {
      cy.login(ADMIN);

      cy.visit(relative('/gef/mandatory-criteria'));
      cy.url().should('eq', relative('/gef/mandatory-criteria'));
    });

    it('should ensure the header component exist', () => {
      page.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      page.header().contains('GOV.UK');

      page
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      page.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      page.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      page.navigationLink().contains('Get a guarantee for export finance');

      page
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should display all the admin service navigation links', () => {
      page.dashboard().should('exist');
      page.reports().should('exist');
      page.users().should('exist');
      page.profile().should('exist');
      page.logout().should('exist');
    });

    it('should ensure the beta banner component exist', () => {
      page.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      page.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(page.betaBannerTag(), 'Beta');

      page.betaBannerHref().contains('feedback');

      page
        .betaBannerHref()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/feedback');
        });
    });
  });

  describe('signed-in payment report officer user header', () => {
    before(() => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);

      cy.visit(relative('/utilisation-report-upload'));
    });

    it('should ensure the header component exist', () => {
      page.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      page.header().contains('GOV.UK');

      page
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      page.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      page.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      page.navigationLink().contains('Get a guarantee for export finance');

      page
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should display all the payment report officer service navigation links', () => {
      page.uploadReport().should('exist');
      page.previousReport().should('exist');
      page.recordCorrectionLog().should('exist');
      page.profile().should('exist');
      page.logout().should('exist');
    });

    it('should ensure the beta banner component exist', () => {
      page.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      page.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(page.betaBannerTag(), 'Beta');

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
