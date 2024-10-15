import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  PaymentEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { PremiumPaymentsGroup } from '../../../../../types/utilisation-reports';
import {
  mapGroupWithNoPaymentsToPremiumPaymentsGroup,
  mapGroupWithPaymentsToPremiumPaymentsGroup,
  mapToPremiumPaymentsGroups,
} from './map-to-premium-payments-groups';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';
import * as helpersModule from '../../../../../helpers';
import { TfmUsersRepo } from '../../../../../repositories/tfm-users-repo';

describe('map-to-premium-payments-groups helper', () => {
  const mockDate = new Date('2024-01');

  const findTfmUserSpy = jest.spyOn(TfmUsersRepo, 'findOneUserById');
  const getFeeRecordPaymentEntityGroupStatusSpy = jest.spyOn(helpersModule, 'getFeeRecordPaymentEntityGroupStatus');

  const currency = CURRENCY.GBP;
  const amount = 100;

  const createFeeRecordEntityPaymentGroupForSingleFeeRecord = (id: number, status: FeeRecordStatus): FeeRecordPaymentEntityGroup => ({
    feeRecords: [
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withId(id)
        .withStatus(status)
        .withFeesPaidToUkefForThePeriod(amount)
        .withFeesPaidToUkefForThePeriodCurrency(currency)
        .withPaymentCurrency(currency)
        .build(),
    ],
    payments: [],
  });

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    findTfmUserSpy.mockRejectedValue('Some error');
    getFeeRecordPaymentEntityGroupStatusSpy.mockReturnValue(FEE_RECORD_STATUS.TO_DO);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('mapGroupWithNoPaymentsToPremiumPaymentsGroup', () => {
    describe('when a group has a single fee record with no payments', () => {
      it('should return the group with a single fee record', () => {
        // Arrange
        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group = createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, groupStatus);

        // Act
        const result = mapGroupWithNoPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.feeRecords).toHaveLength(1);
      });

      it('should set the totalReportedPayments to the same value as the fee record reported payments', () => {
        // Arrange
        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group = createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, groupStatus);

        // Act
        const result = mapGroupWithNoPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.totalReportedPayments).toEqual({ currency, amount });
      });

      it('should set the paymentsReceived to null', () => {
        // Arrange
        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group = createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, groupStatus);

        // Act
        const result = mapGroupWithNoPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.paymentsReceived).toBeNull();
      });

      it('should set the totalPaymentsReceived to null', () => {
        // Arrange
        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group = createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, groupStatus);

        // Act
        const result = mapGroupWithNoPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.totalPaymentsReceived).toBeNull();
      });

      it('should set the status to the status of the fee record', () => {
        // Arrange
        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group = createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, groupStatus);

        // Act
        const result = mapGroupWithNoPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.status).toEqual(groupStatus);
      });
    });

    describe('when a group has multiple fee records but no payments', () => {
      it('should throw an error', () => {
        // Arrange
        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [
            FeeRecordEntityMockBuilder.forReport(utilisationReport()).withId(1).build(),
            FeeRecordEntityMockBuilder.forReport(utilisationReport()).withId(2).build(),
            FeeRecordEntityMockBuilder.forReport(utilisationReport()).withId(3).build(),
          ],
          payments: [],
        };

        // Act / Assert
        expect(() => mapGroupWithNoPaymentsToPremiumPaymentsGroup(group, groupStatus)).toThrow(
          new Error('Fee record payment entity group cannot have more than one fee record if there are no payments'),
        );
      });
    });
  });

  describe('mapGroupWithPaymentsToPremiumPaymentsGroup', () => {
    describe('when a group has a multiple fee records and payments', () => {
      it('should return the group with as many fee records as there are fee records in the supplied group', () => {
        // Arrange
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(utilisationReport()).build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(utilisationReport()).build();

        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
        };

        // Act
        const result = mapGroupWithPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.feeRecords).toHaveLength(2);
      });

      it('should set the totalReportedPayments to the sum of the fee record reported payments', () => {
        // Arrange
        const testValues = {
          feeRecordOne: {
            feesPaidToUkefForThePeriod: 100,
            paymentCurrency: CURRENCY.GBP,
            feesPaidToUkefForThePeriodCurrency: CURRENCY.GBP,
          },
          feeRecordTwo: {
            feesPaidToUkefForThePeriod: 400,
            paymentCurrency: CURRENCY.GBP,
            feesPaidToUkefForThePeriodCurrency: CURRENCY.JPY,
            paymentExchangeRate: 2,
          },
          // Fee record one has it's fees paid currency matching the payment currency so reported fee is just 100
          // Fee record two has it's fees paid in a different currency to payment currency so we should convert
          // So fee record two's reported fee = 400 / 2 = 200
          // So the total = 100 + 200 = 300
          expectedTotalReportedPaymentAmount: 300,
        };

        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(utilisationReport())
          .withFeesPaidToUkefForThePeriod(testValues.feeRecordOne.feesPaidToUkefForThePeriod)
          .withFeesPaidToUkefForThePeriodCurrency(testValues.feeRecordOne.feesPaidToUkefForThePeriodCurrency)
          .withPaymentCurrency(testValues.feeRecordOne.paymentCurrency)
          .build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(utilisationReport())
          .withFeesPaidToUkefForThePeriod(testValues.feeRecordTwo.feesPaidToUkefForThePeriod)
          .withFeesPaidToUkefForThePeriodCurrency(testValues.feeRecordTwo.feesPaidToUkefForThePeriodCurrency)
          .withPaymentCurrency(testValues.feeRecordTwo.paymentCurrency)
          .withPaymentExchangeRate(testValues.feeRecordTwo.paymentExchangeRate)
          .build();

        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(5000000).build()],
        };

        // Act
        const result = mapGroupWithPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.totalReportedPayments).toEqual({ currency: CURRENCY.GBP, amount: testValues.expectedTotalReportedPaymentAmount });
      });

      it('should return the group with as many paymentsReceived as there are payments in the supplied group', () => {
        // Arrange
        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(utilisationReport()).build()],
          payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build(), PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
        };

        // Act
        const result = mapGroupWithPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.paymentsReceived).toHaveLength(2);
      });

      it('should set the totalPaymentsReceived to the total of the payment amounts', () => {
        // Arrange
        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [FeeRecordEntityMockBuilder.forReport(utilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(utilisationReport()).build()],
          payments: [
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(200).build(),
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(300).build(),
          ],
        };

        // Act
        const result = mapGroupWithPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.totalPaymentsReceived).toEqual({ currency: CURRENCY.GBP, amount: 500 });
      });

      it('should set the status to the supplied group status', () => {
        // Arrange
        const groupStatus = FEE_RECORD_STATUS.TO_DO;
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(groupStatus).build();

        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne],
          payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
        };

        // Act
        const result = mapGroupWithPaymentsToPremiumPaymentsGroup(group, groupStatus);

        // Assert
        expect(result.status).toEqual(groupStatus);
      });
    });
  });

  describe('mapToPremiumPaymentsGroups', () => {
    it('should return as many fee record payment groups as there are fee record payment entity groups', () => {
      // Arrange
      const groups = [
        createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, FEE_RECORD_STATUS.TO_DO),
        createFeeRecordEntityPaymentGroupForSingleFeeRecord(2, FEE_RECORD_STATUS.TO_DO),
        createFeeRecordEntityPaymentGroupForSingleFeeRecord(3, FEE_RECORD_STATUS.TO_DO),
      ];

      // Act
      const result = mapToPremiumPaymentsGroups(groups);

      // Assert
      expect(result).toHaveLength(groups.length);
    });

    it('should populate each of the groups with their respective group status', () => {
      // Arrange
      const firstGroup = createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, FEE_RECORD_STATUS.TO_DO);
      const secondGroup = createFeeRecordEntityPaymentGroupForSingleFeeRecord(2, FEE_RECORD_STATUS.DOES_NOT_MATCH);
      const thirdGroup = createFeeRecordEntityPaymentGroupForSingleFeeRecord(3, FEE_RECORD_STATUS.READY_TO_KEY);
      const groups = [firstGroup, secondGroup, thirdGroup];

      when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(firstGroup).mockReturnValue(FEE_RECORD_STATUS.TO_DO);
      when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(secondGroup).mockReturnValue(FEE_RECORD_STATUS.DOES_NOT_MATCH);
      when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(thirdGroup).mockReturnValue(FEE_RECORD_STATUS.READY_TO_KEY);

      // Act
      const result = mapToPremiumPaymentsGroups(groups);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].status).toEqual(FEE_RECORD_STATUS.TO_DO);
      expect(result[1].status).toEqual(FEE_RECORD_STATUS.DOES_NOT_MATCH);
      expect(result[2].status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
    });

    it('should return the expected groups', () => {
      // Arrange
      const groupWithNoPayments = createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, FEE_RECORD_STATUS.TO_DO);
      const groupWithPayments: FeeRecordPaymentEntityGroup = {
        ...createFeeRecordEntityPaymentGroupForSingleFeeRecord(2, FEE_RECORD_STATUS.MATCH),
        payments: [PaymentEntityMockBuilder.forCurrency(currency).withAmount(amount).build()],
      };
      const groups = [groupWithNoPayments, groupWithPayments];

      when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(groupWithNoPayments).mockReturnValue(FEE_RECORD_STATUS.TO_DO);
      when(getFeeRecordPaymentEntityGroupStatusSpy).calledWith(groupWithPayments).mockReturnValue(FEE_RECORD_STATUS.MATCH);

      // Act
      const result = mapToPremiumPaymentsGroups(groups);

      // Assert
      expect(result).toEqual<PremiumPaymentsGroup[]>([
        {
          feeRecords: [
            {
              id: 1,
              facilityId: '12345678',
              exporter: 'test exporter',
              reportedFees: { currency, amount },
              reportedPayments: { currency, amount },
            },
          ],
          totalReportedPayments: { currency, amount },
          paymentsReceived: null,
          totalPaymentsReceived: null,
          status: FEE_RECORD_STATUS.TO_DO,
        },
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
          totalReportedPayments: { currency, amount },
          paymentsReceived: [
            {
              currency,
              amount,
              id: 1,
              dateReceived: mockDate,
            },
          ],
          totalPaymentsReceived: { currency, amount },
          status: FEE_RECORD_STATUS.MATCH,
        },
      ]);
    });
  });

  function utilisationReport(): UtilisationReportEntity {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});
