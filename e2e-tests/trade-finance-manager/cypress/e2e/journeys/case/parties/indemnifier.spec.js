import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Parties - user can view and edit indemnifier', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
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
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  describe('Indemnifier page', () => {
    describe('when user is in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(BUSINESS_SUPPORT_USER_1);
        cy.visit(relative(`/case/${dealId}/parties`));
      });

      it('should save entered details', () => {
        const partyUrn = 'test partyurn';

        pages.partiesPage.indemnifierEditLink().click();
        pages.indemnifierPage.urnInput().clear();
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/indemnifier`));
        pages.indemnifierPage.errorSummary().contains('Enter a unique reference number');
        pages.indemnifierPage.urnError().contains('Enter a unique reference number');

        pages.indemnifierPage.urnInput().clear();
        pages.indemnifierPage.urnInput().type(partyUrn);

        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/indemnifier`));
        pages.indemnifierPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type('12');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/indemnifier`));
        pages.indemnifierPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type('ABC123');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/indemnifier`));
        pages.indemnifierPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type('"!£!"£!"£!"£');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/indemnifier`));
        pages.indemnifierPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type('1234!');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/indemnifier`));
        pages.indemnifierPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type(' ');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/indemnifier`));
        pages.indemnifierPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');
      });

      it('should save entered details if partyUrn correctly entered', () => {
        const partyUrn = '12345';

        pages.partiesPage.indemnifierEditLink().click();
        pages.indemnifierPage.urnInput().clear();
        pages.indemnifierPage.urnInput().type(partyUrn);

        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.indemnifierPage.uniqueRef().invoke('text').then((text) => {
          expect(text.trim()).equal(partyUrn);
        });

        pages.partiesPage.indemnifierEditLink().click();
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
        cy.visit(`/case/${dealId}/parties/indemnifier`);
        cy.url().should('eq', relative('/not-found'));
      });
    });
  });
});
