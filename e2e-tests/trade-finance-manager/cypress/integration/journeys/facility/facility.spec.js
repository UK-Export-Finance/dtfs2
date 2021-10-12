import relative from '../../relativeURL';
import partials from '../../partials';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../fixtures/users-portal';

context('Facility page', () => {
  let dealId;
  const dealFacilities = [];

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

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
  });

  after(() => {
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

    partials.caseSummary.supplierName().should('be.visible');
    partials.caseSummary.supplierName().invoke('text').then((text) => {
      expect(text.trim()).equal(MOCK_DEAL_AIN.submissionDetails['supplier-name']);
    });
  });

  it('user can navigate back to parties page via sub navigation', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    partials.caseSubNavigation.partiesLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/parties`));
  });
});
