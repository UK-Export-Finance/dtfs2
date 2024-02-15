import relative from '../../relativeURL';
import partials from '../../partials';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { BANK1_MAKER1, ADMIN, T1_USER_1 } from '../../../../../e2e-fixtures';

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
    // Don't visit login page as login will happen automatically.
    // pages.landingPage.visit();
  });

  // it('login page should contain correct components and text', () => {
  //   pages.landingPage.signInHeading().contains('Sign in');
  //   pages.landingPage.emailHeading().contains('Email address');
  //   pages.landingPage.passwordHeading().contains('Password');
  //   pages.landingPage.submitButton().contains('Sign in');
  // });

  it('should login, redirect to /deals. Header displays user\'s first and last name and logout link', () => {
    cy.mockLogin(T1_USER_1);

    cy.url().should('eq', relative('/deals'));

    partials.header.userLink().invoke('text').then((text) => {
      const expected = `${T1_USER_1.firstName} ${T1_USER_1.lastName}`;
      expect(text.trim()).to.contain(expected);
    });

    partials.header.signOutLink().should('exist');
  });

  it('should login, and show relevant header information', () => {
    cy.mockLogin(T1_USER_1);

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
    cy.mockLogin(T1_USER_1);
    partials.header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');
    partials.header.betaBanner().contains('beta');
    partials.header.betaBannerHref().contains('feedback');
    partials.header.betaBannerHref().invoke('attr', 'href').then((href) => {
      expect(href).to.equal('/feedback');
    });
  });

  // it('should not login and redirect to /deals with invalid email/username', () => {
  //   pages.landingPage.email().type('wrongUser');
  //   pages.landingPage.submitButton().click();
  //   cy.url().should('eq', relative('/'));
  // });

  // it('should show relevant header items when logged out', () => {
  //   partials.header.ukefLogo().should('exist');
  //   partials.header.headerName().should('exist');
  //   partials.header.headerName().contains('Trade Finance Manager');

  //   partials.header.userLink().should('not.exist');
  //   partials.header.signOutLink().should('not.exist');

  //   partials.header.betaBanner().should('exist');

  //   partials.primaryNavigation.allDealsLink().should('not.exist');
  //   partials.primaryNavigation.allFacilitiesLink().should('not.exist');
  // });
});
