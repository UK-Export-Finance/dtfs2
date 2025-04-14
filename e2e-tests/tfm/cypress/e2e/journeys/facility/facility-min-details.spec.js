import relative from '../../relativeURL';
import MOCK_DEAL_MIN from '../../../fixtures/deal-MIN';
import { T1_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Facility page - Manual Inclusion Notice', () => {
  let minDealId;
  const dealFacilities = [];

  before(() => {
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
    cy.deleteDeals(minDealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should display Inclusion notice received as timestamp when submission type is Manual Inclusion Notice', () => {
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${minDealId}/facility/${facilityId}`));

    // Wait for the page to load
    cy.contains('Dates').should('be.visible');

    // Check the Inclusion notice received field under the Dates section
    cy.get('[data-cy="facility-inclusion-notice-received"]')
      .invoke('text')
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.match(/^\d{1,2} [A-Za-z]+ \d{4}$/);

        // Parse the date to ensure it's valid
        const date = new Date(trimmedText);
        expect(date).to.be.a('date');
      });
  });
});
