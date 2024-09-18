import relative from '../../relativeURL';
import pages from '../../pages';
import { header, primaryNavigation } from '../../partials';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { BANK1_MAKER1, ADMIN, T1_USER_1, PIM_USER_1 } from '../../../../../e2e-fixtures';

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
      cy.clearCookie('dtfs-session');

      cy.login(T1_USER_1);
    });

    it('should redirect to /deals/0', () => {
      cy.url().should('eq', relative('/deals/0'));
    });

    it("should displays the user's first and last name and logout link in the header", () => {
      header
        .userLink()
        .invoke('text')
        .then((text) => {
          const expected = `${T1_USER_1.firstName} ${T1_USER_1.lastName}`;
          expect(text.trim()).to.contain(expected);
        });

      header.signOutLink().should('exist');
    });

    it('should redirect back to /deals when visiting /', () => {
      pages.landingPage.visit();

      cy.url().should('eq', relative('/deals/0'));
    });

    it('should be able to login again as different user', () => {
      header.signOutLink().should('exist');

      cy.login(PIM_USER_1);

      cy.url().should('eq', relative('/deals/0'));

      header
        .userLink()
        .invoke('text')
        .then((text) => {
          const expected = `${PIM_USER_1.firstName} ${PIM_USER_1.lastName}`;
          expect(text.trim()).to.contain(expected);
        });

      header.signOutLink().should('exist');
    });

    it('should show relevant header information', () => {
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

    it('should display the beta banner correctly', () => {
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
