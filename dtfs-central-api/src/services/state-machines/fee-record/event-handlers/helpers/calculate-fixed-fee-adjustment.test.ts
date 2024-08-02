import { when } from 'jest-when';
import { FacilityUtilisationDataEntityMockBuilder, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { calculateFixedFeeAdjustment } from './calculate-fixed-fee-adjustment';
import { aReportPeriod } from '../../../../../../test-helpers/test-data';
import { calculateFixedFee } from './calculate-fixed-fee';

jest.mock('./calculate-fixed-fee');

describe('calculateFixedFeeAdjustment', () => {
  beforeEach(() => {
    jest.mocked(calculateFixedFee).mockRejectedValue(new Error('Some error'));
  });

  it('throws an error if the fee record facility id does not match the facility utilisation data id', async () => {
    // Arrange
    const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId('11111111').build();
    const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId('22222222').build();

    // Act / Assert
    await expect(calculateFixedFeeAdjustment(feeRecord, facilityUtilisationData, aReportPeriod())).rejects.toThrow(
      new Error('Fee record facility id does not match the facility utilisation id'),
    );
  });

  it('returns the difference between the current fixed fee and the facility utilisation data fixed fee rounded to 2 decimal places', async () => {
    // Arrange
    const reportPeriod = aReportPeriod();
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withReportPeriod(reportPeriod).build();

    const facilityId = '123456789';
    const feeRecordFacilityUtilisation = 123.456;
    const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
      .withFacilityId(facilityId)
      .withFacilityUtilisation(feeRecordFacilityUtilisation)
      .build();
    const feeRecordFixedFee = 123.456;
    when(calculateFixedFee).calledWith(feeRecordFacilityUtilisation, facilityId, reportPeriod).mockResolvedValue(feeRecordFixedFee);

    const facilityUtilisationDataUtilisation = 654.321;
    const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId(facilityId).withUtilisation(facilityUtilisationDataUtilisation).build();
    const facilityUtilisationDataFixedFee = 23.332;
    when(calculateFixedFee)
      .calledWith(facilityUtilisationDataUtilisation, facilityId, facilityUtilisationData.reportPeriod)
      .mockResolvedValue(facilityUtilisationDataFixedFee);

    // Act
    const result = await calculateFixedFeeAdjustment(feeRecord, facilityUtilisationData, reportPeriod);

    // Assert
    expect(result).toBe(100.12);
  });

  function aUtilisationReport() {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});
