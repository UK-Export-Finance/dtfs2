import relative from '../../relativeURL';
import pages from '../../pages';
import { header, primaryNavigation, submitButton } from '../../partials';
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
    pages.landingPage.visit();
  });

  it('login page should contain correct components and text', () => {
    pages.landingPage.signInHeading().contains('Sign in');
    pages.landingPage.emailHeading().contains('Email address');
    pages.landingPage.passwordHeading().contains('Password');
    submitButton().contains('Sign in');
  });

  it("should login, redirect to /deals/0. Header displays user's first and last name and logout link", () => {
    cy.login(T1_USER_1);

    cy.clickSubmitButton();
    cy.url().should('eq', relative('/deals/0'));

    header
      .userLink()
      .invoke('text')
      .then((text) => {
        const expected = `${T1_USER_1.firstName} ${T1_USER_1.lastName}`;
        expect(text.trim()).to.contain(expected);
      });

    header.signOutLink().should('exist');
  });

  it('should login, and show relevant header information', () => {
    cy.login(T1_USER_1);
    cy.clickSubmitButton();
    cy.url().should('eq', relative('/deals/0'));

    header.ukefLogo().should('exist');
    header.headerName().should('exist');
    header.headerName().contains('Trade Finance Manager');

    header
      .headerName()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal('/deals');
      });

    header.userLink().should('exist');
    header.signOutLink().should('exist');

    primaryNavigation.allDealsLink().should('exist');
    primaryNavigation.allFacilitiesLink().should('exist');
  });

  it('displays the beta banner correctly', () => {
    header.betaBanner().contains('This is a new service – your feedback will help us to improve it.');
    header.betaBanner().contains('beta');
    header.betaBannerHref().contains('feedback');
    header
      .betaBannerHref()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal('/feedback');
      });
  });

  it('should not login and redirect to /deals with invalid email/username', () => {
    pages.landingPage.email().type('wrongUser');
    cy.clickSubmitButton();
    cy.url().should('eq', relative('/'));
  });

  it('should show relevant header items when logged out', () => {
    header.ukefLogo().should('exist');
    header.headerName().should('exist');
    header.headerName().contains('Trade Finance Manager');

    header.userLink().should('not.exist');
    header.signOutLink().should('not.exist');

    header.betaBanner().should('exist');

    primaryNavigation.allDealsLink().should('not.exist');
    primaryNavigation.allFacilitiesLink().should('not.exist');
  });
});
