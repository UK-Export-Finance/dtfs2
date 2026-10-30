const { header } = require('../../../pages/headers');
const relative = require('../../../relativeURL');
const { dashboardDeals } = require('../../../headers');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1, BANK1_CHECKER1, ADMIN, BANK1_PAYMENT_REPORT_OFFICER1, READ_ONLY } = MOCK_USERS;

context('Portal GovUK header', () => {
  beforeEach(() => {
    cy.saveSession();

    dashboardDeals.visit();
  });

  describe('signed-out user header', () => {
    it('should ensure the header component exist', () => {
      header.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      header.header().contains('GOV.UK');

      header
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      header.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      header.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      header.navigationLink().contains('Get a guarantee for export finance');

      header
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should not display any service navigation links', () => {
      header.dashboard().should('not.exist');
      header.reports().should('not.exist');
      header.uploadReport().should('not.exist');
      header.previousReport().should('not.exist');
      header.recordCorrectionLog().should('not.exist');
      header.users().should('not.exist');
      header.profile().should('not.exist');
      header.logout().should('not.exist');
    });

    it('should ensure the beta banner component exist', () => {
      header.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(header.betaBannerTag(), 'Beta');

      header.betaBannerHref().contains('feedback');

      header
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

      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should ensure the header component exist', () => {
      header.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      header.header().contains('GOV.UK');

      header
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      header.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      header.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      header.navigationLink().contains('Get a guarantee for export finance');

      header
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should display all the maker service navigation links', () => {
      header.dashboard().should('exist');
      header.reports().should('exist');
      header.profile().should('exist');
      header.logout().should('exist');
    });

    it('should ensure the beta banner component exist', () => {
      header.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(header.betaBannerTag(), 'Beta');

      header.betaBannerHref().contains('feedback');

      header
        .betaBannerHref()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/feedback');
        });
    });
  });

  describe('signed-in checker user header', () => {
    before(() => {
      cy.login(BANK1_CHECKER1);

      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should ensure the header component exist', () => {
      header.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      header.header().contains('GOV.UK');

      header
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      header.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      header.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      header.navigationLink().contains('Get a guarantee for export finance');

      header
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should display all the checker service navigation links', () => {
      header.dashboard().should('exist');
      header.reports().should('exist');
      header.profile().should('exist');
      header.logout().should('exist');
    });

    it('should ensure the beta banner component exist', () => {
      header.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(header.betaBannerTag(), 'Beta');

      header.betaBannerHref().contains('feedback');

      header
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

      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should ensure the header component exist', () => {
      header.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      header.header().contains('GOV.UK');

      header
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      header.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      header.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      header.navigationLink().contains('Get a guarantee for export finance');

      header
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should display all the admin service navigation links', () => {
      header.dashboard().should('exist');
      header.reports().should('exist');
      header.users().should('exist');
      header.profile().should('exist');
      header.logout().should('exist');
    });

    it('should ensure the beta banner component exist', () => {
      header.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(header.betaBannerTag(), 'Beta');

      header.betaBannerHref().contains('feedback');

      header
        .betaBannerHref()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/feedback');
        });
    });
  });

  describe('signed-in read only user header', () => {
    before(() => {
      cy.login(READ_ONLY);

      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should ensure the header component exist', () => {
      header.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      header.header().contains('GOV.UK');

      header
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      header.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      header.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      header.navigationLink().contains('Get a guarantee for export finance');

      header
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should display all the read only service navigation links', () => {
      header.dashboard().should('exist');
      header.profile().should('exist');
      header.logout().should('exist');
    });

    it('should ensure the beta banner component exist', () => {
      header.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(header.betaBannerTag(), 'Beta');

      header.betaBannerHref().contains('feedback');

      header
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
      header.header().should('exist');
    });

    it('should displays the correct header component with the crown logo', () => {
      header.header().contains('GOV.UK');

      header
        .header()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://www.gov.uk/');
        });

      header.crown().should('exist');
    });

    it('should ensure the service navigation component exist', () => {
      header.navigation().should('exist');
    });

    it('should displays the correct service navigation component with the service name', () => {
      header.navigationLink().contains('Get a guarantee for export finance');

      header
        .navigationLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('https://get-a-guarantee-for-export-finance.service.gov.uk/');
        });
    });

    it('should display all the payment report officer service navigation links', () => {
      header.uploadReport().should('exist');
      header.previousReport().should('exist');
      header.recordCorrectionLog().should('exist');
      header.profile().should('exist');
      header.logout().should('exist');
    });

    it('should ensure the beta banner component exist', () => {
      header.betaBanner().should('exist');
    });

    it('should display the beta banner component correctly', () => {
      header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');

      cy.assertText(header.betaBannerTag(), 'Beta');

      header.betaBannerHref().contains('feedback');

      header
        .betaBannerHref()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/feedback');
        });
    });
  });
});
