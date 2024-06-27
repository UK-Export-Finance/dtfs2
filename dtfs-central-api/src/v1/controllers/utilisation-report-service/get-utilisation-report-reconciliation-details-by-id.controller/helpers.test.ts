import {
  Currency,
  CurrencyAndAmount,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  PaymentEntity,
  PaymentEntityMockBuilder,
  ReportPeriod,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { getUtilisationReportReconciliationDetails } from './helpers';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { Payment } from '../../../../types/payments';
import { FeeRecord } from '../../../../types/fee-records';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';

const mockFindOneByIdWithFeeRecordsAndPayments = jest.fn();
const mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId = jest.fn();

jest.mock('../../../../repositories/banks-repo');
jest.mock('../../../../repositories/utilisation-reports-repo');

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
  describe('getUtilisationReportReconciliationDetails', () => {
    const reportId = 1;

    const bankId = '123';

    beforeEach(() => {
      UtilisationReportRepo.findOneByIdWithFeeRecordsWithPayments = mockFindOneByIdWithFeeRecordsAndPayments;
      UtilisationReportRepo.findOneByIdWithFeeRecordsFilteredByPartialFacilityId = mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('without filters', () => {
      it("throws an error if the 'dateUploaded' property does not exist", async () => {
        // Arrange
        const notUploadedReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(reportId).withDateUploaded(null).build();
        mockFindOneByIdWithFeeRecordsAndPayments.mockResolvedValue(notUploadedReport);

        // Act / Assert
        await expect(getUtilisationReportReconciliationDetails(reportId, undefined)).rejects.toThrow(
          new Error(`Report with id '${reportId}' has not been uploaded`),
        );
        expect(getBankNameById).not.toHaveBeenCalled();
      });

      it('throws an error if a bank with the same id as the report bankId does not exist', async () => {
        // Arrange
        const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withId(reportId).withBankId(bankId).build();
        mockFindOneByIdWithFeeRecordsAndPayments.mockResolvedValue(uploadedReport);
        jest.mocked(getBankNameById).mockResolvedValue(undefined);

        // Act / Assert
        await expect(getUtilisationReportReconciliationDetails(reportId, undefined)).rejects.toThrow(
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
        mockFindOneByIdWithFeeRecordsAndPayments.mockResolvedValue(uploadedReport);
        jest.mocked(getBankNameById).mockResolvedValue('Different bank');
        when(getBankNameById).calledWith(bankId).mockResolvedValue(bankName);

        // Act
        const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

        // Assert
        expect(mockFindOneByIdWithFeeRecordsAndPayments).toHaveBeenCalledWith(reportId);
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

      describe('when the report has multiple fee records with no attached payments', () => {
        const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

        const currency: Currency = 'GBP';
        const amount = 100;

        const createFeeRecordEntity = (id: number, status: FeeRecordStatus, facilityId: string, exporter: string): FeeRecordEntity =>
          FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(id)
            .withStatus(status)
            .withFacilityId(facilityId)
            .withExporter(exporter)
            .withFeesPaidToUkefForThePeriod(amount)
            .withFeesPaidToUkefForThePeriodCurrency(currency)
            .withPaymentCurrency(currency)
            .build();

        const feeRecordEntities = [
          createFeeRecordEntity(1, 'TO_DO', '12345678', 'Test exporter 1'),
          createFeeRecordEntity(2, 'MATCH', '87654321', 'Test exporter 2'),
          createFeeRecordEntity(3, 'DOES_NOT_MATCH', '10203040', 'Test exporter 3'),
        ];
        uploadedReport.feeRecords = feeRecordEntities;

        beforeEach(() => {
          mockFindOneByIdWithFeeRecordsAndPayments.mockResolvedValue(uploadedReport);
          jest.mocked(getBankNameById).mockResolvedValue('Test bank');
        });

        it('maps the utilisation report fee records to the on object with as many feeRecordPaymentGroups as there are fee records on the report', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          expect(mappedReport.feeRecordPaymentGroups).toHaveLength(feeRecordEntities.length);
        });

        it('sets the feeRecordPaymentGroup status to the status of the fee record at the same index', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          mappedReport.feeRecordPaymentGroups.forEach((group, index) => {
            expect(group.status).toBe(feeRecordEntities[index].status);
          });
        });

        it('sets the feeRecordPaymentGroup feeRecords to the mapped fee record at the same index', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          const feeRecords: FeeRecord[] = feeRecordEntities.map((feeRecord) => ({
            id: feeRecord.id,
            facilityId: feeRecord.facilityId,
            exporter: feeRecord.exporter,
            reportedFees: { currency, amount },
            reportedPayments: { currency, amount },
          }));

          // Assert
          mappedReport.feeRecordPaymentGroups.forEach((group, index) => {
            expect(group.feeRecords).toEqual([feeRecords[index]]);
          });
        });

        it('sets the feeRecordPaymentGroup totalReportedPayments to the same value as the fee record reported payments', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          mappedReport.feeRecordPaymentGroups.forEach((group) => {
            expect(group.totalReportedPayments).toEqual({ currency, amount });
          });
        });

        it('sets the feeRecordPaymentGroup paymentsReceived to null', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          mappedReport.feeRecordPaymentGroups.forEach((group) => {
            expect(group.paymentsReceived).toBeNull();
          });
        });

        it('sets the feeRecordPaymentGroup totalPaymentsReceived to null', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          mappedReport.feeRecordPaymentGroups.forEach((group) => {
            expect(group.totalPaymentsReceived).toBeNull();
          });
        });
      });

      describe('when the report has multiple fee records with the same attached payments', () => {
        const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

        const paymentCurrency: Currency = 'GBP';
        const paymentAmount = 100;

        const payments = [
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(paymentAmount).build(),
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmount(paymentAmount).build(),
        ];
        const totalPaymentsReceivedAmount = paymentAmount * payments.length;

        const feeRecordStatus: FeeRecordStatus = 'DOES_NOT_MATCH';

        const createFeeRecordEntity = (id: number, facilityId: string, exporter: string): FeeRecordEntity =>
          FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(id)
            .withStatus(feeRecordStatus)
            .withFacilityId(facilityId)
            .withExporter(exporter)
            .withFeesPaidToUkefForThePeriod(paymentAmount)
            .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
            .withPaymentCurrency(paymentCurrency)
            .withPayments(payments)
            .build();

        const feeRecordEntities = [
          createFeeRecordEntity(1, '12345678', 'Test exporter 1'),
          createFeeRecordEntity(2, '87654321', 'Test exporter 2'),
          createFeeRecordEntity(3, '10203040', 'Test exporter 3'),
        ];
        uploadedReport.feeRecords = feeRecordEntities;
        const totalReportedPaymentsAmount = paymentAmount * feeRecordEntities.length;

        beforeEach(() => {
          mockFindOneByIdWithFeeRecordsAndPayments.mockResolvedValue(uploadedReport);
          jest.mocked(getBankNameById).mockResolvedValue('Test bank');
        });

        it('maps the utilisation report to an object with only one fee record payment group', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          expect(mappedReport.feeRecordPaymentGroups).toHaveLength(1);
        });

        it('sets the feeRecordPaymentGroups item status to the status of the fee record', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          expect(mappedReport.feeRecordPaymentGroups[0].status).toBe(feeRecordStatus);
        });

        it('sets the feeRecordPaymentGroup feeRecords to the mapped fee record at the same index', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          const feeRecords: FeeRecord[] = feeRecordEntities.map((feeRecord) => ({
            id: feeRecord.id,
            facilityId: feeRecord.facilityId,
            exporter: feeRecord.exporter,
            reportedFees: { currency: paymentCurrency, amount: paymentAmount },
            reportedPayments: { currency: paymentCurrency, amount: paymentAmount },
          }));

          // Assert
          expect(mappedReport.feeRecordPaymentGroups[0].feeRecords).toEqual(feeRecords);
        });

        it('sets the feeRecordPaymentGroup totalReportedPayments to the total of the fee record reported payments', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          expect(mappedReport.feeRecordPaymentGroups[0].totalReportedPayments).toEqual({ amount: totalReportedPaymentsAmount, currency: paymentCurrency });
        });

        it('sets the feeRecordPaymentGroup paymentsReceived to the mapped payments', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          expect(mappedReport.feeRecordPaymentGroups[0].paymentsReceived).toHaveLength(payments.length);
          mappedReport.feeRecordPaymentGroups[0].paymentsReceived!.forEach((paymentsReceivedItem, index) => {
            const expectedPaymentsReceived: Payment = {
              currency: payments[index].currency,
              amount: payments[index].amount,
              id: payments[index].id,
            };
            expect(paymentsReceivedItem).toEqual(expectedPaymentsReceived);
          });
        });

        it('sets the feeRecordPaymentGroup totalPaymentsReceived to the total of the payment amounts', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          expect(mappedReport.feeRecordPaymentGroups[0].totalPaymentsReceived).toEqual({ currency: paymentCurrency, amount: totalPaymentsReceivedAmount });
        });
      });

      describe('when the report has multiple linked fee records and payments', () => {
        const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

        const paymentAmount = 100;

        const feeRecordIdGenerator = idGenerator();
        const paymentIdGenerator = idGenerator();

        const createFeeRecordEntity = (currency: Currency, payments: PaymentEntity[]): FeeRecordEntity =>
          FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(feeRecordIdGenerator.next().value)
            .withStatus('DOES_NOT_MATCH')
            .withFacilityId('12345678')
            .withExporter('Test exporter')
            .withFeesPaidToUkefForThePeriod(paymentAmount)
            .withFeesPaidToUkefForThePeriodCurrency(currency)
            .withPaymentCurrency(currency)
            .withPayments(payments)
            .build();

        const createPaymentEntity = (currency: Currency): PaymentEntity =>
          PaymentEntityMockBuilder.forCurrency(currency).withId(paymentIdGenerator.next().value).withAmount(paymentAmount).build();

        // First group of linked fee records and payments
        const firstPaymentCurrency: Currency = 'EUR';
        const firstPaymentEntities = [createPaymentEntity(firstPaymentCurrency), createPaymentEntity(firstPaymentCurrency)];
        const firstFeeRecordEntities = [
          createFeeRecordEntity(firstPaymentCurrency, firstPaymentEntities),
          createFeeRecordEntity(firstPaymentCurrency, firstPaymentEntities),
          createFeeRecordEntity(firstPaymentCurrency, firstPaymentEntities),
        ];

        // Second group of linked fee records and payments
        const secondPaymentCurrency: Currency = 'GBP';
        const secondPaymentEntities = [createPaymentEntity(secondPaymentCurrency)];
        const secondFeeRecordEntities = [
          createFeeRecordEntity(secondPaymentCurrency, secondPaymentEntities),
          createFeeRecordEntity(secondPaymentCurrency, secondPaymentEntities),
          createFeeRecordEntity(secondPaymentCurrency, secondPaymentEntities),
          createFeeRecordEntity(secondPaymentCurrency, secondPaymentEntities),
        ];

        uploadedReport.feeRecords = [...firstFeeRecordEntities, ...secondFeeRecordEntities];

        beforeEach(() => {
          mockFindOneByIdWithFeeRecordsAndPayments.mockResolvedValue(uploadedReport);
          jest.mocked(getBankNameById).mockResolvedValue('Test bank');
        });

        it('maps the utilisation report to an object containing two groups', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert
          expect(mappedReport.feeRecordPaymentGroups).toHaveLength(2);
        });

        it('maps the report to groups containing the linked fee records and payments', async () => {
          // Act
          const mappedReport = await getUtilisationReportReconciliationDetails(reportId, undefined);

          // Assert - First group
          const firstGroup = mappedReport.feeRecordPaymentGroups[0];

          expect(firstGroup.feeRecords).toHaveLength(firstFeeRecordEntities.length);
          const feeRecordIdsInFirstGroup = firstGroup.feeRecords.map(({ id }) => id);
          firstFeeRecordEntities.forEach(({ id }) => expect(feeRecordIdsInFirstGroup).toContain(id));

          expect(firstGroup.paymentsReceived).toHaveLength(firstPaymentEntities.length);
          firstGroup.paymentsReceived!.forEach(({ currency, id }, index) => {
            expect(currency).toBe(firstPaymentCurrency);
            expect(id).toBe(firstPaymentEntities[index].id);
          });

          // Assert - Second group
          const secondGroup = mappedReport.feeRecordPaymentGroups[1];

          expect(secondGroup.feeRecords).toHaveLength(secondFeeRecordEntities.length);
          const feeRecordIdsInSecondGroup = secondGroup.feeRecords.map(({ id }) => id);
          secondFeeRecordEntities.forEach(({ id }) => expect(feeRecordIdsInSecondGroup).toContain(id));

          expect(secondGroup.paymentsReceived).toHaveLength(secondPaymentEntities.length);
          secondGroup.paymentsReceived!.forEach(({ currency, id }, index) => {
            expect(currency).toBe(secondPaymentCurrency);
            expect(id).toBe(secondPaymentEntities[index].id);
          });
        });

        function* idGenerator(): Generator<number, number, unknown> {
          let id = 1;
          while (true) {
            yield id;
            id += 1;
          }
        }
      });
    });

    describe('with facility id filter', () => {
      it("throws an error if the 'dateUploaded' property does not exist", async () => {
        // Arrange
        const notUploadedReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(reportId).withDateUploaded(null).build();
        mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(notUploadedReport);

        // Act / Assert
        await expect(getUtilisationReportReconciliationDetails(reportId, '1234')).rejects.toThrow(
          new Error(`Report with id '${reportId}' has not been uploaded`),
        );
        expect(getBankNameById).not.toHaveBeenCalled();
      });

      it('throws an error if a bank with the same id as the report bankId does not exist', async () => {
        // Arrange
        const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withId(reportId).withBankId(bankId).build();
        mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);
        jest.mocked(getBankNameById).mockResolvedValue(undefined);

        // Act / Assert
        await expect(getUtilisationReportReconciliationDetails(reportId, '1234')).rejects.toThrow(
          new NotFoundError(`Failed to find a bank with id '${bankId}'`),
        );
        expect(getBankNameById).toHaveBeenCalledWith(bankId);
      });

      it('maps the utilisation report to the report reconciliation details object', async () => {
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
        mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);
        jest.mocked(getBankNameById).mockResolvedValue('Different bank');
        when(getBankNameById).calledWith(bankId).mockResolvedValue(bankName);

        // Act
        const mappedReport = await getUtilisationReportReconciliationDetails(reportId, '1234');

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

      it('fetches the report with the fee records filtered by facility id', async () => {
        const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withFeeRecords([]).build();
        jest.mocked(getBankNameById).mockResolvedValue('bank');
        mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

        // Act
        await getUtilisationReportReconciliationDetails(reportId, '1234');

        // Assert
        expect(mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId).toHaveBeenCalledWith(reportId, '1234');
      });

      it("returns the matching fee records in groups with any other fee records attached to the matching fee records' payments", async () => {
        const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

        // A group of fee records consisting of two fee records and one payment, with only the first fee record being returned as matching the query
        const feeRecordOneWithoutAttachedPayments = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([]).build();
        const feeRecordTwoWithoutAttachedPayments = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(2).withPayments([]).build();
        const paymentOne = PaymentEntityMockBuilder.forCurrency('GBP')
          .withId(1)
          .withFeeRecords([feeRecordOneWithoutAttachedPayments, feeRecordTwoWithoutAttachedPayments])
          .build();
        const paymentTwo = PaymentEntityMockBuilder.forCurrency('GBP')
          .withId(2)
          .withFeeRecords([feeRecordOneWithoutAttachedPayments, feeRecordTwoWithoutAttachedPayments])
          .build();
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([paymentOne, paymentTwo]).build();

        // A group of fee records consisting of one fee record and one payment
        const feeRecordThreeWithoutAttachedPayments = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(3).withPayments([]).build();
        const paymentThree = PaymentEntityMockBuilder.forCurrency('GBP').withId(2).withFeeRecords([feeRecordThreeWithoutAttachedPayments]).build();
        const feeRecordThree = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(3).withPayments([paymentThree]).build();

        // A fee record with no payments
        const feeRecordFour = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(4).withPayments([]).build();

        uploadedReport.feeRecords = [feeRecordOne, feeRecordThree, feeRecordFour];

        jest.mocked(getBankNameById).mockResolvedValue('bank');
        mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

        // Act
        const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

        // Assert
        expect(result.feeRecordPaymentGroups).toHaveLength(3);
        const groupContainingFeeRecordOne = result.feeRecordPaymentGroups.filter((group) => group.feeRecords.some((feeRecord) => feeRecord.id === 1))[0];
        const groupContainingFeeRecordTwo = result.feeRecordPaymentGroups.filter((group) => group.feeRecords.some((feeRecord) => feeRecord.id === 3))[0];
        const groupContainingFeeRecordThree = result.feeRecordPaymentGroups.filter((group) => group.feeRecords.some((feeRecord) => feeRecord.id === 4))[0];
        expect(groupContainingFeeRecordOne.feeRecords).toHaveLength(2);
        expect(groupContainingFeeRecordOne.feeRecords[0].id).toEqual(1);
        expect(groupContainingFeeRecordOne.feeRecords[1].id).toEqual(2);
        expect(groupContainingFeeRecordTwo.feeRecords).toHaveLength(1);
        expect(groupContainingFeeRecordTwo.feeRecords[0].id).toEqual(3);
        expect(groupContainingFeeRecordThree.feeRecords).toHaveLength(1);
        expect(groupContainingFeeRecordThree.feeRecords[0].id).toEqual(4);
      });

      describe('for a fee records without any payments', () => {
        it('maps the fee record to the fee records array', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          const feeRecordWithNoAttAttachedPayments = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withPayments([])
            .withId(1)
            .withFacilityId('1234')
            .withExporter('Export!')
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency('GBP')
            .withPaymentCurrency('GBP')
            .build();

          uploadedReport.feeRecords = [feeRecordWithNoAttAttachedPayments];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          expect(result.feeRecordPaymentGroups[0].feeRecords).toEqual<FeeRecord[]>([
            {
              id: 1,
              facilityId: '1234',
              exporter: 'Export!',
              reportedFees: { currency: 'GBP', amount: 100 },
              reportedPayments: { currency: 'GBP', amount: 100 },
            },
          ]);
        });

        it('converts the fees paid into the payment currency when different from the fees paid currency', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          const feeRecordWithNoAttAttachedPayments = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withPayments([])
            .withId(1)
            .withFacilityId('1234')
            .withExporter('Export!')
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency('GBP')
            .withPaymentCurrency('EUR')
            .withPaymentExchangeRate(2)
            .build();

          uploadedReport.feeRecords = [feeRecordWithNoAttAttachedPayments];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          // 50 = 100 / 2
          expect(result.feeRecordPaymentGroups[0].feeRecords[0].reportedPayments).toEqual({ currency: 'EUR', amount: 50 });
        });

        it('sets payments received and total payments received to null', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          const feeRecordWithNoAttAttachedPayments = FeeRecordEntityMockBuilder.forReport(uploadedReport).withPayments([]).build();

          uploadedReport.feeRecords = [feeRecordWithNoAttAttachedPayments];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          expect(result.feeRecordPaymentGroups[0].paymentsReceived).toBeNull();
          expect(result.feeRecordPaymentGroups[0].totalPaymentsReceived).toBeNull();
        });

        it("sets total reported payments to the fee record's reported payments", async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          const feeRecordWithNoAttAttachedPayments = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withPayments([])
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency('GBP')
            .withPaymentCurrency('EUR')
            .withPaymentExchangeRate(2)
            .build();

          uploadedReport.feeRecords = [feeRecordWithNoAttAttachedPayments];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          // 50 = 100 / 2
          expect(result.feeRecordPaymentGroups[0].totalReportedPayments).toEqual({ currency: 'EUR', amount: 50 });
        });

        it('sets the status to the fee record status', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          const feeRecordWithNoAttAttachedPayments = FeeRecordEntityMockBuilder.forReport(uploadedReport).withPayments([]).withStatus('TO_DO').build();

          uploadedReport.feeRecords = [feeRecordWithNoAttAttachedPayments];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          expect(result.feeRecordPaymentGroups[0].status).toEqual<FeeRecordStatus>('TO_DO');
        });
      });

      describe('for a fee record with payments', () => {
        it('maps the fee records attached to the attached payments to the fee records array', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          // A group of fee records consisting of two fee records and one payment, with only the first fee record being returned as matching the query
          const feeRecordOneAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(1)
            .withPayments([])
            .withFacilityId('1234')
            .withExporter('Exporter 1')
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency('GBP')
            .withPaymentCurrency('GBP')
            .build();
          const feeRecordTwoAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(2)
            .withPayments([])
            .withFacilityId('5678')
            .withExporter('Exporter 2')
            .withFeesPaidToUkefForThePeriod(200)
            .withFeesPaidToUkefForThePeriodCurrency('GBP')
            .withPaymentCurrency('GBP')
            .build();
          const paymentOne = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(1)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .build();
          const paymentTwo = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(2)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .build();
          const feeRecordOne = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([paymentOne, paymentTwo]).build();

          uploadedReport.feeRecords = [feeRecordOne];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          const feeRecordOneMapped = result.feeRecordPaymentGroups[0].feeRecords.find((record) => record.id === 1);
          const feeRecordTwoMapped = result.feeRecordPaymentGroups[0].feeRecords.find((record) => record.id === 2);
          expect(feeRecordOneMapped).toEqual<FeeRecord>({
            id: 1,
            facilityId: '1234',
            exporter: 'Exporter 1',
            reportedFees: { currency: 'GBP', amount: 100 },
            reportedPayments: { currency: 'GBP', amount: 100 },
          });
          expect(feeRecordTwoMapped).toEqual<FeeRecord>({
            id: 2,
            facilityId: '5678',
            exporter: 'Exporter 2',
            reportedFees: { currency: 'GBP', amount: 200 },
            reportedPayments: { currency: 'GBP', amount: 200 },
          });
        });

        it('converts the fees paid into the payment currency when different from the fees paid currency', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          // A group of fee records consisting of two fee records and one payment, with only the first fee record being returned as matching the query
          const feeRecordOneAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(1)
            .withPayments([])
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency('EUR')
            .withPaymentCurrency('GBP')
            .withPaymentExchangeRate(2)
            .build();
          const feeRecordTwoAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(2)
            .withPayments([])
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency('JPY')
            .withPaymentCurrency('GBP')
            .withPaymentExchangeRate(0.5)
            .build();
          const paymentOne = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(1)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .build();
          const paymentTwo = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(2)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .build();
          const feeRecordOne = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([paymentOne, paymentTwo]).build();

          uploadedReport.feeRecords = [feeRecordOne];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          const feeRecordOneMapped = result.feeRecordPaymentGroups[0].feeRecords.find((record) => record.id === 1);
          const feeRecordTwoMapped = result.feeRecordPaymentGroups[0].feeRecords.find((record) => record.id === 2);
          // 50 = 100 / 2
          expect(feeRecordOneMapped?.reportedPayments).toEqual<CurrencyAndAmount>({ currency: 'GBP', amount: 50 });
          // 200 = 100 / 0.5
          expect(feeRecordTwoMapped?.reportedPayments).toEqual<CurrencyAndAmount>({ currency: 'GBP', amount: 200 });
        });

        it('maps the payments to payments received', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          // A group of fee records consisting of two fee records and one payment, with only the first fee record being returned as matching the query
          const feeRecordOneAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([]).build();
          const feeRecordTwoAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(2).withPayments([]).build();
          const paymentOne = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(1)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .withAmount(100)
            .build();
          const paymentTwo = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(2)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .withAmount(200)
            .build();
          const feeRecordOne = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([paymentOne, paymentTwo]).build();

          uploadedReport.feeRecords = [feeRecordOne];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          const paymentOneMapped = result.feeRecordPaymentGroups[0].paymentsReceived?.find((payment) => payment.id === 1);
          const paymentTwoMapped = result.feeRecordPaymentGroups[0].paymentsReceived?.find((payment) => payment.id === 2);
          expect(paymentOneMapped).toEqual<Payment>({ currency: 'GBP', amount: 100, id: 1 });
          expect(paymentTwoMapped).toEqual<Payment>({ currency: 'GBP', amount: 200, id: 2 });
        });

        it('sets total payments received to the sum of all the payments attached to the fee record', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          // A group of fee records consisting of two fee records and one payment, with only the first fee record being returned as matching the query
          const feeRecordOneAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([]).build();
          const feeRecordTwoAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(2).withPayments([]).build();
          const paymentOne = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(1)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .withAmount(100)
            .build();
          const paymentTwo = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(2)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .withAmount(200)
            .build();
          const feeRecordOne = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([paymentOne, paymentTwo]).build();

          uploadedReport.feeRecords = [feeRecordOne];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          // 300 = 100 + 200
          expect(result.feeRecordPaymentGroups[0].totalPaymentsReceived).toEqual({ currency: 'GBP', amount: 300 });
        });

        it('sets total reported payments to the sum of all the fee records reported payments', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          // A group of fee records consisting of two fee records and one payment, with only the first fee record being returned as matching the query
          const feeRecordOneAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(1)
            .withPayments([])
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency('EUR')
            .withPaymentCurrency('GBP')
            .withPaymentExchangeRate(2)
            .build();
          const feeRecordTwoAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(2)
            .withPayments([])
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency('JPY')
            .withPaymentCurrency('GBP')
            .withPaymentExchangeRate(0.5)
            .build();
          const paymentOne = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(1)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .build();
          const paymentTwo = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(2)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .build();
          const feeRecordOne = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([paymentOne, paymentTwo]).build();

          uploadedReport.feeRecords = [feeRecordOne];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          // 250 = 100 / 2 + 100 / 0.5
          expect(result.feeRecordPaymentGroups[0].totalReportedPayments).toEqual<CurrencyAndAmount>({ currency: 'GBP', amount: 250 });
        });

        it('sets the status to the status of the fee records attached to the attached payments', async () => {
          const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

          // A group of fee records consisting of two fee records and one payment, with only the first fee record being returned as matching the query
          const feeRecordOneAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(1)
            .withPayments([])
            .withStatus('DOES_NOT_MATCH')
            .build();
          const feeRecordTwoAttachedToPayment = FeeRecordEntityMockBuilder.forReport(uploadedReport)
            .withId(2)
            .withPayments([])
            .withStatus('DOES_NOT_MATCH')
            .build();
          const paymentOne = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(1)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .build();
          const paymentTwo = PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(2)
            .withFeeRecords([feeRecordOneAttachedToPayment, feeRecordTwoAttachedToPayment])
            .build();
          const feeRecordOne = FeeRecordEntityMockBuilder.forReport(uploadedReport).withId(1).withPayments([paymentOne, paymentTwo]).build();

          uploadedReport.feeRecords = [feeRecordOne];

          jest.mocked(getBankNameById).mockResolvedValue('bank');
          mockFindOneByIdWithFeeRecordsFilteredByPartialFacilityId.mockResolvedValue(uploadedReport);

          // Act
          const result = await getUtilisationReportReconciliationDetails(reportId, '1234');

          // Assert
          // 250 = 100 / 2 + 100 / 0.5
          expect(result.feeRecordPaymentGroups[0].status).toEqual<FeeRecordStatus>('DOES_NOT_MATCH');
        });
      });
    });
  });
});
