import {
  CurrencyAndAmount,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  SelectedFeeRecordsPaymentDetails,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { getBankNameById } from '../../../../repositories/banks-repo';
import {
  canFeeRecordsBeAddedToExistingPayment,
  getSelectedFeeRecordsAvailablePaymentGroups,
  mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups,
} from './helpers';
import { aReportPeriod } from '../../../../../test-helpers';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

jest.mock('../../../../repositories/banks-repo');

describe('get selected fee record details controller helpers', () => {
  const BANK_NAME = 'Test bank';
  beforeEach(() => {
    jest.mocked(getBankNameById).mockResolvedValue(BANK_NAME);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups', () => {
    it('sets bank name', async () => {
      // Act
      const bankId = '123';
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [aFeeRecordWithStatusToDo()], false);

      // Assert
      expect(result.bank).toEqual({ name: BANK_NAME });
    });

    it('maps report period', async () => {
      // Arrange
      const bankId = '123';
      const reportPeriod = aReportPeriod();

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, reportPeriod, [aFeeRecordWithStatusToDo()], false);

      // Assert
      expect(result.reportPeriod).toEqual(reportPeriod);
    });

    it('maps the fee record facilityId, id and exporter', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(
        UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build(),
      )
        .withExporter('Test company')
        .withFacilityId('00012345')
        .withId(2)
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [feeRecord], false);

      // Assert
      expect(result.feeRecords[0]).toEqual(expect.objectContaining({ id: 2, facilityId: '00012345', exporter: 'Test company' }));
    });

    it('maps the fees paid to ukef for period to reported payment with no conversion when payment currency matches fees paid to ukef for the period currency', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(
        UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build(),
      )
        .withFeesPaidToUkefForThePeriod(200)
        .withFeesPaidToUkefForThePeriodCurrency('USD')
        .withPaymentCurrency('USD')
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [feeRecord], false);

      // Assert
      expect(result.feeRecords[0].reportedPayments).toEqual<CurrencyAndAmount>({ amount: 200, currency: 'USD' });
    });

    it('sets the reported payment to the fees paid to ukef for the period converted into the payment currency when the payment currency does not match the fees paid to ukef for the period currency', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(
        UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build(),
      )
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency('GBP')
        .withPaymentExchangeRate(1.1)
        .build();

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [feeRecord], false);

      // Assert
      expect(result.feeRecords[0].reportedPayments).toEqual<CurrencyAndAmount>({ amount: 2000, currency: 'GBP' });
    });

    it('maps the fees paid to ukef for the period to the reported fee', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(
        UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build(),
      )
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [feeRecord], false);

      // Assert
      expect(result.feeRecords[0].reportedFee).toEqual<CurrencyAndAmount>({ amount: 2200, currency: 'EUR' });
    });

    it('maps fee record payments removing any duplicates', async () => {
      // Arrange
      const bankId = '123';
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();
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
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [firstFeeRecord, secondFeeRecord], false);

      // Assert
      expect(result.payments).toEqual<SelectedFeeRecordsPaymentDetails[]>([
        { currency: 'GBP', amount: 100, dateReceived: new Date('2022-01-01'), reference: 'First payment' },
        { currency: 'GBP', amount: 200, dateReceived: new Date('2022-02-02'), reference: 'Second payment' },
      ]);
    });

    it('sets payments to empty array when fee records have no attached payments', async () => {
      // Arrange
      const bankId = '123';
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();
      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency('GBP').withPayments([]).build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency('GBP').withPayments([]).build();

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [firstFeeRecord, secondFeeRecord], false);

      // Assert
      expect(result.payments).toEqual([]);
    });

    it('calculates total reported payments in payment currency by adding up reported payments of all fee records', async () => {
      // Arrange
      const bankId = '123';
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();
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
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(
        bankId,
        aReportPeriod(),
        [feeRecordWithDifferingCurrencies, feeRecordWithMatchingCurrencies],
        false,
      );

      // Assert
      expect(result.totalReportedPayments).toEqual<CurrencyAndAmount>({ amount: 3000, currency: 'GBP' });
    });

    it('maps can add to existing payment flag', async () => {
      // Arrange
      const bankId = '123';
      const canAddToExistingPayment = true;

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(
        bankId,
        aReportPeriod(),
        [aFeeRecordWithStatusToDo()],
        canAddToExistingPayment,
      );

      // Assert
      expect(result.canAddToExistingPayment).toEqual(canAddToExistingPayment);
    });

    describe('when availablePaymentGroups is undefined', () => {
      it('returns an object which does not contain the available fee record payment groups', async () => {
        // Arrange
        const bankId = '123';
        const canAddToExistingPayment = false;

        // Act
        const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(
          bankId,
          aReportPeriod(),
          [aFeeRecordWithStatusToDo()],
          canAddToExistingPayment,
        );

        // Assert
        expect(result.availablePaymentGroups).toBeUndefined();
      });
    });
  });

  describe('getSelectedFeeRecordsAvailablePaymentGroups', () => {
    it('should return mapped available payments', async () => {
      // Arrange
      const reportId = '123';
      const paymentCurrency = 'GBP';

      const firstPaymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(55).withId(1).withReference('First payment').build();
      const secondPaymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(65).withId(2).withReference('Second payment').build();
      const thirdPaymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(75).withId(3).withReference('Third payment').build();

      const firstFeeRecordEntity = FeeRecordEntityMockBuilder.forReport(
        UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build(),
      )
        .withId(1)
        .withPayments([firstPaymentEntity, secondPaymentEntity])
        .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
        .build();
      const secondFeeRecordEntity = FeeRecordEntityMockBuilder.forReport(
        UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build(),
      )
        .withId(2)
        .withPayments([thirdPaymentEntity])
        .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
        .build();

      const mockFeeRecordEntities: FeeRecordEntity[] = [firstFeeRecordEntity, secondFeeRecordEntity];

      const findAvailableFeeRecordsSpy = jest
        .spyOn(FeeRecordRepo, 'findByReportIdAndPaymentCurrencyAndStatusDoesNotMatchWithPayments')
        .mockResolvedValue(mockFeeRecordEntities);

      // Act
      const result = await getSelectedFeeRecordsAvailablePaymentGroups(reportId, paymentCurrency);

      // Assert
      expect(findAvailableFeeRecordsSpy).toHaveBeenCalledWith(123, 'GBP');

      expect(result).toEqual([
        [
          { amount: 55, currency: 'GBP', id: 1, reference: 'First payment' },
          { amount: 65, currency: 'GBP', id: 2, reference: 'Second payment' },
        ],
        [{ amount: 75, currency: 'GBP', id: 3, reference: 'Third payment' }],
      ]);
    });

    it('should return an empty array when no fee records are found', async () => {
      // Arrange
      const reportId = '123';
      const paymentCurrency = 'GBP';

      const findAvailableFeeRecordsSpy = jest.spyOn(FeeRecordRepo, 'findByReportIdAndPaymentCurrencyAndStatusDoesNotMatchWithPayments').mockResolvedValue([]);

      // Act
      const result = await getSelectedFeeRecordsAvailablePaymentGroups(reportId, paymentCurrency);

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
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency('USD').withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build();

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
    return FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency('GBP').withStatus(FEE_RECORD_STATUS.TO_DO).build();
  }
});
