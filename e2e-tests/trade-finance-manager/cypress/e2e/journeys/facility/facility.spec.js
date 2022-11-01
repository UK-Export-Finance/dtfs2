import relative from '../../relativeURL';
import partials from '../../partials';
import facilityPage from '../../pages/facilityPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { T1_USER_1 } from '../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../fixtures/users-portal';

context('Facility page', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('renders case summary with deal data', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    // check that a couple of case summary elements have data
    // (no need to check all in E2E test)
    partials.caseSummary.ukefDealId().should('be.visible');
    partials.caseSummary.ukefDealId().invoke('text').then((text) => {
      expect(text.trim()).equal(MOCK_DEAL_AIN.details.ukefDealId);
    });

    partials.caseSummary.exporterName().should('be.visible');
    partials.caseSummary.exporterName().invoke('text').then((text) => {
      expect(text.trim()).equal(MOCK_DEAL_AIN.exporter.companyName);
    });

    facilityPage.facilityMaximumUkefExposure().contains(dealFacilities[0].ukefExposure);
  });

  it('user can navigate back to parties page via sub navigation', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    partials.caseSubNavigation.partiesLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/parties`));
  });
});
