import { MOCK_DEAL_AIN } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1 } from '../../../../../../e2e-fixtures';
import { calculateTestFacilityTenorValue } from '../../../../support/utils/facility-tenor';

const year = 2025;

// Helper to pad month/day with leading zero
const pad = (n) => n.toString().padStart(2, '0');

// Generate all dates in 'DD-MM-YYYY' format
const dates = [];
for (let month = 0; month < 12; month += 1) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    dates.push(`${pad(month + 1)}-${pad(day)}-${year}`);
  }
}

for (const date of dates) {
  context('Amendments underwriting - add banks decision - proceed', () => {
    const facilityTenor = calculateTestFacilityTenorValue(date);

    let dealId;
    const dealFacilities = [];

    before(() => {
      cy.insertOneDeal(MOCK_DEAL_AIN(date), BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN(date);

        cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType, PIM_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
      dealFacilities.forEach((facility) => {
        cy.deleteFacility(facility._id, BANK1_MAKER1);
      });
    });

    it(`should display facility details and values on deal and facility page - ${date}`, () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTenor().contains(facilityTenor);
    });
  });
}
