import pages from '../../pages';
import relative from '../../relativeURL';
import partials from '../../partials';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import {
  BANK1_MAKER1,
  ADMIN,
  T1_USER_1,
  PIM_USER_1,
} from '../../../../../e2e-fixtures';

context('User can login', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, T1_USER_1);
    });
  });
  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  beforeEach(() => {
    // Don't visit login page as SSO login will happen automatically and might be successful on dev laptop.
    cy.clearCookie('dtfs-session');
  });

  it('should login, redirect to /deals. Header displays user\'s first and last name and logout link', () => {
    cy.login(T1_USER_1);
    cy.url().should('eq', relative('/deals'));

    partials.header.userLink().invoke('text').then((text) => {
      const expected = `${T1_USER_1.firstName} ${T1_USER_1.lastName}`;
      expect(text.trim()).to.contain(expected);
    });

    partials.header.signOutLink().should('exist');
  });

  it('should login, redirect to /deals, visiting / should redirect back to /deals', () => {
    cy.login(T1_USER_1);
    cy.url().should('eq', relative('/deals'));

    pages.landingPage.visit();

    cy.url().should('eq', relative('/deals'));
  });

  it('should login, redirect to /deals, visiting / should redirect back to /deals', () => {
    cy.login(T1_USER_1);
    cy.url().should('eq', relative('/deals'));

    pages.landingPage.visit();

    cy.url().should('eq', relative('/deals'));
  });

  it('should login and login again as different user', () => {
    cy.login(T1_USER_1);

    partials.header.signOutLink().should('exist');

    cy.login(PIM_USER_1);

    cy.url().should('eq', relative('/deals'));

    partials.header.userLink().invoke('text').then((text) => {
      const expected = `${PIM_USER_1.firstName} ${PIM_USER_1.lastName}`;
      expect(text.trim()).to.contain(expected);
    });

    partials.header.signOutLink().should('exist');
  });

  it('should login, and show relevant header information', () => {
    cy.login(T1_USER_1);

    partials.header.ukefLogo().should('exist');
    partials.header.headerName().should('exist');
    partials.header.headerName().contains('Trade Finance Manager');

    partials.header.headerName().invoke('attr', 'href').then((href) => {
      expect(href).to.equal('/deals');
    });

    partials.header.userLink().should('exist');
    partials.header.signOutLink().should('exist');

    partials.primaryNavigation.allDealsLink().should('exist');
    partials.primaryNavigation.allFacilitiesLink().should('exist');
  });

  it('displays the beta banner correctly', () => {
    cy.login(T1_USER_1);
    partials.header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');
    partials.header.betaBanner().contains('beta');
    partials.header.betaBannerHref().contains('feedback');
    partials.header.betaBannerHref().invoke('attr', 'href').then((href) => {
      expect(href).to.equal('/feedback');
    });
  });

  it('landing page without user redirects to https://login.microsoftonline.com', () => {
    cy.request({
      url: relative('/'),
      followRedirect: false, // avoid infinite redirect loop
    }).then((resp) => {
      expect(resp.status).to.eq(302);
      expect(resp.redirectedToUrl).match(/^https:\/\/login\.microsoftonline\.com\/*/);
    });
  });

  it('logout redirects to https://login.microsoftonline.com', () => {
    cy.login(T1_USER_1);

    cy.request({
      url: relative('/logout'),
      followRedirect: false, // avoid infinite redirect loop
    }).then((resp) => {
      expect(resp.status).to.eq(302);
      expect(resp.redirectedToUrl).match(/^https:\/\/login\.microsoftonline\.com\/*/);
    });
  });
});
