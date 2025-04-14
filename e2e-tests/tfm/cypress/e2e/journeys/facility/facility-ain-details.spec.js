import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { T1_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Facility page - Automatic Inclusion Notice', () => {
  let ainDealId;
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

  it('should display Inclusion notice received as timestamp when submission type is Automatic Inclusion Notice', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${ainDealId}/facility/${facilityId}`));

    // Wait for the page to load
    cy.contains('Dates').should('be.visible');

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
