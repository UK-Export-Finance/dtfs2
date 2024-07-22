import { FacilityUtilisationDataEntityMockBuilder, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { calculatePrincipalBalanceAdjustment } from './calculate-principal-balance-adjustment';

describe('calculatePrincipalBalanceAdjustment', () => {
  const aFeeRecordEntityWithFacilityUtilisation = (facilityUtilisation: number) =>
    FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityUtilisation(facilityUtilisation).build();

  const aFacilityUtilisationDataEntityWithUtilisation = (utilisation: number) =>
    FacilityUtilisationDataEntityMockBuilder.forId('11111111').withUtilisation(utilisation).build();

  it('returns zero when the fee record facilityUtilisation is equal to the facilityUtilisationData utilisation', () => {
    // Arrange
    const feeRecord = aFeeRecordEntityWithFacilityUtilisation(100);
    const facilityUtilisationData = aFacilityUtilisationDataEntityWithUtilisation(100);

    // Act
    const result = calculatePrincipalBalanceAdjustment(feeRecord, facilityUtilisationData);

    // Assert
    expect(result).toBe(0);
  });

  it('returns a positive number when the fee record facilityUtilisation is greater than the facility utilisation data utilisation', () => {
    // Arrange
    const feeRecord = aFeeRecordEntityWithFacilityUtilisation(100);
    const facilityUtilisationData = aFacilityUtilisationDataEntityWithUtilisation(50);

    // Act
    const result = calculatePrincipalBalanceAdjustment(feeRecord, facilityUtilisationData);

    // Assert
    expect(result).toBeGreaterThan(0);
  });

  it('returns a negative number when the fee record facilityUtilisation is less than the facility utilisation data utilisation', () => {
    // Arrange
    const feeRecord = aFeeRecordEntityWithFacilityUtilisation(50);
    const facilityUtilisationData = aFacilityUtilisationDataEntityWithUtilisation(100);

    // Act
    const result = calculatePrincipalBalanceAdjustment(feeRecord, facilityUtilisationData);

    // Assert
    expect(result).toBeLessThan(0);
  });

  function aUtilisationReport() {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});
