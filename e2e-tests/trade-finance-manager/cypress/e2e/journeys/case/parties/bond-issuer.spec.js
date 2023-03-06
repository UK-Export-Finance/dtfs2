import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Bond issuer URN - User can add, edit, confirm and submit URN to the TFM', () => {
  let dealId;
  const dealFacilities = [];
  const party = 'bond-issuer';
  // const mockUrn = ['1234', '1234'];
  // const partyUrn = ['00307249', '00307249'];

  // Submit a deal with facilities
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

  // Delete deal and facilities post E2E
  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  describe('Bond issuer party', () => {
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
