import { difference } from 'lodash';
import { Currency, FEE_RECORD_STATUS, FeeRecordEntityMockBuilder, KeyingSheetRowStatus, PaymentEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments, mapPaymentEntityToKeyingSheetFeePayment } from './keying-sheet-mapping';
import { aUtilisationReport } from '../../test-helpers';

describe('keying sheet mapping', () => {
  describe('mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments', () => {
    const INVALID_FEE_RECORD_STATUSES = difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]);

    it.each(INVALID_FEE_RECORD_STATUSES)('throws an error when the fee record entity status is %s', (status) => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build();

      // Act / Assert
      expect(() => mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity)).toThrow(Error);
    });

    it('maps the fee record READY_TO_KEY status to the keying sheet TO_DO status', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build();

      // Act
      const keyingSheetRow = mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity);

      // Assert
      expect(keyingSheetRow.status).toBe<KeyingSheetRowStatus>('TO_DO');
    });

    it('maps the fee record RECONCILED status to the keying sheet DONE status', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(FEE_RECORD_STATUS.RECONCILED).build();

      // Act
      const keyingSheetRow = mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity);

      // Assert
      expect(keyingSheetRow.status).toBe<KeyingSheetRowStatus>('DONE');
    });

    it('maps the fee record entity id, facility id, exporter and base currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('READY_TO_KEY')
        .withId(123)
        .withFacilityId('12345678')
        .withExporter('Test exporter')
        .withBaseCurrency('EUR')
        .build();

      // Act
      const keyingSheetRow = mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity);

      // Assert
      expect(keyingSheetRow.feeRecordId).toEqual(123);
      expect(keyingSheetRow.facilityId).toEqual('12345678');
      expect(keyingSheetRow.exporter).toEqual('Test exporter');
      expect(keyingSheetRow.baseCurrency).toBe<Currency>('EUR');
    });

    it.each([
      { condition: 'is null', value: null, expectedMappedValue: null },
      { condition: 'is zero', value: 0, expectedMappedValue: { amount: 0, change: 'NONE' } },
      { condition: 'is positive', value: 100, expectedMappedValue: { amount: 100, change: 'INCREASE' } },
      { condition: 'is negative', value: -100, expectedMappedValue: { amount: 100, change: 'DECREASE' } },
    ])(
      'sets the keying sheet row fixedFeeAdjustment to $expectedMappedValue when the fee record entity fixedFeeAdjustment $condition',
      ({ value, expectedMappedValue }) => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').withFixedFeeAdjustment(value).build();

        // Act
        const keyingSheetRow = mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity);

        // Assert
        expect(keyingSheetRow.fixedFeeAdjustment).toEqual(expectedMappedValue);
      },
    );

    it.each([
      { condition: 'is null', value: null, expectedMappedValue: null },
      { condition: 'is zero', value: 0, expectedMappedValue: { amount: 0, change: 'NONE' } },
      { condition: 'is positive', value: 100, expectedMappedValue: { amount: 100, change: 'INCREASE' } },
      { condition: 'is negative', value: -100, expectedMappedValue: { amount: 100, change: 'DECREASE' } },
    ])(
      'sets the keying sheet row principalBalanceAdjustment to $expectedMappedValue when the fee record entity principalBalanceAdjustment $condition',
      ({ value, expectedMappedValue }) => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withStatus('READY_TO_KEY')
          .withPrincipalBalanceAdjustment(value)
          .build();

        // Act
        const keyingSheetRow = mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity);

        // Assert
        expect(keyingSheetRow.principalBalanceAdjustment).toEqual(expectedMappedValue);
      },
    );

    it('does not set the keying sheet row feePayments field', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build();

      // Act
      const keyingSheetRow = mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity);

      // Assert
      expect(keyingSheetRow).not.toHaveProperty('feePayments');
    });
  });

  describe('mapPaymentEntityToKeyingSheetFeePayment', () => {
    it('maps the payment entity date received, amount and currency', () => {
      // Arrange
      const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(123.45).withDateReceived(new Date('2024-05-06')).build();

      // Act
      const feePayment = mapPaymentEntityToKeyingSheetFeePayment(paymentEntity);

      // Assert
      expect(feePayment.currency).toBe<Currency>('GBP');
      expect(feePayment.amount).toEqual(123.45);
      expect(feePayment.dateReceived).toEqual(new Date('2024-05-06'));
    });
  });
});
