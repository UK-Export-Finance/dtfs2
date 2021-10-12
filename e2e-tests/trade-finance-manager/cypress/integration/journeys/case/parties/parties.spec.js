import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Parties page', () => {
  let dealId;
  const dealFacilities = [];
  const team1User = MOCK_USERS.find((user) => user.teams.includes('TEAM1'));
  const businessSupportUser = MOCK_USERS.find((user) => user.teams.includes('BUSINESS_SUPPORT'));


  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN);

    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType);
      });
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  describe('for any user', () => {
    beforeEach(() => {
      cy.login(team1User);
      cy.visit(relative(`/case/${dealId}/parties`));
    });

    it('should render components', () => {
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

    it.only('does not render edit links', () => {
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
      cy.login(businessSupportUser);
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
