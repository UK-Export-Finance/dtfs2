import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('User can view party details', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
        const { dealType } = deal;

        const { mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType);
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.visit(relative(`/case/${dealId}/parties`));
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  describe('Parties page', () => {
    it('should render components in party page', () => {
      pages.partiesPage.exporterArea().should('exist');
      pages.partiesPage.buyerArea().should('exist');
      pages.partiesPage.agentArea().should('exist');
      pages.partiesPage.indemnifierArea().should('exist');

      pages.partiesPage.exporterEditLink().should('have.length', 1);
      pages.partiesPage.buyerEditLink().should('have.length', 1);
      pages.partiesPage.agentEditLink().should('have.length', 1);
      pages.partiesPage.indemnifierEditLink().should('have.length', 1);
    });
  });

  describe('bond issuer facilities table', () => {
    it('clicking `Facility ID` link should take user to facility details page', () => {
      const facilityId = dealFacilities[0]._id; // eslint-disable-line no-underscore-dangle
      const facilityRow = pages.partiesPage.bondIssuerFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
    });
  });

  describe('bond beneficiary facilities table', () => {
    it('clicking `Facility ID` link should take user to facility details page', () => {
      cy.visit(`/case/${dealId}/parties`);

      const facilityId = dealFacilities[0]._id; // eslint-disable-line no-underscore-dangle
      const facilityRow = pages.partiesPage.bondBeneficiaryFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
    });
  });
});
