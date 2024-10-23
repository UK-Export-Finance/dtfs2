import { FacilityUtilisationDataEntityMockBuilder } from '@ukef/dtfs2-common';
import { calculatePrincipalBalanceAdjustment } from './calculate-principal-balance-adjustment';

describe('calculatePrincipalBalanceAdjustment', () => {
  const aFacilityUtilisationDataEntityWithUtilisation = (utilisation: number) =>
    FacilityUtilisationDataEntityMockBuilder.forId('11111111').withUtilisation(utilisation).build();

  it.each([
    {
      condition: 'the amounts are equal',
      ukefShareOfUtilisation: 250000,
      facilityUtilisationData: aFacilityUtilisationDataEntityWithUtilisation(250000),
      expectedDifference: 0,
    },
    {
      condition: 'the current utilisation is greater',
      ukefShareOfUtilisation: 500000,
      facilityUtilisationData: aFacilityUtilisationDataEntityWithUtilisation(450000),
      expectedDifference: 50000,
    },
    {
      condition: 'the previous utilisation is greater',
      ukefShareOfUtilisation: 100000,
      facilityUtilisationData: aFacilityUtilisationDataEntityWithUtilisation(150000),
      expectedDifference: -50000,
    },
  ])(
    'returns the difference between then facility utilisation and the fee record facilityUtilisation when $condition',
    ({ ukefShareOfUtilisation, facilityUtilisationData, expectedDifference }) => {
      // Act
      const result = calculatePrincipalBalanceAdjustment(ukefShareOfUtilisation, facilityUtilisationData);

      // Assert
      expect(result).toEqual(expectedDifference);
    },
  );
});
