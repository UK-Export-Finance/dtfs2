import { when } from 'jest-when';
import {
  FacilityUtilisationDataEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  ReportPeriod,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { calculateFixedFeeAdjustment } from './calculate-fixed-fee-adjustment';
import { aReportPeriod, aUtilisationReport } from '../../../../../../test-helpers';
import { getFixedFeeForFacility } from './get-fixed-fee-for-facility';

jest.mock('./get-fixed-fee-for-facility');

describe('calculateFixedFeeAdjustment', () => {
  beforeEach(() => {
    jest.mocked(getFixedFeeForFacility).mockRejectedValue(new Error('Some error'));
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

  it('throws an error if the facility utilisation data report period is the same as the supplied report period', async () => {
    // Arrange
    const reportPeriod: ReportPeriod = {
      start: { month: 1, year: 2024 },
      end: { month: 1, year: 2024 },
    };
    const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
      .withReportPeriod(reportPeriod)
      .build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('11111111').build();
    const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId('11111111').withReportPeriod(reportPeriod).build();

    // Act / Assert
    await expect(calculateFixedFeeAdjustment(feeRecord, facilityUtilisationData, reportPeriod)).rejects.toThrow(
      new Error('Fixed fee adjustment must be calculated before the facility utilisation data has been updated'),
    );
  });

  it.each([
    { condition: 'the previous fixed fee is greater', previousFixedFee: 123.456, currentFixedFee: 23.332, expected: -100.12 },
    { condition: 'the current fixed fee is greater', previousFixedFee: 23.332, currentFixedFee: 123.456, expected: 100.12 },
    { condition: 'both fixed fees are equal', previousFixedFee: 100, currentFixedFee: 100, expected: 0 },
  ])(
    'returns the difference between the current and previous fixed fee rounded to 2 decimal places when $condition',
    async ({ previousFixedFee, currentFixedFee, expected }) => {
      // Arrange
      const reportPeriod = aReportPeriod();
      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
        .withReportPeriod(reportPeriod)
        .build();

      const currentFacilityUtilisation = 123.456;
      const facilityId = '123456789';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFacilityId(facilityId)
        .withFacilityUtilisation(currentFacilityUtilisation)
        .build();
      when(getFixedFeeForFacility).calledWith(facilityId, currentFacilityUtilisation, reportPeriod).mockResolvedValue(currentFixedFee);

      const previousFacilityUtilisation = 654.321;
      const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId(facilityId)
        .withUtilisation(previousFacilityUtilisation)
        .withFixedFee(previousFixedFee)
        .build();

      // Act
      const result = await calculateFixedFeeAdjustment(feeRecord, facilityUtilisationData, reportPeriod);

      // Assert
      expect(result).toEqual(expected);
    },
  );
});
