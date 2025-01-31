import { CURRENCY, FEE_RECORD_STATUS, REQUEST_PLATFORM_TYPE } from '../../constants';
import {
  aRecordCorrectionValues,
  FacilityUtilisationDataEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '../../test-helpers';
import { Currency } from '../../types';

describe('FeeRecordEntity', () => {
  const utilisationReport = new UtilisationReportEntityMockBuilder().build();

  const mockDate = new Date();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getFeesPaidToUkefForThePeriodInThePaymentCurrency', () => {
    it('should return the fees paid to ukef for the period with no exchange rate applied when the payment and fees paid currencies match', () => {
      // Arrange
      const feesPaidToUkefForThePeriod = 100.0;
      const feesPaidToUkefForThePeriodCurrency: Currency = 'GBP';
      const paymentCurrency: Currency = 'GBP';

      // the payment exchange rate in this case would usually be 1, but we set it to ensure that it is not used in this case
      const paymentExchangeRate = 1.1;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withPaymentCurrency(paymentCurrency)
        .withPaymentExchangeRate(paymentExchangeRate)
        .build();

      const expectedFeesPaidToUkefForThePeriodInThePaymentCurrency = 100.0;

      // Act
      const feesPaidToUkefForThePeriodInThePaymentCurrency = feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency();

      // Assert
      expect(feesPaidToUkefForThePeriodInThePaymentCurrency).toEqual(expectedFeesPaidToUkefForThePeriodInThePaymentCurrency);
    });

    it('should return the fees paid to ukef for the period in the payment currency using the payment exchange rate', () => {
      // Arrange
      const feesPaidToUkefForThePeriod = 100.0;
      const feesPaidToUkefForThePeriodCurrency: Currency = 'EUR';
      const paymentCurrency: Currency = 'GBP';
      const paymentExchangeRate = 1.1;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withPaymentCurrency(paymentCurrency)
        .withPaymentExchangeRate(paymentExchangeRate)
        .build();

      const expectedFeesPaidToUkefForThePeriodInThePaymentCurrency = 90.91;

      // Act
      const feesPaidToUkefForThePeriodInThePaymentCurrency = feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency();

      // Assert
      expect(feesPaidToUkefForThePeriodInThePaymentCurrency).toEqual(expectedFeesPaidToUkefForThePeriodInThePaymentCurrency);
    });
  });

  describe('updateWithStatus', () => {
    it.each(Object.values(FEE_RECORD_STATUS))("should set the report status to '%s' and updates the 'lastUpdatedBy...' fields", (status) => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(status).build();

      const userId = 'abc123';

      // Act
      feeRecord.updateWithStatus({
        status,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId },
      });

      // Assert
      expect(feeRecord.status).toEqual(status);
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toEqual(userId);
    });

    it(`should set the dateReconciled field to now when the status to set is ${FEE_RECORD_STATUS.RECONCILED}`, () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(FEE_RECORD_STATUS.MATCH).withDateReconciled(null).build();

      // Act
      feeRecord.updateWithStatus({
        status: FEE_RECORD_STATUS.RECONCILED,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
      });

      // Assert
      expect(feeRecord.dateReconciled).toEqual(mockDate);
    });
  });

  describe('removeAllPayments', () => {
    it(`should remove all payments, sets the record status to ${FEE_RECORD_STATUS.TO_DO} and updates the 'lastUpdatedBy...' fields`, () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';
      const paymentId = 123;
      const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).build();

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withPaymentCurrency(paymentCurrency)
        .withPayments([payment])
        .withLastUpdatedByIsSystemUser(true)
        .withLastUpdatedByPortalUserId(null)
        .withLastUpdatedByTfmUserId(null)
        .build();

      const userId = 'abc123';

      // Act
      feeRecord.removeAllPayments({
        requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId },
      });

      // Assert
      expect(feeRecord.payments).toHaveLength(0);
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.TO_DO);
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toEqual(userId);
    });
  });

  describe('markAsReconciled', () => {
    it('should set the fee record dateReconciled to now and the reconciledByUserId to the supplied value', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withDateReconciled(null).build();

      // Act
      feeRecord.markAsReconciled({ reconciledByUserId: 'abc123', requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'def456' } });

      // Assert
      expect(feeRecord.dateReconciled).toEqual(mockDate);
      expect(feeRecord.reconciledByUserId).toEqual('abc123');
    });

    it("should set the fee record status to RECONCILED and updates the 'lastUpdatedBy...' fields", () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
        .withLastUpdatedByIsSystemUser(true)
        .withLastUpdatedByPortalUserId(null)
        .withLastUpdatedByTfmUserId(null)
        .build();

      // Act
      feeRecord.markAsReconciled({ reconciledByUserId: 'abc123', requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' } });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.RECONCILED);
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toEqual('abc123');
    });
  });

  describe('markAsReadyToKey', () => {
    it('should set the fee record dateReconciled and reconciledByUserId to null', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withDateReconciled(new Date('2024')).withReconciledByUserId('abc123').build();

      // Act
      feeRecord.markAsReadyToKey({ requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' } });

      // Assert
      expect(feeRecord.dateReconciled).toBeNull();
      expect(feeRecord.reconciledByUserId).toBeNull();
    });

    it("should set the fee record status to READY_TO_KEY and updates the 'lastUpdatedBy...' fields", () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .withLastUpdatedByIsSystemUser(true)
        .withLastUpdatedByPortalUserId(null)
        .withLastUpdatedByTfmUserId(null)
        .build();

      // Act
      feeRecord.markAsReadyToKey({ requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' } });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toEqual('abc123');
    });
  });

  describe('updateWithKeyingData', () => {
    describe(`when the status to set is ${FEE_RECORD_STATUS.READY_TO_KEY}`, () => {
      const status = FEE_RECORD_STATUS.READY_TO_KEY;

      it(`should set the fee record status to ${FEE_RECORD_STATUS.READY_TO_KEY} and updates the principalBalanceAdjustment, fixedFeeAdjustment and 'lastUpdatedBy...' fields`, () => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withStatus(FEE_RECORD_STATUS.MATCH)
          .withPrincipalBalanceAdjustment(null)
          .withFixedFeeAdjustment(null)
          .withLastUpdatedByIsSystemUser(true)
          .withLastUpdatedByPortalUserId(null)
          .withLastUpdatedByTfmUserId(null)
          .build();

        // Act
        feeRecord.updateWithKeyingData({
          fixedFeeAdjustment: 1000,
          principalBalanceAdjustment: 1000000,
          status,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        });

        // Assert
        expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
        expect(feeRecord.principalBalanceAdjustment).toEqual(1000000);
        expect(feeRecord.fixedFeeAdjustment).toEqual(1000);
        expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
        expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
        expect(feeRecord.lastUpdatedByTfmUserId).toEqual('abc123');
      });

      it('should not set the fee record dateReconciled or the reconciledByUserId', () => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withStatus(FEE_RECORD_STATUS.MATCH)
          .withDateReconciled(null)
          .withReconciledByUserId(null)
          .build();

        // Act
        feeRecord.updateWithKeyingData({
          fixedFeeAdjustment: 1000,
          principalBalanceAdjustment: 1000000,
          status,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        });

        // Assert
        expect(feeRecord.dateReconciled).toBeNull();
        expect(feeRecord.reconciledByUserId).toBeNull();
      });
    });

    describe(`when the status to set is ${FEE_RECORD_STATUS.RECONCILED}`, () => {
      const status = FEE_RECORD_STATUS.RECONCILED;

      it(`should set the fee record status to ${FEE_RECORD_STATUS.RECONCILED} and updates the principalBalanceAdjustment, fixedFeeAdjustment and 'lastUpdatedBy...' fields`, () => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withStatus(FEE_RECORD_STATUS.MATCH)
          .withPrincipalBalanceAdjustment(null)
          .withFixedFeeAdjustment(null)
          .withLastUpdatedByIsSystemUser(true)
          .withLastUpdatedByPortalUserId(null)
          .withLastUpdatedByTfmUserId(null)
          .build();

        // Act
        feeRecord.updateWithKeyingData({
          fixedFeeAdjustment: 1000,
          principalBalanceAdjustment: 1000000,
          status,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        });

        // Assert
        expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.RECONCILED);
        expect(feeRecord.principalBalanceAdjustment).toEqual(1000000);
        expect(feeRecord.fixedFeeAdjustment).toEqual(1000);
        expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
        expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
        expect(feeRecord.lastUpdatedByTfmUserId).toEqual('abc123');
      });

      it('should set the dateReconciled to now and does not set the reconciledByUserId', () => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(FEE_RECORD_STATUS.MATCH).withDateReconciled(null).build();

        // Act
        feeRecord.updateWithKeyingData({
          fixedFeeAdjustment: 1000,
          principalBalanceAdjustment: 1000000,
          status,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        });

        // Assert
        expect(feeRecord.dateReconciled).toEqual(mockDate);
        expect(feeRecord.reconciledByUserId).toBeNull();
      });
    });
  });

  describe('updateWithCorrection', () => {
    it('should update the fee record with corrected values', () => {
      // Arrange
      const correctedValues = {
        facilityUtilisation: 5000,
        feesPaidToUkefForThePeriod: 200,
        feesPaidToUkefForThePeriodCurrency: CURRENCY.USD,
        facilityId: '11111111',
      };

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFacilityUtilisation(1000)
        .withFeesPaidToUkefForThePeriod(100)
        .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
        .withFacilityId('22222222')
        .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
        .build();

      // Act
      feeRecord.updateWithCorrection({
        correctedValues,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: 'abc123' },
      });

      // Assert
      expect(feeRecord.facilityUtilisation).toEqual(correctedValues.facilityUtilisation);
      expect(feeRecord.feesPaidToUkefForThePeriod).toEqual(correctedValues.feesPaidToUkefForThePeriod);
      expect(feeRecord.feesPaidToUkefForThePeriodCurrency).toEqual(correctedValues.feesPaidToUkefForThePeriodCurrency);
      expect(feeRecord.facilityId).toEqual(correctedValues.facilityId);
    });

    it('should update facilityUtilisationData id to new facilityId when facilityId is corrected', () => {
      // Arrange
      const correctedValues = {
        facilityUtilisation: null,
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
        facilityId: '77777777',
      };

      const oldFacilityId = '11111111';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFacilityUtilisationData(FacilityUtilisationDataEntityMockBuilder.forId(oldFacilityId).build())
        .withFacilityId(oldFacilityId)
        .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
        .build();

      // Act
      feeRecord.updateWithCorrection({
        correctedValues,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: 'abc123' },
      });

      // Assert
      expect(feeRecord.facilityUtilisationData.id).toEqual(correctedValues.facilityId);
    });

    describe('when the fee record payment currency is the same as the fees paid to ukef for the period currency', () => {
      const originalFeesPaidToUkefForThePeriodCurrency = CURRENCY.GBP;
      const originalPaymentCurrency = originalFeesPaidToUkefForThePeriodCurrency;
      const correctionCurrency = CURRENCY.USD;

      it('should apply any change to the fees paid to ukef for the period currency to the payment currency also', () => {
        // Arrange
        const correctedValues = {
          ...aRecordCorrectionValues(),
          feesPaidToUkefForThePeriodCurrency: correctionCurrency,
        };

        const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withFeesPaidToUkefForThePeriodCurrency(originalFeesPaidToUkefForThePeriodCurrency)
          .withPaymentCurrency(originalPaymentCurrency)
          .withPaymentExchangeRate(1)
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .build();

        // Act
        feeRecord.updateWithCorrection({
          correctedValues,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        });

        // Assert
        expect(feeRecord.feesPaidToUkefForThePeriodCurrency).toEqual(correctionCurrency);
        expect(feeRecord.paymentCurrency).toEqual(correctionCurrency);
      });
    });

    describe('when the fee record payment currency is NOT the same as the fees paid to ukef for the period currency', () => {
      const originalPaymentCurrency = CURRENCY.EUR;
      const originalFeesPaidToUkefForThePeriodCurrency = CURRENCY.GBP;
      const correctionCurrency = CURRENCY.USD;

      it('should not change the payment currency', () => {
        // Arrange
        const correctedValues = {
          ...aRecordCorrectionValues(),
          feesPaidToUkefForThePeriodCurrency: correctionCurrency,
        };

        const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withFeesPaidToUkefForThePeriodCurrency(originalFeesPaidToUkefForThePeriodCurrency)
          .withPaymentCurrency(originalPaymentCurrency)
          .withPaymentExchangeRate(1)
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .build();

        // Act
        feeRecord.updateWithCorrection({
          correctedValues,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        });

        // Assert
        expect(feeRecord.feesPaidToUkefForThePeriodCurrency).toEqual(correctionCurrency);
        expect(feeRecord.paymentCurrency).toEqual(originalPaymentCurrency);
      });
    });

    it('should set the status to TO_DO_AMENDED when corrected values are not all null', () => {
      // Arrange
      const correctedValues = {
        facilityUtilisation: null,
        feesPaidToUkefForThePeriodCurrency: null,
        feesPaidToUkefForThePeriod: null,
        facilityId: '11111111',
      };

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();

      // Act
      feeRecord.updateWithCorrection({
        correctedValues,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: 'abc123' },
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.TO_DO_AMENDED);
    });

    it('should set the status to TO_DO_AMENDED when corrected values are all null', () => {
      // Arrange
      const correctedValues = {
        facilityUtilisation: null,
        feesPaidToUkefForThePeriodCurrency: null,
        feesPaidToUkefForThePeriod: null,
        facilityId: null,
      };

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();

      // Act
      feeRecord.updateWithCorrection({
        correctedValues,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: 'abc123' },
      });

      // Assert
      expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.TO_DO_AMENDED);
    });

    it('should update the lastUpdatedBy fields', () => {
      // Arrange
      const correctedValues = aRecordCorrectionValues();

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withLastUpdatedByIsSystemUser(true)
        .withLastUpdatedByPortalUserId(null)
        .withLastUpdatedByTfmUserId(null)
        .build();

      const userId = 'abc123';

      // Act
      feeRecord.updateWithCorrection({
        correctedValues,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId },
      });

      // Assert
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toEqual(userId);
      expect(feeRecord.lastUpdatedByTfmUserId).toBeNull();
    });

    it('should not change values of fields that are null in corrected values', () => {
      // Arrange
      const correctedValues = {
        facilityUtilisation: null,
        feesPaidToUkefForThePeriodCurrency: null,
        feesPaidToUkefForThePeriod: 200,
        facilityId: '11111111',
      };

      const originalValues = {
        facilityUtilisation: 1000,
        feesPaidToUkefForThePeriodCurrency: CURRENCY.USD,
        feesPaidToUkefForThePeriod: 100,
        facilityId: '22222222',
      };

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFacilityUtilisation(originalValues.facilityUtilisation)
        .withFeesPaidToUkefForThePeriod(originalValues.feesPaidToUkefForThePeriod)
        .withFeesPaidToUkefForThePeriodCurrency(originalValues.feesPaidToUkefForThePeriodCurrency)
        .withFacilityId(originalValues.facilityId)
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .build();

      // Act
      feeRecord.updateWithCorrection({
        correctedValues,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: 'abc123' },
      });

      // Assert
      expect(feeRecord.facilityUtilisation).toEqual(originalValues.facilityUtilisation);
      expect(feeRecord.feesPaidToUkefForThePeriodCurrency).toEqual(originalValues.feesPaidToUkefForThePeriodCurrency);

      expect(feeRecord.feesPaidToUkefForThePeriod).toEqual(correctedValues.feesPaidToUkefForThePeriod);
      expect(feeRecord.facilityId).toEqual(correctedValues.facilityId);
    });

    it('should not change values of any fields if all corrected values are null', () => {
      // Arrange
      const correctedValues = {
        facilityUtilisation: null,
        feesPaidToUkefForThePeriodCurrency: null,
        feesPaidToUkefForThePeriod: null,
        facilityId: null,
      };

      const originalValues = {
        facilityUtilisation: 1000,
        feesPaidToUkefForThePeriodCurrency: CURRENCY.USD,
        feesPaidToUkefForThePeriod: 100,
        facilityId: '11111111',
      };

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFacilityUtilisation(originalValues.facilityUtilisation)
        .withFeesPaidToUkefForThePeriod(originalValues.feesPaidToUkefForThePeriod)
        .withFeesPaidToUkefForThePeriodCurrency(originalValues.feesPaidToUkefForThePeriodCurrency)
        .withFacilityId(originalValues.facilityId)
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .build();

      // Act
      feeRecord.updateWithCorrection({
        correctedValues,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: '123' },
      });

      // Assert
      expect(feeRecord.facilityUtilisation).toEqual(originalValues.facilityUtilisation);
      expect(feeRecord.feesPaidToUkefForThePeriodCurrency).toEqual(originalValues.feesPaidToUkefForThePeriodCurrency);
      expect(feeRecord.feesPaidToUkefForThePeriod).toEqual(originalValues.feesPaidToUkefForThePeriod);
      expect(feeRecord.facilityId).toEqual(originalValues.facilityId);
    });

    it('should update numerical fields to zero if corrected values are zero', () => {
      // Arrange
      const correctedValues = {
        ...aRecordCorrectionValues(),
        facilityUtilisation: 0,
        feesPaidToUkefForThePeriod: 0,
      };

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFacilityUtilisation(1000)
        .withFeesPaidToUkefForThePeriod(100)
        .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
        .build();

      // Act
      feeRecord.updateWithCorrection({
        correctedValues,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: 'abc123' },
      });

      // Assert
      expect(feeRecord.facilityUtilisation).toEqual(correctedValues.facilityUtilisation);
      expect(feeRecord.feesPaidToUkefForThePeriod).toEqual(correctedValues.feesPaidToUkefForThePeriod);
    });
  });
});
