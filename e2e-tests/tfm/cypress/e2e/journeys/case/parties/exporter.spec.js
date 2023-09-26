import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

const CONSTANTS = require('../../../../fixtures/constants');

context('Exporter Party URN - User can add, edit, confirm and submit URN to the TFM', () => {
  let dealId;
  const dealFacilities = [];
  const party = CONSTANTS.PARTIES.EXPORTER;
  const mockUrn = CONSTANTS.PARTY_URN.INVALID;
  const partyUrn = CONSTANTS.PARTY_URN.VALID;

  // Submit a deal with facilities
  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, T1_USER_1);
    });
  });

  // Delete deal and facilities post E2E
  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  describe('Exporter party', () => {
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
        pages.partiesPage.exporterEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.partiesPage.exporterEditLink().should('not.exist');

        pages.exporterPage.urnInput().should('exist');
        pages.exporterPage.heading().should('have.text', 'Edit exporter details');

        pages.exporterPage.saveButton().should('exist');
        pages.exporterPage.closeLink().should('exist');

        // Go back
        pages.exporterPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should have the back link', () => {
        pages.partiesPage.exporterEditLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));

        pages.partiesPage.backLink().should('exist');

        pages.partiesPage.backLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should throw an error upon validation failure', () => {
        pages.partiesPage.exporterEditLink().click();
        pages.exporterPage.urnInput().clear();

        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.exporterPage.errorSummary().contains('Enter a unique reference number');
        pages.exporterPage.urnError().contains('Enter a unique reference number');

        pages.exporterPage.urnInput().clear();
        pages.exporterPage.urnInput().type('test');

        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type('12');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type('ABC123');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type('"!£!"£!"£!"£');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type('1234!');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.exporterPage.urnInput().clear().type(' ');
        pages.exporterPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.exporterPage.errorSummary().contains('Enter a minimum of 3 numbers');
        pages.exporterPage.urnError().contains('Enter a minimum of 3 numbers');
      });

      it('should re-direct to non-existent party urn page', () => {
        pages.partiesPage.exporterEditLink().click();
        pages.exporterPage.urnInput().clear();
        pages.exporterPage.urnInput().type(mockUrn);

        pages.exporterPage.saveButton().click();

        pages.partiesPage.nonExistentHeading().should('exist');
      });

      it('should re-direct to summary page', () => {
        pages.partiesPage.exporterEditLink().click();
        pages.exporterPage.urnInput().clear();
        pages.exporterPage.urnInput().type(partyUrn);

        pages.exporterPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary/${partyUrn}`));
      });

      it('should submit the party URN to TFM', () => {
        pages.partiesPage.exporterEditLink().click();
        pages.exporterPage.urnInput().clear();
        pages.exporterPage.urnInput().type(partyUrn);

        pages.exporterPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary/${partyUrn}`));

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
  });

  describe('when the TFM user is NOT in `BUSINESS_SUPPORT` team', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);
    });

    it('ensure user cannot add or edit party URN', () => {
      cy.visit(`/case/${dealId}/parties`);
      pages.partiesPage.exporterEditLink().should('not.exist');
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
