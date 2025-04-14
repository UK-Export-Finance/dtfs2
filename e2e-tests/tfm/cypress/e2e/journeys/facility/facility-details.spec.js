import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import MOCK_DEAL_MIN from '../../../fixtures/deal-MIN';
import { T1_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Facility page', () => {
  let ainDealId;
  let miaDealId;
  let minDealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      ainDealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(ainDealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(ainDealId, dealType, T1_USER_1);
    });

    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      miaDealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(miaDealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(miaDealId, dealType, T1_USER_1);
    });

    // Create a new MIN deal based on the mock data
    const newMinDeal = {
      ...MOCK_DEAL_MIN,
      _id: undefined, // Remove the _id so MongoDB will generate a new one
    };

    cy.insertOneDeal(newMinDeal, BANK1_MAKER1).then((insertedDeal) => {
      minDealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIN;

      cy.createFacilities(minDealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(minDealId, dealType, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
  });

  after(() => {
    cy.deleteDeals(ainDealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should display Inclusion notice received when submission type is Automatic Inclusion Notice', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${ainDealId}/facility/${facilityId}`));

    // Wait for the page to load
    cy.contains('Dates').should('be.visible');

    // Check the Inclusion notice received field under the Dates section
    cy.get('[data-cy="facility-inclusion-notice-received"]').should('not.contain', '-');
  });

  it('should display dash for Inclusion notice received when submission type is Manual Inclusion Application', () => {
    const facilityId = dealFacilities[1]._id;
    cy.visit(relative(`/case/${miaDealId}/facility/${facilityId}`));

    cy.get('[data-cy="facility-inclusion-notice-received"]').should('contain', '-');
  });

  it('should display Inclusion notice received when submission type is Manual Inclusion Notice', () => {
    const facilityId = dealFacilities[2]._id; // Assuming this is the MIN facility
    cy.visit(relative(`/case/${minDealId}/facility/${facilityId}`));

    // Wait for the page to load
    cy.contains('Dates').should('be.visible');

    // Check the Inclusion notice received field under the Dates section
    cy.get('[data-cy="facility-inclusion-notice-received"]').should('not.contain', '-');
  });
});
