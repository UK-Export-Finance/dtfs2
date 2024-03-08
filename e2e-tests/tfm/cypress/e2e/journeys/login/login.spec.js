import pages from '../../pages';
import relative from '../../relativeURL';
import partials from '../../partials';
import { T1_USER_1, PIM_USER_1 } from '../../../../../e2e-fixtures';

const azureSsoAuthority = Cypress.config('azureSsoAuthority');

context('User login', () => {
  describe('when not logged in', () => {
    it(`should redirect to ${azureSsoAuthority}`, () => {
      cy.request({
        url: relative('/'),
        followRedirect: false, // avoid infinite redirect loop
      }).then((resp) => {
        expect(resp.status).to.eq(302);
        expect(resp.redirectedToUrl.includes(azureSsoAuthority)).eq(true);
      });
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      cy.clearCookie('dtfs-session');

      cy.login(T1_USER_1);
    });

    it('should redirect to /deals', () => {
      cy.url().should('eq', relative('/deals'));
    });

    it('should displays the user\'s first and last name and logout link in the header', () => {
      partials.header.userLink().invoke('text').then((text) => {
        const expected = `${T1_USER_1.firstName} ${T1_USER_1.lastName}`;
        expect(text.trim()).to.contain(expected);
      });

      partials.header.signOutLink().should('exist');
    });

    it('should redirect back to /deals when visiting /', () => {
      pages.landingPage.visit();

      cy.url().should('eq', relative('/deals'));
    });

    it('should be able to login again as different user', () => {
      partials.header.signOutLink().should('exist');

      cy.login(PIM_USER_1);

      cy.url().should('eq', relative('/deals'));

      partials.header.userLink().invoke('text').then((text) => {
        const expected = `${PIM_USER_1.firstName} ${PIM_USER_1.lastName}`;
        expect(text.trim()).to.contain(expected);
      });

      partials.header.signOutLink().should('exist');
    });

    it('should show relevant header information', () => {
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

    it('should display the beta banner correctly', () => {
      partials.header.betaBanner().contains('This is a new service - your feedback will help us to improve it.');
      partials.header.betaBanner().contains('beta');
      partials.header.betaBannerHref().contains('feedback');
      partials.header.betaBannerHref().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('/feedback');
      });
    });

    describe('when logging out', () => {
      beforeEach(() => {
        pages.landingPage.visit();
      });

      it(`should redirect to ${azureSsoAuthority}`, () => {
        cy.request({
          url: relative('/logout'),
          followRedirect: false, // avoid infinite redirect loop
        }).then((resp) => {
          expect(resp.status).to.eq(302);
          expect(resp.redirectedToUrl.includes(azureSsoAuthority)).eq(true);
        });
      });
    });
  });
});
