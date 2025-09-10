import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import {
  CurrencyAndAmount,
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  PENDING_RECONCILIATION,
  RECONCILIATION_IN_PROGRESS,
  SelectedFeeRecordsPaymentDetails
} from '@ukef/dtfs2-common';
import difference from 'lodash/difference';
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
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups', () => {
    const gbpTolerance = 1;

    const bankName = 'Test bank';
    const bankId = '77';

    beforeEach(() => {
      jest.mocked(getBankNameById).mockResolvedValue(bankName);
    });

    it('should set bank name', async () => {
      // Arrange
      const feeRecords = [new FeeRecordEntityMockBuilder().withPaymentCurrency(CURRENCY.GBP).withStatus(FEE_RECORD_STATUS.TO_DO).build()];

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), feeRecords, false, gbpTolerance);

      // Assert
      expect(result.bank).toEqual({ name: bankName });
    });

    it('should set the gbpTolerance to the passed in value', async () => {
      // Arrange
      const tolerance = 1.12;
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build()).build();

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [feeRecord], false, tolerance);

      // Assert
      expect(result.gbpTolerance).toEqual(tolerance);
    });

    it('should map report period', async () => {
      // Arrange
      const reportPeriod = aReportPeriod();
      const feeRecords = [new FeeRecordEntityMockBuilder().withPaymentCurrency(CURRENCY.GBP).withStatus(FEE_RECORD_STATUS.TO_DO).build()];

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, reportPeriod, feeRecords, false, gbpTolerance);

      // Assert
      expect(result.reportPeriod).toEqual(reportPeriod);
    });

    it('should map the fee record facilityId, id and exporter', async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build())
        .withExporter('Test company')
        .withFacilityId('00012345')
        .withId(2)
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [feeRecord], false, gbpTolerance);

      // Assert
      expect(result.feeRecords[0]).toEqual(expect.objectContaining({ id: 2, facilityId: '00012345', exporter: 'Test company' }));
    });

    it('should map the fees paid to ukef for period to reported payment with no conversion when payment currency matches fees paid to ukef for the period currency', async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build())
        .withFeesPaidToUkefForThePeriod(200)
        .withFeesPaidToUkefForThePeriodCurrency('USD')
        .withPaymentCurrency('USD')
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [feeRecord], false, gbpTolerance);

      // Assert
      expect(result.feeRecords[0].reportedPayments).toEqual<CurrencyAndAmount>({ amount: 200, currency: 'USD' });
    });

    it('should set the reported payment to the fees paid to ukef for the period converted into the payment currency when the payment currency does not match the fees paid to ukef for the period currency', async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build())
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency(CURRENCY.GBP)
        .withPaymentExchangeRate(1.1)
        .build();

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [feeRecord], false, gbpTolerance);

      // Assert
      expect(result.feeRecords[0].reportedPayments).toEqual<CurrencyAndAmount>({ amount: 2000, currency: CURRENCY.GBP });
    });

    it('should map the fees paid to ukef for the period to the reported fee', async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build())
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(bankId, aReportPeriod(), [feeRecord], false, gbpTolerance);

      // Assert
      expect(result.feeRecords[0].reportedFee).toEqual<CurrencyAndAmount>({ amount: 2200, currency: 'EUR' });
    });

    it('should map fee record payments removing any duplicates', async () => {
      // Arrange
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
      const firstPaymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withDateReceived(new Date('2022-01-01'))
        .withAmount(100)
        .withReference('First payment')
        .build();
      const secondPaymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withDateReceived(new Date('2022-02-02'))
        .withAmount(200)
        .withReference('Second payment')
        .build();
      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withPaymentCurrency(CURRENCY.GBP)
        .withPayments([firstPaymentEntity, secondPaymentEntity])
        .build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withPaymentCurrency(CURRENCY.GBP)
        .withPayments([firstPaymentEntity, secondPaymentEntity])
        .build();

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(
        bankId,
        aReportPeriod(),
        [firstFeeRecord, secondFeeRecord],
        false,
        gbpTolerance,
      );

      // Assert
      expect(result.payments).toEqual<SelectedFeeRecordsPaymentDetails[]>([
        { currency: CURRENCY.GBP, amount: 100, dateReceived: new Date('2022-01-01'), reference: 'First payment' },
        { currency: CURRENCY.GBP, amount: 200, dateReceived: new Date('2022-02-02'), reference: 'Second payment' },
      ]);
    });

    it('should set payments to empty array when fee records have no attached payments', async () => {
      // Arrange
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency(CURRENCY.GBP).withPayments([]).build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency(CURRENCY.GBP).withPayments([]).build();

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(
        bankId,
        aReportPeriod(),
        [firstFeeRecord, secondFeeRecord],
        false,
        gbpTolerance,
      );

      // Assert
      expect(result.payments).toEqual([]);
    });

    it('should calculate total reported payments in payment currency by adding up reported payments of all fee records', async () => {
      // Arrange
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
      const feeRecordWithDifferingCurrencies = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency(CURRENCY.GBP)
        .withPaymentExchangeRate(1.1)
        .build();
      const feeRecordWithMatchingCurrencies = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withFeesPaidToUkefForThePeriod(1000)
        .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
        .withPaymentCurrency(CURRENCY.GBP)
        .build();

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(
        bankId,
        aReportPeriod(),
        [feeRecordWithDifferingCurrencies, feeRecordWithMatchingCurrencies],
        false,
        gbpTolerance,
      );

      // Assert
      expect(result.totalReportedPayments).toEqual<CurrencyAndAmount>({ amount: 3000, currency: CURRENCY.GBP });
    });

    it('should map can add to existing payment flag', async () => {
      // Arrange
      const canAddToExistingPayment = true;
      const feeRecords = [new FeeRecordEntityMockBuilder().withPaymentCurrency(CURRENCY.GBP).withStatus(FEE_RECORD_STATUS.TO_DO).build()];

      // Act
      const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(
        bankId,
        aReportPeriod(),
        feeRecords,
        canAddToExistingPayment,
        gbpTolerance,
      );

      // Assert
      expect(result.canAddToExistingPayment).toEqual(canAddToExistingPayment);
    });

    describe('when availablePaymentGroups is undefined', () => {
      it('should return an object which does not contain the available fee record payment groups', async () => {
        // Arrange
        const canAddToExistingPayment = false;
        const feeRecords = [new FeeRecordEntityMockBuilder().withPaymentCurrency(CURRENCY.GBP).withStatus(FEE_RECORD_STATUS.TO_DO).build()];

        // Act
        const result = await mapToSelectedFeeRecordDetailsWithoutAvailablePaymentGroups(
          bankId,
          aReportPeriod(),
          feeRecords,
          canAddToExistingPayment,
          gbpTolerance,
        );

        // Assert
        expect(result.availablePaymentGroups).toBeUndefined();
      });
    });
  });

  describe('getSelectedFeeRecordsAvailablePaymentGroups', () => {
    const reportId = 345;
    const reportIdString = reportId.toString();

    it('should return mapped available payments', async () => {
      // Arrange
      const paymentCurrency = CURRENCY.GBP;

      const firstPaymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(55).withId(1).withReference('First payment').build();
      const secondPaymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(65).withId(2).withReference('Second payment').build();
      const thirdPaymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(75).withId(3).withReference('Third payment').build();

      const firstFeeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build())
        .withId(1)
        .withPayments([firstPaymentEntity, secondPaymentEntity])
        .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
        .build();
      const secondFeeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build())
        .withId(2)
        .withPayments([thirdPaymentEntity])
        .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
        .build();

      const mockFeeRecordEntities: FeeRecordEntity[] = [firstFeeRecordEntity, secondFeeRecordEntity];

      const findAvailableFeeRecordsSpy = jest
        .spyOn(FeeRecordRepo, 'findByReportIdAndPaymentCurrencyAndStatusDoesNotMatchWithPayments')
        .mockResolvedValue(mockFeeRecordEntities);

      // Act
      const result = await getSelectedFeeRecordsAvailablePaymentGroups(reportIdString, paymentCurrency);

      // Assert
      expect(findAvailableFeeRecordsSpy).toHaveBeenCalledWith(reportId, CURRENCY.GBP);

      expect(result).toEqual([
        [
          { amount: 55, currency: CURRENCY.GBP, id: 1, reference: 'First payment' },
          { amount: 65, currency: CURRENCY.GBP, id: 2, reference: 'Second payment' },
        ],
        [{ amount: 75, currency: CURRENCY.GBP, id: 3, reference: 'Third payment' }],
      ]);
    });

    it('should return an empty array when no fee records are found', async () => {
      // Arrange
      const paymentCurrency = CURRENCY.GBP;

      const findAvailableFeeRecordsSpy = jest.spyOn(FeeRecordRepo, 'findByReportIdAndPaymentCurrencyAndStatusDoesNotMatchWithPayments').mockResolvedValue([]);

      // Act
      const result = await getSelectedFeeRecordsAvailablePaymentGroups(reportIdString, paymentCurrency);

      // Assert
      expect(findAvailableFeeRecordsSpy).toHaveBeenCalledWith(reportId, CURRENCY.GBP);
      expect(result).toEqual([]);
    });
  });

  describe('canFeeRecordsBeAddedToExistingPayment', () => {
    const reportId = 123;
    const reportIdString = reportId.toString();

    describe.each([FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.TO_DO_AMENDED])('when all fee records have status %s', (status) => {
      const feeRecords = [new FeeRecordEntityMockBuilder().withPaymentCurrency(CURRENCY.GBP).withStatus(status).build()];

      it('should return true when payment exists on report with matching reported currency', async () => {
        // Arrange
        const existsUnmatchedPaymentSpy = jest.spyOn(PaymentRepo, 'existsUnmatchedPaymentOfCurrencyForReportWithId').mockResolvedValue(true);

        // Act
        const result = await canFeeRecordsBeAddedToExistingPayment(reportIdString, feeRecords);

        // Assert
        expect(result).toEqual(true);
        expect(existsUnmatchedPaymentSpy).toHaveBeenCalledWith(reportId, CURRENCY.GBP);
      });

      it('should return false when payment does not exist on report with matching reported currency', async () => {
        // Arrange
        const existsUnmatchedPaymentSpy = jest.spyOn(PaymentRepo, 'existsUnmatchedPaymentOfCurrencyForReportWithId').mockResolvedValue(false);

        // Act
        const result = await canFeeRecordsBeAddedToExistingPayment('123', feeRecords);

        // Assert
        expect(result).toEqual(false);
        expect(existsUnmatchedPaymentSpy).toHaveBeenCalledWith(123, CURRENCY.GBP);
      });
    });

    describe(`when fee records have a mix of ${FEE_RECORD_STATUS.TO_DO} and ${FEE_RECORD_STATUS.TO_DO_AMENDED} statuses`, () => {
      const feeRecords = [
        new FeeRecordEntityMockBuilder().withPaymentCurrency(CURRENCY.GBP).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
        new FeeRecordEntityMockBuilder().withPaymentCurrency(CURRENCY.GBP).withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED).build(),
      ];

      it('should return true when payment exists on report with matching reported currency', async () => {
        // Arrange
        const existsUnmatchedPaymentSpy = jest.spyOn(PaymentRepo, 'existsUnmatchedPaymentOfCurrencyForReportWithId').mockResolvedValue(true);

        // Act
        const result = await canFeeRecordsBeAddedToExistingPayment(reportIdString, feeRecords);

        // Assert
        expect(result).toEqual(true);
        expect(existsUnmatchedPaymentSpy).toHaveBeenCalledWith(reportId, CURRENCY.GBP);
      });

      it('should return false when payment does not exist on report with matching reported currency', async () => {
        // Arrange
        const existsUnmatchedPaymentSpy = jest.spyOn(PaymentRepo, 'existsUnmatchedPaymentOfCurrencyForReportWithId').mockResolvedValue(false);

        // Act
        const result = await canFeeRecordsBeAddedToExistingPayment(reportIdString, feeRecords);

        // Assert
        expect(result).toEqual(false);
        expect(existsUnmatchedPaymentSpy).toHaveBeenCalledWith(reportId, CURRENCY.GBP);
      });
    });

    it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.TO_DO_AMENDED]))(
      'should return false when matching payment exists but fee record status is %s',
      async (status) => {
        // Arrange
        const existsUnmatchedPaymentSpy = jest.spyOn(PaymentRepo, 'existsUnmatchedPaymentOfCurrencyForReportWithId').mockResolvedValue(true);
        const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
        const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport).withPaymentCurrency('USD').withStatus(status).build();

        // Act
        const result = await canFeeRecordsBeAddedToExistingPayment(reportIdString, [feeRecord]);

        // Assert
        expect(result).toEqual(false);
        expect(existsUnmatchedPaymentSpy).not.toHaveBeenCalled();
      },
    );

    it('should return false when no fee records', async () => {
      // Arrange
      const emptyFeeRecords: FeeRecordEntity[] = [];

      // Act
      const result = await canFeeRecordsBeAddedToExistingPayment(reportIdString, emptyFeeRecords);

      // Assert
      expect(result).toEqual(false);
    });
  });
});
