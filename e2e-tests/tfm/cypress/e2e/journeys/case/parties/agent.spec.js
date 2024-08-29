import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

const CONSTANTS = require('../../../../fixtures/constants');

context('Agent Party URN - User can add, edit, confirm and submit URN to the TFM', () => {
  let dealId;
  const dealFacilities = [];
  const party = CONSTANTS.PARTIES.AGENT;
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

  describe('Agent party', () => {
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
        pages.partiesPage.agentEditLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        pages.partiesPage.agentEditLink().should('not.exist');

        pages.agentPage.agentUniqueRefInput().should('exist');
        pages.agentPage.heading().should('have.text', 'Edit agent details');

        pages.agentPage.saveButton().should('exist');
        pages.agentPage.closeLink().should('exist');

        // Go back
        pages.agentPage.closeLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should have the back link', () => {
        pages.partiesPage.agentEditLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));

        pages.partiesPage.backLink().should('exist');

        pages.partiesPage.backLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));
      });

      it('should throw an error upon validation failure', () => {
        pages.partiesPage.agentEditLink().click();
        pages.agentPage.agentUniqueRefInput().clear();

        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a unique reference number');
        pages.agentPage.urnError().contains('Enter a unique reference number');

        pages.agentPage.agentUniqueRefInput().clear();
        pages.agentPage.agentUniqueRefInput().type('test');

        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type('12');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type('ABC123');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type('"!£!"£!"£!"£');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type('1234!');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');

        pages.agentPage.agentUniqueRefInput().clear().type(' ');
        pages.agentPage.saveButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}`));
        errorSummary().contains('Enter a minimum of 3 numbers');
        pages.agentPage.urnError().contains('Enter a minimum of 3 numbers');
      });

      it('should re-direct to non-existent party urn page', () => {
        pages.partiesPage.agentEditLink().click();
        pages.agentPage.agentUniqueRefInput().clear();
        pages.agentPage.agentUniqueRefInput().type(mockUrn);

        pages.agentPage.saveButton().click();

        pages.partiesPage.nonExistentHeading().should('exist');
      });

      it('should re-direct to summary page', () => {
        pages.partiesPage.agentEditLink().click();
        pages.agentPage.agentUniqueRefInput().clear();
        pages.agentPage.agentUniqueRefInput().type(partyUrn);

        pages.agentPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary/${partyUrn}`));
      });

      it('should submit the party URN to TFM', () => {
        pages.partiesPage.agentEditLink().click();
        pages.agentPage.agentUniqueRefInput().clear();
        pages.agentPage.agentUniqueRefInput().type(partyUrn);

        pages.agentPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary/${partyUrn}`));

        pages.agentPage.saveButton().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.agentPage
          .agentUniqueRef()
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(partyUrn);
          });

        pages.partiesPage.agentEditLink().click();
        pages.agentPage
          .agentUniqueRefInput()
          .invoke('val')
          .then((value) => {
            expect(value.trim()).equal(partyUrn);
          });
      });

      it('should submit the party URN and commission rate to TFM', () => {
        pages.partiesPage.agentEditLink().click();
        pages.agentPage.agentUniqueRefInput().clear();
        pages.agentPage.agentCommissionRateInput().clear();
        pages.agentPage.agentUniqueRefInput().type(partyUrn);
        pages.agentPage.agentCommissionRateInput().type('1.234');

        pages.agentPage.saveButton().click();

        pages.partiesPage.partyUrnSummaryTable().should('exist');
        cy.url().should('eq', relative(`/case/${dealId}/parties/${party}/summary/${partyUrn}`));

        pages.agentPage.saveButton().click();
        cy.url().should('eq', relative(`/case/${dealId}/parties`));

        pages.agentPage
          .agentUniqueRef()
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal(partyUrn);
          });
        pages.agentPage
          .agentCommissionRate()
          .invoke('text')
          .then((text) => {
            expect(text.trim()).equal('1.234');
          });

        pages.partiesPage.agentEditLink().click();
        pages.agentPage
          .agentUniqueRefInput()
          .invoke('val')
          .then((value) => {
            expect(value.trim()).equal(partyUrn);
          });
        pages.agentPage
          .agentCommissionRateInput()
          .invoke('val')
          .then((text) => {
            expect(text.trim()).equal('1.234');
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
      pages.partiesPage.agentEditLink().should('not.exist');
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
