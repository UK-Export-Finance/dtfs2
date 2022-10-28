import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Parties - user can view and edit buyer', () => {
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

  describe('Buyer page', () => {
    describe('when user is in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(BUSINESS_SUPPORT_USER_1);
        cy.visit(relative(`/case/${dealId}/parties`));
      });

      it('should render edit page', () => {
        pages.partiesPage.buyerEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/buyer`));
        pages.partiesPage.buyerEditLink().should('not.exist');

        pages.buyerPage.urnInput().should('exist');
        pages.buyerPage.heading().should('have.text', 'Edit buyer details');

        pages.buyerPage.saveButton().should('exist');
        pages.buyerPage.closeLink().should('exist');

        pages.buyerPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should save entered details', () => {
        const partyUrn = 'test partyurn';

        pages.partiesPage.buyerEditLink().click();
        pages.buyerPage.urnInput().clear();
        pages.buyerPage.urnInput().type(partyUrn);

        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/buyer`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.buyerPage.urnInput().clear().type('12');
        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/buyer`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.buyerPage.urnInput().clear().type('ABC123');
        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/buyer`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.buyerPage.urnInput().clear().type('"!£!"£!"£!"£');
        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/buyer`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.buyerPage.urnInput().clear().type('1234!');
        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/buyer`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');
      });

      it('should save entered details if partyUrn correctly entered', () => {
        const partyUrn = '12345';

        pages.partiesPage.buyerEditLink().click();
        pages.buyerPage.urnInput().clear();
        pages.buyerPage.urnInput().type(partyUrn);

        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.buyerPage.uniqueRef().invoke('text').then((text) => {
          expect(text.trim()).equal(partyUrn);
        });

        pages.partiesPage.buyerEditLink().click();
        pages.exporterPage.urnInput().invoke('val').then((value) => {
          expect(value.trim()).equal(partyUrn);
        });
      });
    });

    describe('when user is NOT in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
      });

      it('user cannot manually to the page', () => {
        cy.visit(`/case/${dealId}/parties/buyer`);
        cy.url().should('eq', relative('/not-found'));
      });
    });
  });
});
