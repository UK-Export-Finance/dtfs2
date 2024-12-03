import relative from '../../relativeURL';
import { caseSummary, caseSubNavigation } from '../../partials';
import facilityPage from '../../pages/facilityPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { T1_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Facility page', () => {
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

  beforeEach(() => {
    cy.login(T1_USER_1);
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('renders case summary with deal data', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    // check that a couple of case summary elements have data
    // (no need to check all in E2E test)
    caseSummary.ukefDealId().should('be.visible');

    cy.assertText(caseSummary.ukefDealId(), MOCK_DEAL_AIN.details.ukefDealId);

    caseSummary.exporterName().should('be.visible');

    cy.assertText(caseSummary.exporterName(), MOCK_DEAL_AIN.exporter.companyName);

    facilityPage.facilityMaximumUkefExposure().contains(dealFacilities[0].ukefExposure);
  });

  it('user can navigate back to parties page via sub navigation', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    caseSubNavigation.partiesLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/parties`));
  });
});
