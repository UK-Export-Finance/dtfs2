import relative from '../../relativeURL';
import pages from '../../pages';
import partials from '../../partials';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../fixtures/users-portal';

context('User can view a case deal', () => {
  let dealId;
  let dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN);

    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities = createdFacilities;
        });

        cy.submitDeal(dealId, dealType);
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    dealFacilities.forEach(({ _id }) => {
      cy.deleteFacility(_id, MOCK_MAKER_TFM);
    });
  });

  it('should render case deal components', () => {
    pages.caseDealPage.caseSummary().should('exist');
    pages.caseDealPage.caseSubNavigation().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
    pages.caseDealPage.mgaVersion().should('exist');
  });

  it('should render case summary fields', () => {
    partials.caseSummary.dealSubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain(MOCK_DEAL_AIN.submissionType);
    });

    partials.caseSummary.exporterName().invoke('text').then((text) => {
      expect(text.trim()).to.contain(MOCK_DEAL_AIN.exporter.companyName);
    });
  });

  it('should render correct MGA version', () => {
    pages.caseDealPage.mgaVersion().should('have.text', 'January 2020');
  });

  describe('facilities table', () => {
    it('clicking `Facility ID` link should take user to facility details page', () => {
      const facilityId = dealFacilities[0]._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
    });
  });
});
