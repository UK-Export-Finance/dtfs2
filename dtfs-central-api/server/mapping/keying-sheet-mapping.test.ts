import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import { difference } from 'lodash';
import {
  Currency,
  CURRENCY,
  FEE_RECORD_STATUS,
  KeyingSheetRowStatus
} from '@ukef/dtfs2-common';
import { mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments, mapPaymentEntityToKeyingSheetFeePayment } from './keying-sheet-mapping';

describe('keying sheet mapping', () => {
  describe('mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments', () => {
    const INVALID_FEE_RECORD_STATUSES = difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]);

    it.each(INVALID_FEE_RECORD_STATUSES)('throws an error when the fee record entity status is %s', (status) => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withStatus(status).build();

      // Act / Assert
      expect(() => mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity)).toThrow(Error);
    });

    it('maps the fee record READY_TO_KEY status to the keying sheet TO_DO status', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
        .build();

      // Act
      const keyingSheetRow = mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity);

      // Assert
      expect(keyingSheetRow.status).toBe<KeyingSheetRowStatus>('TO_DO');
    });

    it('maps the fee record RECONCILED status to the keying sheet DONE status', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .build();

      // Act
      const keyingSheetRow = mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity);

      // Assert
      expect(keyingSheetRow.status).toBe<KeyingSheetRowStatus>('DONE');
    });

    it('maps the fee record entity id, facility id, exporter and base currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
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

    it('does not set the keying sheet row feePayments field', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
        .build();

      // Act
      const keyingSheetRow = mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecordEntity);

      // Assert
      expect(keyingSheetRow).not.toHaveProperty('feePayments');
    });
  });

  describe('mapPaymentEntityToKeyingSheetFeePayment', () => {
    it('maps the payment entity date received, amount and currency', () => {
      // Arrange
      const paymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(123.45).withDateReceived(new Date('2024-05-06')).build();

      // Act
      const feePayment = mapPaymentEntityToKeyingSheetFeePayment(paymentEntity);

      // Assert
      expect(feePayment.currency).toBe<Currency>(CURRENCY.GBP);
      expect(feePayment.amount).toEqual(123.45);
      expect(feePayment.dateReceived).toEqual(new Date('2024-05-06'));
    });
  });
});
