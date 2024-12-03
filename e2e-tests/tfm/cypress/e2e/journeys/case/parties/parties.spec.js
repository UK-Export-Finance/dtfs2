import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { T1_USER_1, BUSINESS_SUPPORT_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

context('Parties page', () => {
  let dealId;
  const dealFacilities = [];

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

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  describe('for any user', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);
      cy.visit(relative(`/case/${dealId}/parties`));
    });

    it('should render components', () => {
      pages.partiesPage.partiesHeading().contains('Parties');
      pages.partiesPage.exporterArea().should('exist');
      pages.partiesPage.buyerArea().should('exist');
      pages.partiesPage.agentArea().should('exist');
      pages.partiesPage.indemnifierArea().should('exist');
    });

    describe('bond issuer facilities table', () => {
      it('clicking `Facility ID` link should take user to facility details page', () => {
        const facilityId = dealFacilities[0]._id;
        const facilityRow = pages.partiesPage.bondIssuerFacilitiesTable.row(facilityId);

        facilityRow.facilityId().click();

        cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
      });
    });

    describe('bond beneficiary facilities table', () => {
      it('clicking `Facility ID` link should take user to facility details page', () => {
        cy.visit(`/case/${dealId}/parties`);

        const facilityId = dealFacilities[0]._id;
        const facilityRow = pages.partiesPage.bondBeneficiaryFacilitiesTable.row(facilityId);

        facilityRow.facilityId().click();

        cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
      });
    });

    it('does not render edit links', () => {
      pages.partiesPage.exporterEditLink().should('not.exist');
      pages.partiesPage.buyerEditLink().should('not.exist');
      pages.partiesPage.agentEditLink().should('not.exist');
      pages.partiesPage.indemnifierEditLink().should('not.exist');
      pages.partiesPage.bondIssuerEditLink().should('not.exist');
      pages.partiesPage.bondBeneficiaryEditLink().should('not.exist');
    });
  });

  describe('when user is in BUSINESS_SUPPORT team', () => {
    beforeEach(() => {
      cy.login(BUSINESS_SUPPORT_USER_1);
      cy.visit(relative(`/case/${dealId}/parties`));
    });

    it('renders edit links', () => {
      pages.partiesPage.exporterEditLink().should('exist');
      pages.partiesPage.buyerEditLink().should('exist');
      pages.partiesPage.agentEditLink().should('exist');
      pages.partiesPage.indemnifierEditLink().should('exist');
      pages.partiesPage.bondIssuerEditLink().should('exist');
      pages.partiesPage.bondBeneficiaryEditLink().should('exist');
    });
  });
});
