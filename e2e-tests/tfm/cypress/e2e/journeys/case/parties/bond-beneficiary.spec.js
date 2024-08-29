import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

const CONSTANTS = require('../../../../fixtures/constants');

context('Bond beneficiary URN - User can add, edit, confirm and submit URN to the TFM', () => {
  let dealId;
  const dealFacilities = [];
  const party = CONSTANTS.PARTIES.BOND_BENEFICIARY;
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

  describe('Bond beneficiary party', () => {
    describe('when the TFM user is in `BUSINESS_SUPPORT team', () => {
      beforeEach(() => {
        cy.login(BUSINESS_SUPPORT_USER_1);
        cy.visit(relative(`/case/${dealId}/parties`));
      });

      it('should render edit page', () => {
        pages.partiesPage.bondBeneficiaryEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.partiesPage.bondBeneficiaryEditLink().should('not.exist');

        pages.bondBeneficiaryPage.urnInput(1).should('exist');
        pages.bondBeneficiaryPage.urnInput(2).should('exist');
        pages.bondBeneficiaryPage.heading().should('have.text', 'Edit bond beneficiary details');

        pages.bondBeneficiaryPage.saveButton().should('exist');
        pages.bondBeneficiaryPage.closeLink().should('exist');

        // Go back
        pages.bondBeneficiaryPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should have the back link', () => {
        pages.partiesPage.bondBeneficiaryEditLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));

        pages.partiesPage.backLink().should('exist');

        pages.partiesPage.backLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should throw an error upon validation failure', () => {
        pages.partiesPage.bondBeneficiaryEditLink().click();
        pages.bondBeneficiaryPage.urnInput(1).clear();
        pages.bondBeneficiaryPage.urnInput(2).clear();

        pages.bondBeneficiaryPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(2).contains('Enter a minimum of 3 numbers');

        pages.bondBeneficiaryPage.urnInput(1).clear();
        pages.bondBeneficiaryPage.urnInput(2).clear();
        pages.bondBeneficiaryPage.urnInput(1).type('test');
        pages.bondBeneficiaryPage.urnInput(2).type('test');

        pages.bondBeneficiaryPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(2).contains('Enter a minimum of 3 numbers');

        pages.bondBeneficiaryPage.urnInput(1).clear().type('12');
        pages.bondBeneficiaryPage.urnInput(2).clear().type('12');
        pages.bondBeneficiaryPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(2).contains('Enter a minimum of 3 numbers');

        pages.bondBeneficiaryPage.urnInput(1).clear().type('ABC123');
        pages.bondBeneficiaryPage.urnInput(2).clear().type('ABC123');
        pages.bondBeneficiaryPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(2).contains('Enter a minimum of 3 numbers');

        pages.bondBeneficiaryPage.urnInput(1).clear().type('"!£!"£!"£!"£');
        pages.bondBeneficiaryPage.urnInput(2).clear().type('"!£!"£!"£!"£');
        pages.bondBeneficiaryPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(2).contains('Enter a minimum of 3 numbers');

        pages.bondBeneficiaryPage.urnInput(1).clear().type('1234!');
        pages.bondBeneficiaryPage.urnInput(2).clear().type('1234!');
        pages.bondBeneficiaryPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(2).contains('Enter a minimum of 3 numbers');

        pages.bondBeneficiaryPage.urnInput(1).clear().type(' ');
        pages.bondBeneficiaryPage.urnInput(2).clear().type(' ');
        pages.bondBeneficiaryPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(1).contains('Enter a minimum of 3 numbers');
        pages.bondBeneficiaryPage.urnError(2).contains('Enter a minimum of 3 numbers');
      });

      it('should re-direct to non-existent party urn page when both URNs are non-existent', () => {
        pages.partiesPage.bondBeneficiaryEditLink().click();

        pages.bondBeneficiaryPage.urnInput(1).clear();
        pages.bondBeneficiaryPage.urnInput(2).clear();
        pages.bondBeneficiaryPage.urnInput(1).type(mockUrn[0]);
        pages.bondBeneficiaryPage.urnInput(2).type(mockUrn[1]);

        pages.bondBeneficiaryPage.saveButton().click();

        pages.partiesPage.nonExistentHeading().should('exist');
      });

      it('should re-direct to non-existent party urn page when at least one URNs is non-existent', () => {
        pages.partiesPage.bondBeneficiaryEditLink().click();

        pages.bondBeneficiaryPage.urnInput(1).clear();
        pages.bondBeneficiaryPage.urnInput(2).clear();
        pages.bondBeneficiaryPage.urnInput(1).type(mockUrn[0]);
        pages.bondBeneficiaryPage.urnInput(2).type(partyUrn[0]);

        pages.bondBeneficiaryPage.saveButton().click();

        pages.partiesPage.nonExistentHeading().should('exist');
      });

      it('should re-direct to summary page', () => {
        pages.partiesPage.bondBeneficiaryEditLink().click();

        pages.bondBeneficiaryPage.urnInput(1).clear();
        pages.bondBeneficiaryPage.urnInput(2).clear();
        pages.bondBeneficiaryPage.urnInput(1).type(partyUrn[0]);
        pages.bondBeneficiaryPage.urnInput(2).type(partyUrn[1]);

        pages.bondBeneficiaryPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary`));
      });

      it('should submit the party URN to TFM', () => {
        pages.partiesPage.bondBeneficiaryEditLink().click();

        pages.bondBeneficiaryPage.urnInput(1).clear();
        pages.bondBeneficiaryPage.urnInput(2).clear();
        pages.bondBeneficiaryPage.urnInput(1).type(partyUrn[0]);
        pages.bondBeneficiaryPage.urnInput(2).type(partyUrn[1]);

        pages.bondBeneficiaryPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary`));

        pages.bondBeneficiaryPage.saveButton().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.partiesPage.bondBeneficiaryEditLink().should('exist');
      });

      it('should not remove the exporter party URN when the beneficiary URNs are submitted', () => {
        const exporterUrn = CONSTANTS.PARTY_URN.ANOTHER_VALID;
        submitExporterUrn(exporterUrn);
        pages.partiesPage.bondBeneficiaryEditLink().click();
        pages.bondBeneficiaryPage.urnInput(1).clear();
        pages.bondBeneficiaryPage.urnInput(2).clear();
        pages.bondBeneficiaryPage.urnInput(1).type(partyUrn[0]);
        pages.bondBeneficiaryPage.urnInput(2).type(partyUrn[1]);

        pages.bondBeneficiaryPage.saveButton().click();
        pages.bondBeneficiaryPage.saveButton().click();

        pages.partiesPage.exporterUrn().should('contain', exporterUrn);
      });

      function submitExporterUrn(urn) {
        pages.partiesPage.exporterEditLink().click();
        pages.exporterPage.urnInput().clear();
        pages.exporterPage.urnInput().type(urn);
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
        pages.partiesPage.bondBeneficiaryEditLink().should('not.exist');
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
