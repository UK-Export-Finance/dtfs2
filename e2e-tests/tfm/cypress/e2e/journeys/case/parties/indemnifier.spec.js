import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

const CONSTANTS = require('../../../../fixtures/constants');

context('Indemnifier Party URN - User can add, edit, confirm and submit URN to the TFM', () => {
  let dealId;
  const dealFacilities = [];
  const party = CONSTANTS.PARTIES.INDEMNIFIER;
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

  describe('Indemnifier party', () => {
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
        pages.partiesPage.indemnifierEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.partiesPage.indemnifierEditLink().should('not.exist');

        pages.indemnifierPage.urnInput().should('exist');
        pages.indemnifierPage.heading().should('have.text', 'Edit indemnifier details');

        pages.indemnifierPage.saveButton().should('exist');
        pages.indemnifierPage.closeLink().should('exist');

        // Go back
        pages.indemnifierPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should have the back link', () => {
        pages.partiesPage.indemnifierEditLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));

        pages.partiesPage.backLink().should('exist');

        pages.partiesPage.backLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should throw an error upon validation failure', () => {
        pages.partiesPage.indemnifierEditLink().click();
        pages.indemnifierPage.urnInput().clear();

        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a unique reference number');
        pages.indemnifierPage.urnError().contains('Enter a unique reference number');

        pages.indemnifierPage.urnInput().clear();
        pages.indemnifierPage.urnInput().type('test');

        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type('12');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type('ABC123');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type('"!£!"£!"£!"£');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type('1234!');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.indemnifierPage.urnInput().clear().type(' ');
        pages.indemnifierPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.indemnifierPage.urnError().contains('Enter a minimum of 3 numbers');
      });

      it('should re-direct to non-existent party urn page', () => {
        pages.partiesPage.indemnifierEditLink().click();
        pages.indemnifierPage.urnInput().clear();
        pages.indemnifierPage.urnInput().type(mockUrn);

        pages.indemnifierPage.saveButton().click();

        pages.partiesPage.nonExistentHeading().should('exist');
      });

      it('should re-direct to summary page', () => {
        pages.partiesPage.indemnifierEditLink().click();
        pages.indemnifierPage.urnInput().clear();
        pages.indemnifierPage.urnInput().type(partyUrn);

        pages.indemnifierPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary/${partyUrn}`));
      });

      it('should submit the party URN to TFM', () => {
        pages.partiesPage.indemnifierEditLink().click();
        pages.indemnifierPage.urnInput().clear();
        pages.indemnifierPage.urnInput().type(partyUrn);

        pages.indemnifierPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary/${partyUrn}`));

        pages.indemnifierPage.saveButton().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.indemnifierPage
          .uniqueRef()
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(partyUrn);
          });

        pages.partiesPage.indemnifierEditLink().click();
        pages.indemnifierPage
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
      pages.partiesPage.indemnifierEditLink().should('not.exist');
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
