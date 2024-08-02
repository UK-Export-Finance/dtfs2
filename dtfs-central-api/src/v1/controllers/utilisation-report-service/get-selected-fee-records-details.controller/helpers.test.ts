import {
  CurrencyAndAmount,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  SelectedFeeRecordsPaymentDetails,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { canFeeRecordsBeAddedToExistingPayment, getAvailablePaymentGroups, mapToSelectedFeeRecordDetails } from './helpers';
import { aReportPeriod } from '../../../../../test-helpers/test-data/report-period';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { FeeRecordPaymentGroup } from '../../../../types/utilisation-reports';
import { Payment } from '../../../../types/payments';
import { FeeRecord } from '../../../../types/fee-records';

jest.mock('../../../../repositories/banks-repo');

describe('get selected fee record details controller helpers', () => {
  const BANK_NAME = 'Test bank';
  beforeEach(() => {
    jest.mocked(getBankNameById).mockResolvedValue(BANK_NAME);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('mapToSelectedFeeRecordDetails', () => {
    it('sets bank name', async () => {
      // Act
      const bankId = '123';
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [aFeeRecordWithStatusToDo()], false);

      // Assert
      expect(result.bank).toEqual({ name: BANK_NAME });
    });

    it('maps report period', async () => {
      // Arrange
      const bankId = '123';
      const reportPeriod = aReportPeriod();

      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, reportPeriod, [aFeeRecordWithStatusToDo()], false);

      // Assert
      expect(result.reportPeriod).toEqual(reportPeriod);
    });

    it('maps the fee record facilityId, id and exporter', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withExporter('Test company')
        .withFacilityId('00012345')
        .withId(2)
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecord], false);

      // Assert
      expect(result.feeRecords[0]).toEqual(expect.objectContaining({ id: 2, facilityId: '00012345', exporter: 'Test company' }));
    });

    it('maps the fees paid to ukef for period to reported payment with no conversion when payment currency matches fees paid to ukef for the period currency', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(200)
        .withFeesPaidToUkefForThePeriodCurrency('USD')
        .withPaymentCurrency('USD')
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecord], false);

      // Assert
      expect(result.feeRecords[0].reportedPayments).toEqual<CurrencyAndAmount>({ amount: 200, currency: 'USD' });
    });

    it('sets the reported payment to the fees paid to ukef for the period converted into the payment currency when the payment currency does not match the fees paid to ukef for the period currency', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency('GBP')
        .withPaymentExchangeRate(1.1)
        .build();

      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecord], false);

      // Assert
      expect(result.feeRecords[0].reportedPayments).toEqual<CurrencyAndAmount>({ amount: 2000, currency: 'GBP' });
    });

    it('maps the fees paid to ukef for the period to the reported fee', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecord], false);

      // Assert
      expect(result.feeRecords[0].reportedFee).toEqual<CurrencyAndAmount>({ amount: 2200, currency: 'EUR' });
    });

    it('maps fee record payments removing any duplicates', async () => {
      // Arrange
      const bankId = '123';
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const firstPaymentEntity = PaymentEntityMockBuilder.forCurrency('GBP')
        .withDateReceived(new Date('2022-01-01'))
        .withAmount(100)
        .withReference('First payment')
        .build();
      const secondPaymentEntity = PaymentEntityMockBuilder.forCurrency('GBP')
        .withDateReceived(new Date('2022-02-02'))
        .withAmount(200)
        .withReference('Second payment')
        .build();
      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withPaymentCurrency('GBP')
        .withPayments([firstPaymentEntity, secondPaymentEntity])
        .build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withPaymentCurrency('GBP')
        .withPayments([firstPaymentEntity, secondPaymentEntity])
        .build();

      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [firstFeeRecord, secondFeeRecord], false);

      // Assert
      expect(result.payments).toEqual<SelectedFeeRecordsPaymentDetails[]>([
        { currency: 'GBP', amount: 100, dateReceived: new Date('2022-01-01'), reference: 'First payment' },
        { currency: 'GBP', amount: 200, dateReceived: new Date('2022-02-02'), reference: 'Second payment' },
      ]);
    });

    it('sets payments to empty array when fee records have no attached payments', async () => {
      // Arrange
      const bankId = '123';
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency('GBP').withPayments([]).build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency('GBP').withPayments([]).build();

      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [firstFeeRecord, secondFeeRecord], false);

      // Assert
      expect(result.payments).toEqual([]);
    });

    it('calculates total reported payments in payment currency by adding up reported payments of all fee records', async () => {
      // Arrange
      const bankId = '123';
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecordWithDifferingCurrencies = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency('GBP')
        .withPaymentExchangeRate(1.1)
        .build();
      const feeRecordWithMatchingCurrencies = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withFeesPaidToUkefForThePeriod(1000)
        .withFeesPaidToUkefForThePeriodCurrency('GBP')
        .withPaymentCurrency('GBP')
        .build();

      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecordWithDifferingCurrencies, feeRecordWithMatchingCurrencies], false);

      // Assert
      expect(result.totalReportedPayments).toEqual<CurrencyAndAmount>({ amount: 3000, currency: 'GBP' });
    });

    it('maps can add to existing payment flag', async () => {
      // Arrange
      const bankId = '123';
      const canAddToExistingPayment = true;

      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [aFeeRecordWithStatusToDo()], canAddToExistingPayment);

      // Assert
      expect(result.canAddToExistingPayment).toEqual(canAddToExistingPayment);
    });

    describe('when availablePaymentGroups is defined', () => {
      it('returns an object containing the mapped available fee record payment groups', async () => {
        // Arrange
        const bankId = '123';
        const canAddToExistingPayment = true;

        const firstPaymentsReceived: Payment[] = [
          { ...aPayment(), id: 1, amount: 100 },
          { ...aPayment(), id: 2, amount: 25 },
        ];
        const secondPaymentsReceived: Payment[] = [{ ...aPayment(), id: 3, amount: 25 }];

        const firstFeeRecords: FeeRecord[] = [
          { ...aFeeRecordWithReportedPaymentAmount(100), id: 1 },
          { ...aFeeRecordWithReportedPaymentAmount(25), id: 2 },
        ];
        const secondFeeRecords: FeeRecord[] = [{ ...aFeeRecordWithReportedPaymentAmount(25), id: 3 }];

        const availablePaymentGroups: FeeRecordPaymentGroup[] = [
          {
            feeRecords: firstFeeRecords,
            totalReportedPayments: { amount: 100, currency: 'GBP' },
            paymentsReceived: firstPaymentsReceived,
            totalPaymentsReceived: { amount: 125, currency: 'GBP' },
            status: 'DOES_NOT_MATCH',
          },
          {
            feeRecords: secondFeeRecords,
            totalReportedPayments: { amount: 50, currency: 'GBP' },
            paymentsReceived: secondPaymentsReceived,
            totalPaymentsReceived: { amount: 25, currency: 'GBP' },
            status: 'DOES_NOT_MATCH',
          },
        ];

        // Act
        const result = await mapToSelectedFeeRecordDetails(
          bankId,
          aReportPeriod(),
          [aFeeRecordWithStatusToDo()],
          canAddToExistingPayment,
          availablePaymentGroups,
        );

        // Assert
        expect(result.availablePaymentGroups).toEqual([
          [
            { amount: 100, currency: 'GBP', id: 1, reference: 'A payment reference' },
            { amount: 25, currency: 'GBP', id: 2, reference: 'A payment reference' },
          ],
          [{ amount: 25, currency: 'GBP', id: 3, reference: 'A payment reference' }],
        ]);
      });

      function aPayment(): Payment {
        return {
          amount: 100,
          currency: 'GBP',
          dateReceived: new Date(),
          id: 1,
          reference: 'A payment reference',
        };
      }

      function aFeeRecordWithReportedPaymentAmount(reportedPaymentAmount: number): FeeRecord {
        return {
          exporter: 'An exporter',
          facilityId: '12345678',
          id: 1,
          reportedFees: {
            amount: 50,
            currency: 'GBP',
          },
          reportedPayments: {
            amount: reportedPaymentAmount,
            currency: 'GBP',
          },
        };
      }
    });

    describe('when availablePaymentGroups is undefined', () => {
      it('returns an object which does not contain the available fee record payment groups', async () => {
        // Arrange
        const bankId = '123';
        const canAddToExistingPayment = false;

        // Act
        const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [aFeeRecordWithStatusToDo()], canAddToExistingPayment);

        // Assert
        expect(result.availablePaymentGroups).toBeUndefined();
      });
    });
  });

  describe('getAvailablePaymentGroups', () => {
    it('should return mapped fee record payment groups', async () => {
      // Arrange
      const reportId = '123';
      const paymentCurrency = 'GBP';

      const aPaymentEntity = PaymentEntityMockBuilder.forCurrency('GBP')
        .withDateReceived(new Date('2022-01-01'))
        .withAmount(55)
        .withReference('First payment')
        .build();

      const aFeeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withExporter('Test company')
        .withFacilityId('00012345')
        .withId(1)
        .withPayments([aPaymentEntity])
        .withStatus('DOES_NOT_MATCH')
        .build();

      const mockFeeRecordEntities: FeeRecordEntity[] = [aFeeRecordEntity];

      const findAvailableFeeRecordsSpy = jest
        .spyOn(FeeRecordRepo, 'findByReportIdAndPaymentCurrencyAndStatusDoesNotMatchWithPayments')
        .mockResolvedValue(mockFeeRecordEntities);

      // Act
      const result = await getAvailablePaymentGroups(reportId, paymentCurrency);

      // Assert
      expect(findAvailableFeeRecordsSpy).toHaveBeenCalledWith(123, 'GBP');
      expect(result).toEqual([
        {
          feeRecords: [
            {
              id: 1,
              facilityId: '00012345',
              exporter: 'Test company',
              reportedFees: {
                amount: 100,
                currency: 'GBP',
              },
              reportedPayments: {
                amount: 100,
                currency: 'GBP',
              },
            },
          ],
          totalReportedPayments: {
            amount: 100,
            currency: 'GBP',
          },
          paymentsReceived: [
            {
              amount: 55,
              currency: 'GBP',
              dateReceived: new Date('2022-01-01'),
              id: 1,
              reference: 'First payment',
            },
          ],
          totalPaymentsReceived: {
            amount: 55,
            currency: 'GBP',
          },
          status: 'DOES_NOT_MATCH',
        },
      ]);
    });

    it('should return an empty array when no fee records are found', async () => {
      // Arrange
      const reportId = '123';
      const paymentCurrency = 'GBP';

      const findAvailableFeeRecordsSpy = jest.spyOn(FeeRecordRepo, 'findByReportIdAndPaymentCurrencyAndStatusDoesNotMatchWithPayments').mockResolvedValue([]);

      // Act
      const result = await getAvailablePaymentGroups(reportId, paymentCurrency);

      // Assert
      expect(findAvailableFeeRecordsSpy).toHaveBeenCalledWith(123, 'GBP');
      expect(result).toEqual([]);
    });
  });

  describe('canFeeRecordsBeAddedToExistingPayment', () => {
    it('returns true when payment exists on report with matching reported currency and fee records all have status TO_DO', async () => {
      // Arrange
      const existsUnmatchedPaymentSpy = jest.spyOn(PaymentRepo, 'existsUnmatchedPaymentOfCurrencyForReportWithId').mockResolvedValue(true);
      // Act
      const result = await canFeeRecordsBeAddedToExistingPayment('123', [aFeeRecordWithStatusToDo()]);

      // Assert
      expect(result).toEqual(true);
      expect(existsUnmatchedPaymentSpy).toHaveBeenCalledWith(123, 'GBP');
    });

    it('returns false when no matching payment exists', async () => {
      // Arrange
      const existsUnmatchedPaymentSpy = jest.spyOn(PaymentRepo, 'existsUnmatchedPaymentOfCurrencyForReportWithId').mockResolvedValue(false);

      // Act
      const result = await canFeeRecordsBeAddedToExistingPayment('123', [aFeeRecordWithStatusToDo()]);

      // Assert
      expect(result).toEqual(false);
      expect(existsUnmatchedPaymentSpy).toHaveBeenCalledWith(123, 'GBP');
    });

    it('returns false when matching payment exists but fee record status is not TO_DO', async () => {
      // Arrange
      const existsUnmatchedPaymentSpy = jest.spyOn(PaymentRepo, 'existsUnmatchedPaymentOfCurrencyForReportWithId').mockResolvedValue(true);
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency('USD').withStatus('READY_TO_KEY').build();

      // Act
      const result = await canFeeRecordsBeAddedToExistingPayment('123', [feeRecord]);

      // Assert
      expect(result).toEqual(false);
      expect(existsUnmatchedPaymentSpy).not.toHaveBeenCalled();
    });

    it('returns false when no fee records', async () => {
      // Arrange
      const bankId = '123';
      const emptyFeeRecords: FeeRecordEntity[] = [];

      // Act
      const result = await canFeeRecordsBeAddedToExistingPayment(bankId, emptyFeeRecords);

      // Assert
      expect(result).toEqual(false);
    });
  });

  function aFeeRecordWithStatusToDo(): FeeRecordEntity {
    const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    return FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency('GBP').withStatus('TO_DO').build();
  }
});
