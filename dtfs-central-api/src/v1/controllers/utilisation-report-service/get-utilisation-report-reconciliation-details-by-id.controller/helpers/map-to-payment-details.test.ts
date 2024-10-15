import { when } from 'jest-when';
import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { createFeeRecordEntityPaymentGroupForSingleFeeRecord } from '../../../../../../test-helpers';
import { PaymentDetails } from '../../../../../types/utilisation-reports';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';
import * as helpersModule from '../../../../../helpers';
import { TfmUsersRepo } from '../../../../../repositories/tfm-users-repo';
import { mapToPaymentDetails } from './map-to-payment-details';

describe('mapToPaymentDetails', () => {
  const mockDate = new Date('2024-01');

  const findTfmUserSpy = jest.spyOn(TfmUsersRepo, 'findOneUserById');
  const getFeeRecordPaymentEntityGroupStatusSpy = jest.spyOn(helpersModule, 'getFeeRecordPaymentEntityGroupStatus');
  const getFeeRecordPaymentEntityGroupReconciliationDataSpy = jest.spyOn(helpersModule, 'getFeeRecordPaymentEntityGroupReconciliationData');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    findTfmUserSpy.mockRejectedValue('Some error');
    getFeeRecordPaymentEntityGroupReconciliationDataSpy.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should populate each of the groups with their respective group status', async () => {
    // Arrange
    const firstGroup: FeeRecordPaymentEntityGroup = {
      feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.TO_DO).build()],
      payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
    };
    const secondGroup: FeeRecordPaymentEntityGroup = {
      feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build()],
      payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
    };
    const thirdGroup: FeeRecordPaymentEntityGroup = {
      feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build()],
      payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
    };
    const groups = [firstGroup, secondGroup, thirdGroup];

    when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(firstGroup).mockReturnValue(FEE_RECORD_STATUS.TO_DO);
    when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(secondGroup).mockReturnValue(FEE_RECORD_STATUS.DOES_NOT_MATCH);
    when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(thirdGroup).mockReturnValue(FEE_RECORD_STATUS.READY_TO_KEY);

    // Act
    const result = await mapToPaymentDetails(groups);

    // Assert
    expect(result).toHaveLength(3);
    expect(result[0].status).toEqual(FEE_RECORD_STATUS.TO_DO);
    expect(result[1].status).toEqual(FEE_RECORD_STATUS.DOES_NOT_MATCH);
    expect(result[2].status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
  });

  describe('when a group has one payment and a multiple fee records', () => {
    it('should return only one payment details object', async () => {
      // Arrange
      const group: FeeRecordPaymentEntityGroup = {
        feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(utilisationReport()).build()],
        payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
      };

      // Act
      const result = await mapToPaymentDetails([group]);

      // Assert
      expect(result).toHaveLength(1);
    });

    it('should return the group with as many fee records as there are fee records in the supplied group', async () => {
      // Arrange
      const feeRecords = [FeeRecordEntityMockBuilder.forReport(utilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(utilisationReport()).build()];
      const group: FeeRecordPaymentEntityGroup = {
        feeRecords,
        payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
      };

      // Act
      const result = await mapToPaymentDetails([group]);

      // Assert
      expect(result[0].feeRecords).toHaveLength(2);
    });
  });

  describe('when populating groups with reconciliation data', () => {
    it('should populate each of the groups with their respective reconciliation data', async () => {
      // Arrange
      const firstGroup: FeeRecordPaymentEntityGroup = {
        feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.TO_DO).build()],
        payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
      };
      const secondGroup: FeeRecordPaymentEntityGroup = {
        feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build()],
        payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
      };
      const thirdGroup: FeeRecordPaymentEntityGroup = {
        feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build()],
        payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
      };
      const groups = [firstGroup, secondGroup, thirdGroup];

      when(getFeeRecordPaymentEntityGroupReconciliationDataSpy).calledWith(firstGroup).mockResolvedValue({});
      when(getFeeRecordPaymentEntityGroupReconciliationDataSpy)
        .calledWith(secondGroup)
        .mockResolvedValue({ dateReconciled: new Date('2024') });
      when(getFeeRecordPaymentEntityGroupReconciliationDataSpy)
        .calledWith(thirdGroup)
        .mockResolvedValue({ dateReconciled: new Date('2023'), reconciledByUser: { firstName: 'John', lastName: 'Smith' } });

      // Act
      const result = await mapToPaymentDetails(groups);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].dateReconciled).toBeUndefined();
      expect(result[0].reconciledByUser).toBeUndefined();
      expect(result[1].dateReconciled).toEqual(new Date('2024'));
      expect(result[1].reconciledByUser).toBeUndefined();
      expect(result[2].dateReconciled).toEqual(new Date('2023'));
      expect(result[2].reconciledByUser).toEqual({ firstName: 'John', lastName: 'Smith' });
    });
  });

  describe('when a group has no payments', () => {
    it('should return an empty array', async () => {
      // Arrange
      const group: FeeRecordPaymentEntityGroup = {
        feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).withId(1).build()],
        payments: [],
      };

      // Act
      const result = await mapToPaymentDetails([group]);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('when a group has multiple payments', () => {
    it('should throw an error', async () => {
      // Arrange
      const group: FeeRecordPaymentEntityGroup = {
        feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).withId(1).build()],
        payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build(), PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
      };

      // Act / Assert
      await expect(mapToPaymentDetails([group])).rejects.toThrow(
        new Error('Error mapping payments to payment details - groups must have at most one payment.'),
      );
    });
  });

  describe('when given fee record entity groups with and without payments', () => {
    it('should return the expected payment details groups', async () => {
      // Arrange
      const currency = CURRENCY.GBP;
      const amount = 100;

      const groupWithNoPayments = createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, FEE_RECORD_STATUS.TO_DO, currency, amount);
      const groupWithOnePayment: FeeRecordPaymentEntityGroup = {
        ...createFeeRecordEntityPaymentGroupForSingleFeeRecord(2, FEE_RECORD_STATUS.MATCH, currency, amount),
        payments: [PaymentEntityMockBuilder.forCurrency(currency).withId(11).withAmount(amount).build()],
      };
      const groups = [groupWithNoPayments, groupWithOnePayment];

      when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(groupWithNoPayments).mockReturnValue(FEE_RECORD_STATUS.TO_DO);
      when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(groupWithOnePayment).mockReturnValue(FEE_RECORD_STATUS.MATCH);

      // Act
      const result = await mapToPaymentDetails(groups);

      // Assert
      expect(result).toEqual<PaymentDetails[]>([
        {
          feeRecords: [
            {
              id: 2,
              facilityId: '12345678',
              exporter: 'test exporter',
              reportedFees: { currency, amount },
              reportedPayments: { currency, amount },
            },
          ],
          payment: {
            currency,
            amount,
            id: 11,
            dateReceived: mockDate,
          },
          status: FEE_RECORD_STATUS.MATCH,
        },
      ]);
    });
  });

  function utilisationReport(): UtilisationReportEntity {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});
