import relative from '../../relativeURL';
import pages from '../../pages';
import partials from '../../partials';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../fixtures/users-portal';
import { T1_USER_1 } from '../../../../../e2e-fixtures';

context('User can login', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });
  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('login page should contain correct components and text', () => {
    pages.landingPage.visit();
    pages.landingPage.signInHeading().contains('Sign in');
    pages.landingPage.emailHeading().contains('Email address');
    pages.landingPage.passwordHeading().contains('Password');
    pages.landingPage.submitButton().contains('Sign in');
  });

  it('should login, redirect to /deals. Header displays user\'s first and last name and logout link', () => {
    pages.landingPage.visit();
    cy.login(T1_USER_1);

    pages.landingPage.submitButton().click();
    cy.url().should('eq', relative('/deals'));

    partials.header.userLink().invoke('text').then((text) => {
      const expected = `${T1_USER_1.firstName} ${T1_USER_1.lastName}`;
      expect(text.trim()).to.contain(expected);
    });

    partials.header.signOutLink().should('exist');
  });

  it('should login, and show relevant header information', () => {
    pages.landingPage.visit();
    cy.login(T1_USER_1);
    pages.landingPage.submitButton().click();
    cy.url().should('eq', relative('/deals'));

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
    partials.header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');
    partials.header.betaBanner().contains('beta');
    partials.header.betaBannerHref().contains('feedback');
    partials.header.betaBannerHref().invoke('attr', 'href').then((href) => {
      expect(href).to.equal('/feedback');
    });
  });

  it('should not login and redirect to /deals with invalid email/username', () => {
    pages.landingPage.visit();
    pages.landingPage.email().type('wrongUser');
    pages.landingPage.submitButton().click();
    cy.url().should('eq', relative('/'));
  });

  it('should show relevant header items when logged out', () => {
    pages.landingPage.visit();

    partials.header.ukefLogo().should('exist');
    partials.header.headerName().should('exist');
    partials.header.headerName().contains('Trade Finance Manager');

    partials.header.userLink().should('not.exist');
    partials.header.signOutLink().should('not.exist');

    partials.header.betaBanner().should('exist');

    partials.primaryNavigation.allDealsLink().should('not.exist');
    partials.primaryNavigation.allFacilitiesLink().should('not.exist');
  });
});
