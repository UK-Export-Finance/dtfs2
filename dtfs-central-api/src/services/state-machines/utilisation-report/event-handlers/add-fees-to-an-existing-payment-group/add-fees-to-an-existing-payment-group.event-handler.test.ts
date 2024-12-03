import { EntityManager } from 'typeorm';
import {
  UtilisationReportEntityMockBuilder,
  CURRENCY,
  DbRequestSource,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntity,
  PaymentEntityMockBuilder,
  PaymentEntity,
  REQUEST_PLATFORM_TYPE,
  RECONCILIATION_IN_PROGRESS,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportAddFeesToAnExistingPaymentGroupEvent } from './add-fees-to-an-existing-payment-group.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';

jest.mock('../helpers');

describe('handleUtilisationReportAddFeesToAnExistingPaymentGroupEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: REQUEST_PLATFORM_TYPE.TFM,
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const aReconciliationInProgressReport = () => UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

  const aMockEventHandler = () => jest.fn();
  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  const createFeeRecordsAndMocks = (utilisationReport: UtilisationReportEntity, feeRecordIds: number[]) => {
    const feeRecords = feeRecordIds.map((id) => FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(id).build());
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    return { feeRecords, eventHandlers, feeRecordStateMachines };
  };

  beforeEach(() => {
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine(aMockEventHandler()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('updates the payments with the fee records to add and saves the payments', async () => {
    // Arrange
    const utilisationReport = aReconciliationInProgressReport();

    const feeRecordIds = [1, 2, 3, 4];
    const { feeRecords, feeRecordStateMachines } = createFeeRecordsAndMocks(utilisationReport, feeRecordIds);

    const expectedFeeRecordsToAdd = [feeRecords[2]];
    const expectedExistingFeeRecordsInPaymentGroup = [feeRecords[3]];
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

    const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(1).withFeeRecords([feeRecords[0]]).build();
    const secondPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(2).withFeeRecords([feeRecords[1]]).build();

    const payments = [firstPayment, secondPayment];

    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(false);

    // Act
    await handleUtilisationReportAddFeesToAnExistingPaymentGroupEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsToAdd: expectedFeeRecordsToAdd,
      existingFeeRecordsInPaymentGroup: expectedExistingFeeRecordsInPaymentGroup,
      payments,
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(PaymentEntity, {
      ...firstPayment,
      feeRecords: [feeRecords[0], feeRecords[2]],
    });
    expect(mockSave).toHaveBeenCalledWith(PaymentEntity, {
      ...secondPayment,
      feeRecords: [feeRecords[1], feeRecords[2]],
    });
  });

  it.each([
    { feeRecordsAndPaymentsMatch: true, testNameSuffix: 'the fee records match the payments' },
    { feeRecordsAndPaymentsMatch: false, testNameSuffix: 'the fee records do not match the payments' },
  ])(
    "calls the fee record state machine 'PAYMENT_ADDED' event handler for the fee records to add with 'feeRecordsAndPaymentsMatch' set to '$feeRecordsAndPaymentsMatch' if $testNameSuffix after the new fee records have been added",
    async ({ feeRecordsAndPaymentsMatch }) => {
      // Arrange
      const utilisationReport = aReconciliationInProgressReport();

      const feeRecordIds = [1, 2, 3];
      const { feeRecords, eventHandlers, feeRecordStateMachines } = createFeeRecordsAndMocks(utilisationReport, feeRecordIds);

      const expectedFeeRecordsToAdd = [feeRecords[0], feeRecords[1]];
      const expectedExistingFeeRecordsInPaymentGroup = [feeRecords[2]];
      jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

      jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(feeRecordsAndPaymentsMatch);

      // Act
      await handleUtilisationReportAddFeesToAnExistingPaymentGroupEvent(utilisationReport, {
        transactionEntityManager: mockEntityManager,
        feeRecordsToAdd: expectedFeeRecordsToAdd,
        existingFeeRecordsInPaymentGroup: expectedExistingFeeRecordsInPaymentGroup,
        payments: [],
        requestSource,
      });

      // Assert
      expectedFeeRecordsToAdd.forEach(({ id }) => {
        const eventHandler = eventHandlers[id];
        expect(eventHandler).toHaveBeenCalledWith({
          type: 'PAYMENT_ADDED',
          payload: {
            transactionEntityManager: mockEntityManager,
            feeRecordsAndPaymentsMatch,
            requestSource,
          },
        });
      });
    },
  );

  it.each([
    { feeRecordsAndPaymentsMatch: true, testNameSuffix: 'the fee records match the payments' },
    { feeRecordsAndPaymentsMatch: false, testNameSuffix: 'the fee records do not match the payments' },
  ])(
    "calls the fee record state machine 'OTHER_FEE_ADDED_TO_PAYMENT_GROUP' event handler for the existing fee records with 'feeRecordsAndPaymentsMatch' set to '$feeRecordsAndPaymentsMatch' if $testNameSuffix after the new fee records have been added",
    async ({ feeRecordsAndPaymentsMatch }) => {
      // Arrange
      const utilisationReport = aReconciliationInProgressReport();

      const feeRecordIds = [1, 2, 3];
      const { feeRecords, eventHandlers, feeRecordStateMachines } = createFeeRecordsAndMocks(utilisationReport, feeRecordIds);

      const expectedFeeRecordsToAdd = [feeRecords[0], feeRecords[1]];
      const expectedExistingFeeRecordsInPaymentGroup = [feeRecords[2]];
      jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

      jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(feeRecordsAndPaymentsMatch);

      // Act
      await handleUtilisationReportAddFeesToAnExistingPaymentGroupEvent(utilisationReport, {
        transactionEntityManager: mockEntityManager,
        feeRecordsToAdd: expectedFeeRecordsToAdd,
        existingFeeRecordsInPaymentGroup: expectedExistingFeeRecordsInPaymentGroup,
        payments: [],
        requestSource,
      });

      // Assert
      expectedExistingFeeRecordsInPaymentGroup.forEach(({ id }) => {
        const eventHandler = eventHandlers[id];
        expect(eventHandler).toHaveBeenCalledWith({
          type: 'OTHER_FEE_ADDED_TO_PAYMENT_GROUP',
          payload: {
            transactionEntityManager: mockEntityManager,
            feeRecordsAndPaymentsMatch,
            requestSource,
          },
        });
      });
    },
  );
});
