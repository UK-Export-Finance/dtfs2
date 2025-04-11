import relative from '../../relativeURL';
import { caseSummary, caseSubNavigation } from '../../partials';
import facilityPage from '../../pages/facilityPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Facility page', () => {
  let dealId;
  let deal1;
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

    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      deal1 = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(deal1, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(deal1, dealType, T1_USER_1);
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

  it('should display Inclusion notice received when submission type is Automatic Inclusion Notice', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    // Wait for the page to load
    cy.contains('Dates').should('be.visible');

    // Check the Inclusion notice received field under the Dates section
    cy.get('[data-cy="facility-inclusion-notice-received"]').should('not.contain', '-');
  });

  it('should display dash for Inclusion notice received when submission type is Manual Inclusion Application', () => {
    const facilityId = dealFacilities[1]._id;
    cy.visit(relative(`/case/${deal1}/facility/${facilityId}`));

    cy.get('[data-cy="facility-inclusion-notice-received"]').should('contain', '-');
  });
});
