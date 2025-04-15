import relative from '../../relativeURL';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Facility page - Manual Inclusion Application', () => {
  let miaDealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      miaDealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(miaDealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(miaDealId, dealType, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
  });

  after(() => {
    cy.deleteDeals(miaDealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should display dash for Inclusion notice received when submission type is Manual Inclusion Application', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${miaDealId}/facility/${facilityId}`));

    cy.get('[data-cy="facility-inclusion-notice-received"]')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('-');
      });
  });
});
