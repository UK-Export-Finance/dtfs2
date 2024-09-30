import { ReportPeriod, UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { NotFoundError } from '../../../../../errors';
import { getFeeRecordPaymentEntityGroups } from '../../../../../helpers';
import { getBankNameById } from '../../../../../repositories/banks-repo';
import { UtilisationReportReconciliationDetails, ValidatedPaymentDetailsFilters } from '../../../../../types/utilisation-reports';
import * as filterFeeRecordsModule from './filter-fee-record-payment-entity-groups';
import { getKeyingSheetForReportId } from './get-keying-sheet-for-report-id';
import { getUtilisationReportReconciliationDetails } from './get-utilisation-report-reconciliation-details';
import { mapToFeeRecordPaymentGroups } from './map-to-fee-record-payment-groups';

console.error = jest.fn();

jest.mock('../../../../../repositories/banks-repo');
jest.mock('../../../../../helpers');
jest.mock('./get-keying-sheet-for-report-id');
jest.mock('./map-to-fee-record-payment-groups');

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
  describe('getUtilisationReportReconciliationDetails', () => {
    const reportId = 1;

    const bankId = '123';

    beforeEach(() => {
      jest.resetAllMocks();
      jest.mocked(getBankNameById).mockRejectedValue('Some error');
      jest.mocked(getKeyingSheetForReportId).mockRejectedValue('Some error');
      jest.mocked(getFeeRecordPaymentEntityGroups).mockImplementation(() => {
        throw new Error('Some error');
      });
      jest.mocked(mapToFeeRecordPaymentGroups).mockRejectedValue('Some error');

      when(getKeyingSheetForReportId).calledWith(reportId, []).mockResolvedValue([]);
      when(getFeeRecordPaymentEntityGroups).calledWith([]).mockReturnValue([]);
      when(mapToFeeRecordPaymentGroups).calledWith([]).mockResolvedValue([]);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it.each(Object.values(UTILISATION_REPORT_RECONCILIATION_STATUS))(
      "throws an error if the report status is '%s' and the 'dateUploaded' property is null",
      async (status) => {
        // Arrange
        const report = UtilisationReportEntityMockBuilder.forStatus(status).withId(reportId).withDateUploaded(null).build();
        const paymentDetailsFilters = {};
        const premiumPaymentsFilters = {};

        // Act / Assert
        await expect(getUtilisationReportReconciliationDetails(report, paymentDetailsFilters, premiumPaymentsFilters)).rejects.toThrow(
          new Error(`Report with id '${reportId}' has not been uploaded`),
        );
        expect(getBankNameById).not.toHaveBeenCalled();
      },
    );

    it('throws an error if a bank with the same id as the report bankId does not exist', async () => {
      // Arrange
      const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withId(reportId).withBankId(bankId).build();

      const paymentDetailsFilters = {};
      const premiumPaymentsFilters = {};

      when(getBankNameById).calledWith(bankId).mockResolvedValue(undefined);

      // Act / Assert
      await expect(getUtilisationReportReconciliationDetails(uploadedReport, paymentDetailsFilters, premiumPaymentsFilters)).rejects.toThrow(
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

      const paymentDetailsFilters = {};
      const premiumPaymentsFilters = {};

      const bankName = 'Test bank';
      when(getBankNameById).calledWith(bankId).mockResolvedValue(bankName);

      // Act
      const mappedReport = await getUtilisationReportReconciliationDetails(uploadedReport, paymentDetailsFilters, premiumPaymentsFilters);

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
        premiumPayments: [],
        paymentDetails: [],
        keyingSheet: [],
      });
    });

    describe('premium payment tab filtering', () => {
      const filterFeeRecordSpy = jest.spyOn(filterFeeRecordsModule, 'filterFeeRecordPaymentEntityGroupsByPremiumPaymentsFilters');

      const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withId(reportId)
        .withBankId(bankId)
        .withDateUploaded(new Date())
        .withFeeRecords([])
        .build();

      it('filters the fee record payment groups by the facility id when the facility id is a string', async () => {
        // Arrange
        filterFeeRecordSpy.mockReturnValue([]);

        const bankName = 'Test bank';
        when(getBankNameById).calledWith(bankId).mockResolvedValue(bankName);

        const paymentDetailsFilters = {};
        const facilityId = 'some filter';
        const premiumPaymentsFilters = {
          facilityId,
        };

        // Act
        await getUtilisationReportReconciliationDetails(uploadedReport, paymentDetailsFilters, premiumPaymentsFilters);

        // Assert
        expect(filterFeeRecordSpy).toHaveBeenCalledWith([], premiumPaymentsFilters);
      });

      it('does not filter the fee record payment groups when no premium payments filters are defined', async () => {
        // Arrange
        const bankName = 'Test bank';
        when(getBankNameById).calledWith(bankId).mockResolvedValue(bankName);

        const paymentDetailsFilters = {};
        const premiumPaymentsFilters = {};

        // Act
        await getUtilisationReportReconciliationDetails(uploadedReport, paymentDetailsFilters, premiumPaymentsFilters);

        // Assert
        expect(filterFeeRecordSpy).not.toHaveBeenCalled();
      });
    });

    describe('payment details tab filtering', () => {
      const filterFeeRecordSpy = jest.spyOn(filterFeeRecordsModule, 'filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters');

      const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withId(reportId)
        .withBankId(bankId)
        .withDateUploaded(new Date())
        .withFeeRecords([])
        .build();

      it.each([
        { filter: 'facilityId', description: 'facility ID' },
        { filter: 'paymentCurrency', description: 'payment currency' },
        { filter: 'paymentReference', description: 'payment reference' },
      ])('filters the fee record payment groups by the $description filter when it is the only filter defined', async ({ filter }) => {
        // Arrange
        filterFeeRecordSpy.mockReturnValue([]);

        const bankName = 'Test bank';
        when(getBankNameById).calledWith(bankId).mockResolvedValue(bankName);

        const paymentDetailsFilters = {
          [filter]: 'some filter',
        };
        const premiumPaymentsFilters = {};

        // Act
        await getUtilisationReportReconciliationDetails(uploadedReport, paymentDetailsFilters, premiumPaymentsFilters);

        // Assert
        expect(filterFeeRecordSpy).toHaveBeenCalledWith([], paymentDetailsFilters);
      });

      it('filters the fee record payment groups when multiple payment details filters are defined', async () => {
        // Arrange
        filterFeeRecordSpy.mockReturnValue([]);

        const bankName = 'Test bank';
        when(getBankNameById).calledWith(bankId).mockResolvedValue(bankName);

        const paymentDetailsFilters: ValidatedPaymentDetailsFilters = {
          facilityId: '12345678',
          paymentCurrency: 'GBP',
          paymentReference: 'REF123',
        };
        const premiumPaymentsFilters = {};

        // Act
        await getUtilisationReportReconciliationDetails(uploadedReport, paymentDetailsFilters, premiumPaymentsFilters);

        // Assert
        expect(filterFeeRecordSpy).toHaveBeenCalledWith([], paymentDetailsFilters);
      });

      it('does not filter the fee record payment groups when no payment details filters are defined', async () => {
        // Arrange
        const bankName = 'Test bank';
        when(getBankNameById).calledWith(bankId).mockResolvedValue(bankName);

        const paymentDetailsFilters = {};
        const premiumPaymentsFilters = {};

        // Act
        await getUtilisationReportReconciliationDetails(uploadedReport, paymentDetailsFilters, premiumPaymentsFilters);

        // Assert
        expect(filterFeeRecordSpy).not.toHaveBeenCalled();
      });
    });
  });
});
