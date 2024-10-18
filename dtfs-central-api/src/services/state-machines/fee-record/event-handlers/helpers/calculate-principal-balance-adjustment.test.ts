import { FacilityUtilisationDataEntityMockBuilder, FeeRecordEntityMockBuilder } from '@ukef/dtfs2-common';
import { calculatePrincipalBalanceAdjustment } from './calculate-principal-balance-adjustment';
import { aUtilisationReport } from '../../../../../../test-helpers';

describe('calculatePrincipalBalanceAdjustment', () => {
  const aFeeRecordEntityWithFacilityUtilisation = (facilityUtilisation: number) =>
    FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityUtilisation(facilityUtilisation).build();

  const aFacilityUtilisationDataEntityWithUtilisation = (utilisation: number) =>
    FacilityUtilisationDataEntityMockBuilder.forId('11111111').withUtilisation(utilisation).build();

  it.each([
    {
      condition: 'the amounts are equal',
      feeRecord: aFeeRecordEntityWithFacilityUtilisation(125),
      facilityUtilisationData: aFacilityUtilisationDataEntityWithUtilisation(25),
      expectedDifference: 0,
    },
    {
      condition: 'the fee record facilityUtilisation is greater',
      feeRecord: aFeeRecordEntityWithFacilityUtilisation(500),
      facilityUtilisationData: aFacilityUtilisationDataEntityWithUtilisation(50),
      expectedDifference: 50,
    },
    {
      condition: 'the facility utilisation is greater',
      feeRecord: aFeeRecordEntityWithFacilityUtilisation(100),
      facilityUtilisationData: aFacilityUtilisationDataEntityWithUtilisation(70),
      expectedDifference: -50,
    },
  ])(
    'returns the difference between then facility utilisation and the fee record facilityUtilisation when $condition',
    ({ feeRecord, facilityUtilisationData, expectedDifference }) => {
      const coverPercentage = 20;

      // Act
      const result = calculatePrincipalBalanceAdjustment(feeRecord, facilityUtilisationData, coverPercentage);

      // Assert
      expect(result).toEqual(expectedDifference);
    },
  );
});
