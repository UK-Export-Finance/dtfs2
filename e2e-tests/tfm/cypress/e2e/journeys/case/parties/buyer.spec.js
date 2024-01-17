import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

const CONSTANTS = require('../../../../fixtures/constants');

context('Buyer Party URN - User can add, edit, confirm and submit URN to the TFM', () => {
  let dealId;
  const dealFacilities = [];
  const party = CONSTANTS.PARTIES.BUYER;
  const mockUrn = CONSTANTS.PARTY_URN.INVALID;
  const partyUrn = CONSTANTS.PARTY_URN.VALID;

  // Submit a deal with facilities
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

  // Delete deal and facilities post E2E
  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  describe('Buyer party', () => {
    /**
     * Only TFM users in `BUSINESS_SUPPORT` team can add/edit
     * or confirm party URN.
     */
    describe('when the TFM user is in `BUSINESS_SUPPORT` team', () => {
      beforeEach(() => {
        cy.login(BUSINESS_SUPPORT_USER_1);
        cy.visit(relative(`/case/${dealId}/parties`));
      });

      it('should render edit page', () => {
        pages.partiesPage.buyerEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.partiesPage.buyerEditLink().should('not.exist');

        pages.buyerPage.urnInput().should('exist');
        pages.buyerPage.heading().should('have.text', 'Edit buyer details');

        pages.buyerPage.saveButton().should('exist');
        pages.buyerPage.closeLink().should('exist');

        // Go back
        pages.buyerPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should have the back link', () => {
        pages.partiesPage.buyerEditLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));

        pages.partiesPage.backLink().should('exist');

        pages.partiesPage.backLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should throw an error upon validation failure', () => {
        pages.partiesPage.buyerEditLink().click();
        pages.buyerPage.urnInput().clear();

        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.buyerPage.errorSummary().contains('Enter a unique reference number');
        pages.buyerPage.urnError().contains('Enter a unique reference number');

        pages.buyerPage.urnInput().clear();
        pages.buyerPage.urnInput().type('test');

        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.buyerPage.urnInput().clear().type('12');
        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.buyerPage.urnInput().clear().type('ABC123');
        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.buyerPage.urnInput().clear().type('"!£!"£!"£!"£');
        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.buyerPage.urnInput().clear().type('1234!');
        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.buyerPage.urnInput().clear().type(' ');
        pages.buyerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.buyerPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.buyerPage.urnError().contains('Enter a minimum of 3 numbers');
      });

      it('should re-direct to non-existent party urn page', () => {
        pages.partiesPage.buyerEditLink().click();
        pages.buyerPage.urnInput().clear();
        pages.buyerPage.urnInput().type(mockUrn);

        pages.buyerPage.saveButton().click();

        pages.partiesPage.nonExistentHeading().should('exist');
      });

      it('should re-direct to summary page', () => {
        pages.partiesPage.buyerEditLink().click();
        pages.buyerPage.urnInput().clear();
        pages.buyerPage.urnInput().type(partyUrn);

        pages.buyerPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary/${partyUrn}`));
      });

      it('should submit the party URN to TFM', () => {
        pages.partiesPage.buyerEditLink().click();
        pages.buyerPage.urnInput().clear();
        pages.buyerPage.urnInput().type(partyUrn);

        pages.buyerPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary/${partyUrn}`));

        pages.buyerPage.saveButton().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.buyerPage
          .uniqueRef()
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(partyUrn);
          });

        pages.partiesPage.buyerEditLink().click();
        pages.buyerPage
          .urnInput()
          .invoke('val')
          .then((value) => {
            expect(value.trim()).equal(partyUrn);
          });
      });
    });
  });

  describe('when the TFM user is NOT in `BUSINESS_SUPPORT` team', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);
    });

    it('ensure user cannot add or edit party URN', () => {
      cy.visit(`/case/${dealId}/parties`);
      pages.partiesPage.buyerEditLink().should('not.exist');
    });

    it('ensure user cannot manually visit the party URN page', () => {
      cy.visit(`/case/${dealId}/parties/${party}`);
      cy.url().should('eq', relative('/not-found'));
    });

    it('ensure user cannot confirm party URN', () => {
      cy.visit(`/case/${dealId}/parties/${party}/summary/${mockUrn}`);
      pages.partiesPage.partyUrnSummaryTable().should('not.exist');
    });

    it('ensure user cannot manually visit the party URN summary page', () => {
      cy.visit(`/case/${dealId}/parties/${party}/summary/${mockUrn}`);
      cy.url().should('eq', relative('/not-found'));
    });
  });
});
