import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  ReportPeriod,
  UTILISATION_REPORT_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { getFeeRecordsToKey, GetFeeRecordsToKeyResponseBody } from '.';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { getBankNameById } from '../../../../repositories/banks-repo';

console.error = jest.fn();

jest.mock('../../../../repositories/banks-repo');

describe('get-fee-records-to-key.controller', () => {
  describe('getFeeRecordsToKey', () => {
    const findOneByIdWithFeeRecordsFilteredByStatusWithPaymentsSpy = jest.spyOn(UtilisationReportRepo, 'findOneByIdWithFeeRecordsFilteredByStatusWithPayments');

    const aUtilisationReportWithFeeRecordsAndPayments = () => {
      const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS).build();
      const payments = [PaymentEntityMockBuilder.forCurrency('GBP').build()];
      const feeRecords = [FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.MATCH).withPayments(payments).build()];
      report.feeRecords = feeRecords;
      return report;
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with a 404 when no utilisation report can be found', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        params: { reportId: '1' },
      });

      findOneByIdWithFeeRecordsFilteredByStatusWithPaymentsSpy.mockResolvedValue(null);

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      expect(findOneByIdWithFeeRecordsFilteredByStatusWithPaymentsSpy).toHaveBeenCalledWith(1, [FEE_RECORD_STATUS.MATCH]);
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it('responds with a 404 when no bank with the utilisation report bank id can be found', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        params: { reportId: '1' },
      });

      const bankId = '123';
      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS)
        .withId(1)
        .withBankId(bankId)
        .build();

      findOneByIdWithFeeRecordsFilteredByStatusWithPaymentsSpy.mockResolvedValue(utilisationReport);
      jest.mocked(getBankNameById).mockResolvedValue(undefined);

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      expect(getBankNameById).toHaveBeenCalledWith(bankId);
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it('responds with a 200', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        params: { reportId: '1' },
      });

      findOneByIdWithFeeRecordsFilteredByStatusWithPaymentsSpy.mockResolvedValue(aUtilisationReportWithFeeRecordsAndPayments());
      jest.mocked(getBankNameById).mockResolvedValue('Test bank');

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it('responds with a body containing the report id', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        params: { reportId: '1' },
      });

      const utilisationReport = aUtilisationReportWithFeeRecordsAndPayments();
      utilisationReport.id = 1;

      findOneByIdWithFeeRecordsFilteredByStatusWithPaymentsSpy.mockResolvedValue(utilisationReport);
      jest.mocked(getBankNameById).mockResolvedValue('Test bank');

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      const responseBody = res._getData() as GetFeeRecordsToKeyResponseBody;
      expect(responseBody.reportId).toEqual(1);
    });

    it('responds with a body containing the report session bank', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        params: { reportId: '1' },
      });

      const bankId = '123';
      const bankName = 'Test bank';

      const utilisationReport = aUtilisationReportWithFeeRecordsAndPayments();
      utilisationReport.bankId = bankId;

      findOneByIdWithFeeRecordsFilteredByStatusWithPaymentsSpy.mockResolvedValue(utilisationReport);
      jest.mocked(getBankNameById).mockResolvedValue(bankName);

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      const responseBody = res._getData() as GetFeeRecordsToKeyResponseBody;
      expect(responseBody.bank).toEqual({ id: bankId, name: bankName });
    });

    it('responds with a body containing the report report period', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        params: { reportId: '1' },
      });

      const reportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 2, year: 2024 },
      };

      const utilisationReport = aUtilisationReportWithFeeRecordsAndPayments();
      utilisationReport.reportPeriod = reportPeriod;

      findOneByIdWithFeeRecordsFilteredByStatusWithPaymentsSpy.mockResolvedValue(utilisationReport);
      jest.mocked(getBankNameById).mockResolvedValue('Test bank');

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      const responseBody = res._getData() as GetFeeRecordsToKeyResponseBody;
      expect(responseBody.reportPeriod).toEqual(reportPeriod);
    });

    it('responds with a body containing the fee records', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        params: { reportId: '1' },
      });

      const utilisationReport = aUtilisationReportWithFeeRecordsAndPayments();
      utilisationReport.feeRecords = [];

      findOneByIdWithFeeRecordsFilteredByStatusWithPaymentsSpy.mockResolvedValue(utilisationReport);
      jest.mocked(getBankNameById).mockResolvedValue('Test bank');

      // Act
      await getFeeRecordsToKey(req, res);

      // Assert
      const responseBody = res._getData() as GetFeeRecordsToKeyResponseBody;
      expect(responseBody.feeRecords).toEqual([]);
    });
  });
});
