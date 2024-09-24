import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

const CONSTANTS = require('../../../../fixtures/constants');

context('Bond issuer URN - User can add, edit, confirm and submit URN to the TFM', () => {
  let dealId;
  const dealFacilities = [];
  const party = CONSTANTS.PARTIES.BOND_ISSUER;
  const mockUrn = [CONSTANTS.PARTY_URN.INVALID, CONSTANTS.PARTY_URN.INVALID];
  const partyUrn = [CONSTANTS.PARTY_URN.VALID, CONSTANTS.PARTY_URN.VALID];

  // Submit a deal with facilities
  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;
      // adds another bond to mock facilities
      const facilityToAdd = mockFacilities[0];
      mockFacilities.push(facilityToAdd);

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, BUSINESS_SUPPORT_USER_1);
    });
  });

  // Delete deal and facilities post E2E
  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  describe('Bond issuer party', () => {
    describe('when the TFM user is in `BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(BUSINESS_SUPPORT_USER_1);
        cy.visit(relative(`/case/${dealId}/parties`));
      });

      it('should render edit page', () => {
        pages.partiesPage.bondIssuerEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.partiesPage.bondIssuerEditLink().should('not.exist');

        pages.bondIssuerPage.urnInput(1).should('exist');
        pages.bondIssuerPage.urnInput(2).should('exist');
        pages.bondIssuerPage.heading().should('have.text', 'Edit bond issuer details');

        pages.bondIssuerPage.saveButton().should('exist');
        pages.bondIssuerPage.closeLink().should('exist');

        // Go back
        pages.bondIssuerPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should have the back link', () => {
        pages.partiesPage.bondIssuerEditLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));

        cy.clickBackLink();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should throw an error upon validation failure', () => {
        pages.partiesPage.bondIssuerEditLink().click();
        pages.bondIssuerPage.urnInput(1).clear();
        pages.bondIssuerPage.urnInput(2).clear();

        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(2).contains('Enter a minimum of 3 numbers');

        pages.bondIssuerPage.urnInput(1).clear();
        pages.bondIssuerPage.urnInput(2).clear();
        cy.keyboardInput(pages.bondIssuerPage.urnInput(1), 'test');
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2), 'test');

        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(2).contains('Enter a minimum of 3 numbers');

        cy.keyboardInput(pages.bondIssuerPage.urnInput(1).clear(), '12');
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2).clear(), '12');
        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(2).contains('Enter a minimum of 3 numbers');

        cy.keyboardInput(pages.bondIssuerPage.urnInput(1).clear(), 'ABC123');
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2).clear(), 'ABC123');
        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(2).contains('Enter a minimum of 3 numbers');

        cy.keyboardInput(pages.bondIssuerPage.urnInput(1).clear(), '"!£!"£!"£!"£');
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2).clear(), '"!£!"£!"£!"£');
        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(2).contains('Enter a minimum of 3 numbers');

        cy.keyboardInput(pages.bondIssuerPage.urnInput(1).clear(), '1234!');
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2).clear(), '1234!');
        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(2).contains('Enter a minimum of 3 numbers');

        cy.keyboardInput(pages.bondIssuerPage.urnInput(1).clear(), ' ');
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2).clear(), ' ');
        pages.bondIssuerPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondIssuerPage.urnError(2).contains('Enter a minimum of 3 numbers');
      });

      it('should re-direct to non-existent party urn page when both URNs are non-existent', () => {
        pages.partiesPage.bondIssuerEditLink().click();

        pages.bondIssuerPage.urnInput(1).clear();
        pages.bondIssuerPage.urnInput(2).clear();
        cy.keyboardInput(pages.bondIssuerPage.urnInput(1), mockUrn[0]);
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2), mockUrn[1]);

        pages.bondIssuerPage.saveButton().click();

        pages.partiesPage.nonExistentHeading().should('exist');
      });

      it('should re-direct to non-existent party urn page when at least one URNs is non-existent', () => {
        pages.partiesPage.bondIssuerEditLink().click();

        pages.bondIssuerPage.urnInput(1).clear();
        pages.bondIssuerPage.urnInput(2).clear();
        cy.keyboardInput(pages.bondIssuerPage.urnInput(1), mockUrn[0]);
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2), partyUrn[0]);

        pages.bondIssuerPage.saveButton().click();

        pages.partiesPage.nonExistentHeading().should('exist');
      });

      it('should re-direct to summary page', () => {
        pages.partiesPage.bondIssuerEditLink().click();

        pages.bondIssuerPage.urnInput(1).clear();
        pages.bondIssuerPage.urnInput(2).clear();
        cy.keyboardInput(pages.bondIssuerPage.urnInput(1), partyUrn[0]);
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2), partyUrn[1]);

        pages.bondIssuerPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary`));
      });

      it('should submit the party URN to TFM', () => {
        pages.partiesPage.bondIssuerEditLink().click();

        pages.bondIssuerPage.urnInput(1).clear();
        pages.bondIssuerPage.urnInput(2).clear();
        cy.keyboardInput(pages.bondIssuerPage.urnInput(1), partyUrn[0]);
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2), partyUrn[1]);

        pages.bondIssuerPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary`));

        pages.bondIssuerPage.saveButton().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.partiesPage.bondIssuerEditLink().should('exist');
      });

      it('should not remove the exporter party URN when the issuer URNs are submitted', () => {
        const exporterUrn = CONSTANTS.PARTY_URN.ANOTHER_VALID;
        submitExporterUrn(exporterUrn);
        pages.partiesPage.bondIssuerEditLink().click();
        pages.bondIssuerPage.urnInput(1).clear();
        pages.bondIssuerPage.urnInput(2).clear();
        cy.keyboardInput(pages.bondIssuerPage.urnInput(1), partyUrn[0]);
        cy.keyboardInput(pages.bondIssuerPage.urnInput(2), partyUrn[1]);

        pages.bondIssuerPage.saveButton().click();
        pages.bondIssuerPage.saveButton().click();

        pages.partiesPage.exporterUrn().should('contain', exporterUrn);
      });

      function submitExporterUrn(urn) {
        pages.partiesPage.exporterEditLink().click();
        pages.exporterPage.urnInput().clear();
        cy.keyboardInput(pages.exporterPage.urnInput(), urn);
        pages.exporterPage.saveButton().click();
        pages.exporterPage.saveButton().click();
      }
    });

    describe('when the TFM user is NOT in `BUSINESS_SUPPORT` team', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
      });

      it('ensure user cannot add or edit party URN', () => {
        cy.visit(`/case/${dealId}/parties`);
        pages.partiesPage.bondIssuerEditLink().should('not.exist');
      });

      it('ensure user cannot manually visit the party URN page', () => {
        cy.visit(`/case/${dealId}/parties/${party}`);
        cy.url().should('eq', relative('/not-found'));
      });

      it('ensure user cannot confirm party URN', () => {
        cy.visit(`/case/${dealId}/parties/${party}/summary}`);
        pages.partiesPage.partyUrnSummaryTable().should('not.exist');
      });

      it('ensure user cannot manually visit the party URN summary page', () => {
        cy.visit(`/case/${dealId}/parties/${party}/summary`);
        cy.url().should('eq', relative('/not-found'));
      });
    });
  });
});
