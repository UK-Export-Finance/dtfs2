import {
  CurrencyAndAmount,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  PaymentEntityMockBuilder,
  ReportPeriod,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { mapUtilisationReportEntityToReconciliationDetails } from './helpers';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { FeeRecordItem, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';

jest.mock('../../../../repositories/banks-repo');

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
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
      when(getBankNameById).calledWith(bankId).mockResolvedValue(bankName);

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
        feeRecordPaymentGroups: [],
      });
    });

    describe('when the report has a single fee record with no attached payments', () => {
      const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

      const feeRecordId = 1;
      const feeRecordStatus: FeeRecordStatus = 'TO_DO';
      const feeRecordFacilityId = '12345678';
      const feeRecordExporter = 'Test exporter';

      const feeRecordReportedFees: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 100,
      };

      const feeRecordTotalReportedPayments: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 100,
      };

      const feeRecord = FeeRecordEntityMockBuilder.forReport(uploadedReport)
        .withId(feeRecordId)
        .withStatus(feeRecordStatus)
        .withFacilityId(feeRecordFacilityId)
        .withExporter(feeRecordExporter)
        .withFeesPaidToUkefForThePeriod(feeRecordReportedFees.amount)
        .withFeesPaidToUkefForThePeriodCurrency(feeRecordReportedFees.currency)
        .withPaymentCurrency(feeRecordReportedFees.currency)
        .build();
      uploadedReport.feeRecords = [feeRecord];

      beforeEach(() => {
        when(getBankNameById).calledWith(bankId).mockResolvedValue('Test bank');
      });

      it('maps the utilisation report fee records to the feeRecordPaymentGroups array with length 1', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups).toHaveLength(1);
      });

      it('sets the feeRecordPaymentGroups item status to the status of the fee record', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].status).toBe(feeRecordStatus);
      });

      it('sets the feeRecordPaymentGroups item feeRecordItems to the mapped fee record', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].feeRecords).toEqual<FeeRecordItem[]>([
          {
            id: feeRecordId,
            facilityId: feeRecordFacilityId,
            exporter: feeRecordExporter,
            reportedFees: feeRecordReportedFees,
            reportedPayments: feeRecordReportedFees,
          },
        ]);
      });

      it('sets the feeRecordPaymentGroups item totalReportedPayments to the total reported fees', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].totalReportedPayments).toEqual(feeRecordTotalReportedPayments);
      });

      it('sets the feeRecordPaymentGroups item paymentsReceived to null', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].paymentsReceived).toBeNull();
      });

      it('sets the feeRecordPaymentGroups item totalPaymentsReceived to null', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].totalPaymentsReceived).toBeNull();
      });
    });

    describe('when the report has a single fee record with one attached payment', () => {
      const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

      const feeRecordId = 1;
      const feeRecordStatus: FeeRecordStatus = 'TO_DO';
      const feeRecordFacilityId = '12345678';
      const feeRecordExporter = 'Test exporter';

      const feeRecordReportedFees: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 100,
      };

      const feeRecordTotalReportedPayments: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 100,
      };

      const paymentsReceived: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 100,
      };

      const totalPaymentsReceived: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 100,
      };

      const payment = PaymentEntityMockBuilder.forCurrency(paymentsReceived.currency).withAmount(paymentsReceived.amount).build();

      const feeRecord = FeeRecordEntityMockBuilder.forReport(uploadedReport)
        .withId(feeRecordId)
        .withStatus(feeRecordStatus)
        .withFacilityId(feeRecordFacilityId)
        .withExporter(feeRecordExporter)
        .withFeesPaidToUkefForThePeriod(feeRecordReportedFees.amount)
        .withFeesPaidToUkefForThePeriodCurrency(feeRecordReportedFees.currency)
        .withPaymentCurrency(feeRecordReportedFees.currency)
        .withPayments([payment])
        .build();
      uploadedReport.feeRecords = [feeRecord];

      beforeEach(() => {
        when(getBankNameById).calledWith(bankId).mockResolvedValue('Test bank');
      });

      it('maps the utilisation report fee records to the feeRecordPaymentGroups array with length 1', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups).toHaveLength(1);
      });

      it('sets the feeRecordPaymentGroups item status to the status of the fee record', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].status).toBe(feeRecordStatus);
      });

      it('sets the feeRecordPaymentGroups item feeRecordItems to the mapped fee record', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].feeRecords).toEqual<FeeRecordItem[]>([
          {
            id: feeRecordId,
            facilityId: feeRecordFacilityId,
            exporter: feeRecordExporter,
            reportedFees: feeRecordReportedFees,
            reportedPayments: feeRecordReportedFees,
          },
        ]);
      });

      it('sets the feeRecordPaymentGroups item totalReportedPayments to the total reported fees', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].totalReportedPayments).toEqual(feeRecordTotalReportedPayments);
      });

      it('sets the feeRecordPaymentGroups item paymentsReceived to the mapped payment', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].paymentsReceived).toEqual<CurrencyAndAmount[]>([paymentsReceived]);
      });

      it('sets the feeRecordPaymentGroups item totalPaymentsReceived to the total payment amount', async () => {
        // Act
        const mappedReport = await mapUtilisationReportEntityToReconciliationDetails(uploadedReport);

        // Assert
        expect(mappedReport.feeRecordPaymentGroups[0].totalPaymentsReceived).toEqual(totalPaymentsReceived);
      });
    });
  });
});
