import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { FeeRecordEntityMockBuilder, ReportPeriod, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { GetUtilisationReportReconciliationDetailsByIdRequest, getUtilisationReportReconciliationDetailsById } from '.';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import * as banksRepo from '../../../../repositories/banks-repo';
import { FeeRecordItem, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';

console.error = jest.fn();

describe('get-utilisation-report-reconciliation-details-by-id.controller', () => {
  describe('getUtilisationReportReconciliationDetailsById', () => {
    const reportId = 1;
    const getHttpMocks = () =>
      httpMocks.createMocks<GetUtilisationReportReconciliationDetailsByIdRequest>({
        params: {
          reportId,
        },
      });

    const findOneSpy = jest.spyOn(UtilisationReportRepo, 'findOne');

    const getBankNameByIdSpy = jest.spyOn(banksRepo, 'getBankNameById');

    it('responds with a 404 when the report cannot be found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findOneSpy.mockResolvedValue(null);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getData()).toBe(
        `Failed to get utilisation report reconciliation for report with id '${reportId}': Failed to find a report with id '${reportId}'`,
      );
      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: reportId },
        relations: { feeRecords: true },
      });
      expect(getBankNameByIdSpy).not.toHaveBeenCalled();
    });

    it('responds with a 500 when the report has not been uploaded', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const notReceivedReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
        .withId(reportId)
        .withDateUploaded(null)
        .build();
      findOneSpy.mockResolvedValue(notReceivedReport);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._getData()).toBe(`Failed to get utilisation report reconciliation for report with id '${reportId}'`);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: reportId },
        relations: { feeRecords: true },
      });
      expect(getBankNameByIdSpy).not.toHaveBeenCalled();
    });

    it('responds with a 404 when a bank with the matching id cannot be found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const bankId = '123';
      const pendingReconciliationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withId(reportId)
        .withBankId(bankId)
        .build();
      findOneSpy.mockResolvedValue(pendingReconciliationReport);

      getBankNameByIdSpy.mockResolvedValue(undefined);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._getData()).toBe(
        `Failed to get utilisation report reconciliation for report with id '${reportId}': Failed to find a bank with id '${bankId}'`,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: reportId },
        relations: { feeRecords: true },
      });
      expect(getBankNameByIdSpy).toHaveBeenCalledWith(bankId);
    });

    it('responds with a 200 and the mapped report', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const bankId = '123';
      const dateUploaded = new Date();
      const reportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 3, year: 2024 },
      };
      const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
        .withId(reportId)
        .withBankId(bankId)
        .withReportPeriod(reportPeriod)
        .withDateUploaded(dateUploaded)
        .build();

      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport)
          .withId(1)
          .withFacilityId('12345678')
          .withExporter('Test exporter 1')
          .withFeesPaidToUkefForThePeriodCurrency('GBP')
          .withFeesPaidToUkefForThePeriod(314.59)
          .withPaymentCurrency('GBP')
          .withStatus('TO_DO')
          .build(),
        FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport)
          .withId(2)
          .withFacilityId('87654321')
          .withExporter('Test exporter 2')
          .withFeesPaidToUkefForThePeriodCurrency('EUR')
          .withFeesPaidToUkefForThePeriod(100.0)
          .withPaymentCurrency('GBP')
          .withPaymentExchangeRate(1.1)
          .withStatus('TO_DO')
          .build(),
      ];
      reconciliationInProgressReport.feeRecords = feeRecords;

      findOneSpy.mockResolvedValue(reconciliationInProgressReport);

      const feeRecordItems: FeeRecordItem[] = [
        {
          id: 1,
          facilityId: '12345678',
          exporter: 'Test exporter 1',
          reportedFees: {
            currency: 'GBP',
            amount: 314.59,
          },
          reportedPayments: {
            currency: 'GBP',
            amount: 314.59,
          },
          totalReportedPayments: {
            currency: 'GBP',
            amount: 314.59,
          },
          paymentsReceived: null,
          totalPaymentsReceived: null,
          status: 'TO_DO',
        },
        {
          id: 2,
          facilityId: '87654321',
          exporter: 'Test exporter 2',
          reportedFees: {
            currency: 'EUR',
            amount: 100.0,
          },
          reportedPayments: {
            currency: 'GBP',
            amount: 90.91,
          },
          totalReportedPayments: {
            currency: 'GBP',
            amount: 90.91,
          },
          paymentsReceived: null,
          totalPaymentsReceived: null,
          status: 'TO_DO',
        },
      ];

      const bankName = 'Test bank';
      getBankNameByIdSpy.mockResolvedValue(bankName);

      // Act
      await getUtilisationReportReconciliationDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual<UtilisationReportReconciliationDetails>({
        reportId,
        bank: {
          id: bankId,
          name: bankName,
        },
        status: 'RECONCILIATION_IN_PROGRESS',
        reportPeriod,
        dateUploaded,
        feeRecords: feeRecordItems,
      });

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: reportId },
        relations: { feeRecords: true },
      });
      expect(getBankNameByIdSpy).toHaveBeenCalledWith(bankId);
    });
  });
});
