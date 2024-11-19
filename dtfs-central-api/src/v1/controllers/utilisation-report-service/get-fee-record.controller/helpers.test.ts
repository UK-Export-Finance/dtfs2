import { FeeRecordEntityMockBuilder, ReportPeriod, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapFeeRecordEntityToResponse } from './helpers';
import { getBankNameById } from '../../../../repositories/banks-repo';

jest.mock('../../../../repositories/banks-repo');

describe('get-fee-record.controller helpers', () => {
  describe('mapFeeRecordEntityToResponse', () => {
    const bankId = '123';

    const utilisationReport = new UtilisationReportEntityMockBuilder().withBankId(bankId).build();

    it('returns an object containing the bank', async () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(utilisationReport).build();

      const bankName = 'Test bank';
      jest.mocked(getBankNameById).mockResolvedValue(bankName);

      // Act
      const feeRecord = await mapFeeRecordEntityToResponse(feeRecordEntity);

      // Assert
      expect(feeRecord.bank).toEqual({ id: bankId, name: bankName });
      expect(getBankNameById).toHaveBeenCalledTimes(1);
      expect(getBankNameById).toHaveBeenCalledWith(bankId);
    });

    it('returns an object containing the report period', async () => {
      // Arrange
      const reportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(utilisationReport).build();
      feeRecordEntity.report.reportPeriod = reportPeriod;

      // Act
      const feeRecord = await mapFeeRecordEntityToResponse(feeRecordEntity);

      // Assert
      expect(feeRecord.reportPeriod).toEqual(reportPeriod);
    });

    it('returns an object containing the mapped fee record', async () => {
      // Arrange
      const id = 123;
      const facilityId = '0012345678';
      const exporter = 'A sample exporter';

      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withId(id)
        .withFacilityId(facilityId)
        .withExporter(exporter)
        .build();

      // Act
      const feeRecord = await mapFeeRecordEntityToResponse(feeRecordEntity);

      // Assert
      expect(feeRecord.id).toEqual(id);
      expect(feeRecord.facilityId).toEqual(facilityId);
      expect(feeRecord.exporter).toEqual(exporter);
    });
  });
});
