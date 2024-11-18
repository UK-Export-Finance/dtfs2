import { FeeRecordEntityMockBuilder, ReportPeriod, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapFeeRecordEntityToDetails } from './helpers';
import { getBankNameById } from '../../../../repositories/banks-repo';

jest.mock('../../../../repositories/banks-repo');

describe('get-fee-record-details.controller helpers', () => {
  describe('mapToFeeRecordDetails', () => {
    const bankId = '123';

    const utilisationReport = new UtilisationReportEntityMockBuilder().withBankId(bankId).build();

    it('returns an object containing the bank', async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).build();

      const bankName = 'Test bank';
      jest.mocked(getBankNameById).mockResolvedValue(bankName);

      // Act
      const feeRecordDetails = await mapFeeRecordEntityToDetails(feeRecord);

      // Assert
      expect(feeRecordDetails.bank).toEqual({ id: bankId, name: bankName });
      expect(getBankNameById).toHaveBeenCalledTimes(1);
      expect(getBankNameById).toHaveBeenCalledWith(bankId);
    });

    it('returns an object containing the report period', async () => {
      // Arrange
      const reportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).build();
      feeRecord.report.reportPeriod = reportPeriod;

      // Act
      const feeRecordDetails = await mapFeeRecordEntityToDetails(feeRecord);

      // Assert
      expect(feeRecordDetails.reportPeriod).toEqual(reportPeriod);
    });

    it('returns an object containing the mapped fee record details', async () => {
      // Arrange
      const id = 123;
      const facilityId = '0012345678';
      const exporter = 'A sample exporter';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withId(id)
        .withFacilityId(facilityId)
        .withExporter(exporter)
        .build();

      // Act
      const feeRecordDetails = await mapFeeRecordEntityToDetails(feeRecord);

      // Assert
      expect(feeRecordDetails.id).toEqual(id);
      expect(feeRecordDetails.facilityId).toEqual(facilityId);
      expect(feeRecordDetails.exporter).toEqual(exporter);
    });
  });
});
