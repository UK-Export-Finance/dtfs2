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
      feeRecord: aFeeRecordEntityWithFacilityUtilisation(100),
      facilityUtilisationData: aFacilityUtilisationDataEntityWithUtilisation(100),
      expectedDifference: 0,
    },
    {
      condition: 'the fee record facilityUtilisation is greater',
      feeRecord: aFeeRecordEntityWithFacilityUtilisation(150),
      facilityUtilisationData: aFacilityUtilisationDataEntityWithUtilisation(100),
      expectedDifference: 50,
    },
    {
      condition: 'the facility utilisation is greater',
      feeRecord: aFeeRecordEntityWithFacilityUtilisation(100),
      facilityUtilisationData: aFacilityUtilisationDataEntityWithUtilisation(150),
      expectedDifference: -50,
    },
  ])(
    'returns the difference between then facility utilisation and the fee record facilityUtilisation when $condition',
    ({ feeRecord, facilityUtilisationData, expectedDifference }) => {
      // Act
      const result = calculatePrincipalBalanceAdjustment(feeRecord, facilityUtilisationData);

      // Assert
      expect(result).toEqual(expectedDifference);
    },
  );
});
