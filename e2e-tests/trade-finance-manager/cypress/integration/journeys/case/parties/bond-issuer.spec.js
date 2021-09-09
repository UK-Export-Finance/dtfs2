import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Parties - user can view and edit bond issuer', () => {
  let dealId;
  const dealFacilities = [];
  const businessSupportUser = MOCK_USERS.find((user) => user.teams.includes('BUSINESS_SUPPORT'));
  const nonBusinessSupportUser = MOCK_USERS.find((user) => !user.teams.includes('BUSINESS_SUPPORT'));

  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType);
      });
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  describe('Bond issuer page', () => {
    describe('when user is in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(businessSupportUser);
        cy.visit(relative(`/case/${dealId}/parties`));
      });

      it('should render edit page', () => {
        pages.partiesPage.bondIssuerEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/bond-issuer`));
        pages.partiesPage.bondIssuerEditLink().should('not.exist');

        pages.bondIssuerPage.urnInput().should('exist');
        pages.bondIssuerPage.heading().should('have.text', 'Edit bond issuer details');

        pages.bondIssuerPage.saveButton().should('exist');
        pages.bondIssuerPage.closeLink().should('exist');

        pages.bondIssuerPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should save entered details', () => {
        const partyUrn = 'test partyurn';

        pages.partiesPage.bondIssuerEditLink().click();
        pages.bondIssuerPage.urnInput().type(partyUrn);

        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.partiesPage.bondIssuerEditLink().click();

        pages.bondIssuerPage.urnInput().invoke('val').then((value) => {
          expect(value.trim()).equal(partyUrn);
        });
      });
    });

    describe('when user is NOT in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(nonBusinessSupportUser);
      });

      it('user cannot manually to the page', () => {
        cy.visit(`/case/${dealId}/parties/bond-issuer`);
        cy.url().should('eq', relative('/not-found'));
      });
    });
  });
});
