import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Parties - user can view and edit bond issuer', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;
      // adds another bond to mock facilities
      const facilityToAdd = mockFacilities[0];
      mockFacilities.push(facilityToAdd);

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

  describe('Bond issuer page', () => {
    describe('when user is in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(BUSINESS_SUPPORT_USER_1);
        cy.visit(relative(`/case/${dealId}/parties`));
      });

      it('should render edit page', () => {
        pages.partiesPage.bondIssuerEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/bond-issuer`));
        pages.partiesPage.bondIssuerEditLink().should('not.exist');

        pages.bondIssuerPage.urnInput(1).should('exist');
        pages.bondIssuerPage.urnInput(2).should('exist');
        pages.bondIssuerPage.heading().should('have.text', 'Edit bond issuer details');

        pages.bondIssuerPage.saveButton().should('exist');
        pages.bondIssuerPage.closeLink().should('exist');

        pages.bondIssuerPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should show validation errors on incorrectly entered details', () => {
        const partyUrn = 'test partyurn';

        pages.partiesPage.bondIssuerEditLink().click();
        pages.bondIssuerPage.urnInput(1).type(partyUrn);
        pages.bondIssuerPage.urnInput(2).type(partyUrn);
        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/bond-issuer`));
        pages.bondIssuerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(2).contains('Enter a minimum of 3 numbers');

        pages.bondIssuerPage.urnInput(1).clear().type('!!22');
        pages.bondIssuerPage.urnInput(2).clear().type('1222');

        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/bond-issuer`));
        pages.bondIssuerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(2).should('not.exist');

        pages.bondIssuerPage.urnInput(1).clear().type('1222');
        pages.bondIssuerPage.urnInput(2).clear().type('!');

        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/bond-issuer`));
        pages.bondIssuerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).should('not.exist');
        pages.bondIssuerPage.urnError(2).contains('Enter a minimum of 3 numbers');
      });

      it('should not validation errors if correctly entered or empty', () => {
        pages.partiesPage.bondIssuerEditLink().click();
        pages.bondIssuerPage.urnInput(1).clear();
        pages.bondIssuerPage.urnInput(2).clear();

        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.partiesPage.bondIssuerEditLink().click();

        pages.bondIssuerPage.urnInput(1).invoke('val').then((value) => {
          expect(value.trim()).equal('');
        });

        pages.bondIssuerPage.urnInput(2).invoke('val').then((value) => {
          expect(value.trim()).equal('');
        });

        pages.bondIssuerPage.urnInput(1).clear().type('1233');
        pages.bondIssuerPage.urnInput(2).clear().type('1233');

        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.partiesPage.bondIssuerEditLink().click();

        pages.bondIssuerPage.urnInput(1).invoke('val').then((value) => {
          expect(value.trim()).equal('1233');
        });

        pages.bondIssuerPage.urnInput(2).invoke('val').then((value) => {
          expect(value.trim()).equal('1233');
        });
      });
    });

    describe('when user is NOT in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
      });

      it('user cannot manually to the page', () => {
        cy.visit(`/case/${dealId}/parties/bond-issuer`);
        cy.url().should('eq', relative('/not-found'));
      });
    });
  });
});
