import { Currency, FeeRecordEntityMockBuilder, ReportPeriod, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapFeeRecordEntityToReconciliationDetailsFeeRecordItem, mapUtilisationReportEntityToReconciliationDetails } from './helpers';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { FeeRecordItem, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';

jest.mock('../../../../repositories/banks-repo');

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
  describe('mapFeeRecordEntityToReconciliationDetailsFeeRecordItem', () => {
    const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    it('maps the fee record entity to the reconciliation details fee record item when the currencies match', () => {
      // Arrange
      const facilityId = '12345678';
      const exporter = 'Test exporter';
      const feesPaidToUkefForThePeriodCurrency: Currency = 'GBP';
      const feesPaidToUkefForThePeriod = 100.0;
      const paymentCurrency: Currency = 'GBP';

      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(uploadedReport)
        .withFacilityId(facilityId)
        .withExporter(exporter)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .withPaymentCurrency(paymentCurrency)
        .build();

      // Act
      const feeRecordItem = mapFeeRecordEntityToReconciliationDetailsFeeRecordItem(feeRecordEntity);

      // Assert
      expect(feeRecordItem).toEqual<FeeRecordItem>({
        facilityId,
        exporter,
        reportedFees: {
          currency: feesPaidToUkefForThePeriodCurrency,
          amount: feesPaidToUkefForThePeriod,
        },
        reportedPayments: {
          currency: paymentCurrency,
          amount: feesPaidToUkefForThePeriod,
        },
        totalReportedPayments: {
          currency: paymentCurrency,
          amount: feesPaidToUkefForThePeriod,
        },
        paymentsReceived: null,
        totalPaymentsReceived: null,
        status: 'TO_DO',
      });
    });

    it('maps the fee record entity to the reconciliation details fee record item when the currencies do not match', () => {
      // Arrange
      const facilityId = '12345678';
      const exporter = 'Test exporter';
      const feesPaidToUkefForThePeriodCurrency: Currency = 'EUR';
      const feesPaidToUkefForThePeriod = 100.0;
      const paymentCurrency: Currency = 'GBP';
      const paymentExchangeRate = 1.1;

      const feesPaidToUkefForThePeriodInPaymentCurrency = 90.91;

      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(uploadedReport)
        .withFacilityId(facilityId)
        .withExporter(exporter)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .withPaymentCurrency(paymentCurrency)
        .withPaymentExchangeRate(paymentExchangeRate)
        .build();

      // Act
      const feeRecordItem = mapFeeRecordEntityToReconciliationDetailsFeeRecordItem(feeRecordEntity);

      // Assert
      expect(feeRecordItem).toEqual<FeeRecordItem>({
        facilityId,
        exporter,
        reportedFees: {
          currency: feesPaidToUkefForThePeriodCurrency,
          amount: feesPaidToUkefForThePeriod,
        },
        reportedPayments: {
          currency: paymentCurrency,
          amount: feesPaidToUkefForThePeriodInPaymentCurrency,
        },
        totalReportedPayments: {
          currency: paymentCurrency,
          amount: feesPaidToUkefForThePeriodInPaymentCurrency,
        },
        paymentsReceived: null,
        totalPaymentsReceived: null,
        status: 'TO_DO',
      });
    });
  });

  describe('mapUtilisationReportEntityToReconciliationDetails', () => {
    const reportId = 1;

    const bankId = '123';

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("throws an error if the 'dateUploaded' property does not exist", async () => {
      // Arrange
      const notUploadedReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(reportId).withDateUploaded(null).build();

      // Act / Assert
      await expect(mapUtilisationReportEntityToReconciliationDetails(notUploadedReport)).rejects.toThrow(
        new Error(`Report with id '${reportId}' has not been uploaded`),
      );
      expect(getBankNameById).not.toHaveBeenCalled();
    });

    it('throws an error if a bank with the same id as the report bankId does not exist', async () => {
      // Arrange
      const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withId(reportId).withBankId(bankId).build();

      jest.mocked(getBankNameById).mockResolvedValue(undefined);

      // Act / Assert
      await expect(mapUtilisationReportEntityToReconciliationDetails(uploadedReport)).rejects.toThrow(
        new NotFoundError(`Failed to find a bank with id '${bankId}'`),
      );
      expect(getBankNameById).toHaveBeenCalledWith(bankId);
    });

    it('maps the utilisation report to the report reconciliation details object', async () => {
      // Arrange
      const reportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };
      const dateUploaded = new Date();
      const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withId(reportId)
        .withBankId(bankId)
        .withReportPeriod(reportPeriod)
        .withDateUploaded(dateUploaded)
        .withFeeRecords([])
        .build();

      const bankName = 'Test bank';
      jest.mocked(getBankNameById).mockResolvedValue(bankName);

      // Act
      const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

      // Assert
      expect(getBankNameById).toHaveBeenCalledWith(bankId);
      expect(mappedReport).toEqual<UtilisationReportReconciliationDetails>({
        reportId,
        bank: {
          id: bankId,
          name: bankName,
        },
        status: 'PENDING_RECONCILIATION',
        reportPeriod,
        dateUploaded,
        feeRecords: [],
      });
    });
  });
});
