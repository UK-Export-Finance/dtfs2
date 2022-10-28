import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Parties - user can view and edit exporter', () => {
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

  describe('Exporter page', () => {
    describe('when user is in BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(BUSINESS_SUPPORT_USER_1);
        cy.visit(relative(`/case/${dealId}/parties`));
      });

      it('should render edit page', () => {
        pages.partiesPage.exporterEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/exporter`));
        pages.partiesPage.exporterEditLink().should('not.exist');

        pages.exporterPage.urnInput().should('exist');
        pages.exporterPage.heading().should('have.text', 'Edit exporter details');

        pages.exporterPage.saveButton().should('exist');
        pages.exporterPage.closeLink().should('exist');

        pages.exporterPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should not save entered details if incorrectly formatted partyURN such as letters only or less than 3 numbers', () => {
        const partyUrn = 'test partyurn';

        pages.partiesPage.exporterEditLink().click();
        pages.exporterPage.urnInput().clear();
        pages.exporterPage.urnInput().type(partyUrn);

        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/exporter`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type('12');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/exporter`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type('ABC123');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/exporter`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type('"!£!"£!"£!"£');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/exporter`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type('1234!');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/exporter`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type(' ');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/exporter`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');
      });

      it('should save entered details if partyUrn correctly entered', () => {
        const partyUrn = '12345';

        pages.partiesPage.exporterEditLink().click();
        pages.exporterPage.urnInput().clear();
        pages.exporterPage.urnInput().type(partyUrn);

        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.exporterPage.uniqueRef().invoke('text').then((text) => {
          expect(text.trim()).equal(partyUrn);
        });

        pages.partiesPage.exporterEditLink().click();
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
        cy.visit(`/case/${dealId}/parties/exporter`);
        cy.url().should('eq', relative('/not-found'));
      });
    });
  });
});
