import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import { EntityManager } from 'typeorm';
import { when } from 'jest-when';
import {
  CURRENCY,
  FeeRecordEntity,
  PENDING_RECONCILIATION
} from '@ukef/dtfs2-common';
import { feeRecordsMatchAttachedPayments } from './fee-records-match-attached-payments';
import { feeRecordsAndPaymentsMatch } from '../../../../../helpers';

jest.mock('../../../../../helpers/fee-record-matching');

describe('feeRecordsMatchAttachedPayments', () => {
  const mockFindOneOrFail = jest.fn();
  const mockEntityManager = {
    findOneOrFail: mockFindOneOrFail,
  } as unknown as EntityManager;

  beforeEach(() => {
    mockFindOneOrFail.mockRejectedValue(new Error('Some error'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns true when the payments attached to the fee records have the same total payments', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
    const payments = [
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(1).build(),
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(2).build(),
    ];
    const feeRecordsWithoutTheirAttachedPayments = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withPayments([]).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withPayments([]).build(),
    ];
    const feeRecordOneWithPayments = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withPayments(payments).build();

    when(mockFindOneOrFail)
      .calledWith(FeeRecordEntity, {
        where: { id: feeRecordsWithoutTheirAttachedPayments[0].id },
        relations: { payments: true },
      })
      .mockResolvedValue(feeRecordOneWithPayments);
    jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(true);

    // Act
    const result = await feeRecordsMatchAttachedPayments(feeRecordsWithoutTheirAttachedPayments, mockEntityManager);

    // Assert
    expect(feeRecordsAndPaymentsMatch).toHaveBeenCalledWith(feeRecordsWithoutTheirAttachedPayments, feeRecordOneWithPayments.payments, mockEntityManager);
    expect(result).toEqual(true);
  });

  it('returns false when the payments attached to the fee records do not have the same total payments', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
    const payments = [
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(1).build(),
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(2).build(),
    ];
    const feeRecordsWithoutTheirAttachedPayments = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withPayments([]).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withPayments([]).build(),
    ];
    const feeRecordOneWithPayments = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withPayments(payments).build();

    when(mockFindOneOrFail)
      .calledWith(FeeRecordEntity, {
        where: { id: feeRecordsWithoutTheirAttachedPayments[0].id },
        relations: { payments: true },
      })
      .mockResolvedValue(feeRecordOneWithPayments);
    jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(false);

    // Act
    const result = await feeRecordsMatchAttachedPayments(feeRecordsWithoutTheirAttachedPayments, mockEntityManager);

    // Assert
    expect(feeRecordsAndPaymentsMatch).toHaveBeenCalledWith(feeRecordsWithoutTheirAttachedPayments, feeRecordOneWithPayments.payments, mockEntityManager);
    expect(result).toEqual(false);
  });
});
