import difference from 'lodash/difference';
import { EntityManager } from 'typeorm';
import {
  FeeRecordEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  FEE_RECORD_STATUS,
  FeeRecordStatus,
  REQUEST_PLATFORM_TYPE,
  PENDING_RECONCILIATION,
  RECORD_CORRECTION_REASON,
  FeeRecordCorrectionEntityMockBuilder,
  anEmptyRecordCorrectionTransientFormData,
} from '@ukef/dtfs2-common';
import { InvalidStateMachineTransitionError } from '../../../errors';
import { FEE_RECORD_EVENT_TYPE, FEE_RECORD_EVENT_TYPES, FeeRecordEventType } from './event/fee-record.event-type';
import { FeeRecordStateMachine } from './fee-record.state-machine';
import {
  handleFeeRecordGenerateKeyingDataEvent,
  handleFeeRecordPaymentAddedEvent,
  handleFeeRecordPaymentDeletedEvent,
  handleFeeRecordPaymentEditedEvent,
  handleFeeRecordMarkAsReconciledEvent,
  handleFeeRecordMarkAsReadyToKeyEvent,
  handleFeeRecordRemoveFromPaymentGroupEvent,
  handleFeeRecordOtherFeeRemovedFromPaymentGroupEvent,
  handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent,
  handleFeeRecordCorrectionRequestedEvent,
  handleFeeRecordCorrectionReceivedEvent,
} from './event-handlers';

jest.mock('./event-handlers');

describe('FeeRecordStateMachine', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const expectInvalidStateMachineTransitionError = async (stateMachine: FeeRecordStateMachine, eventType: FeeRecordEventType) => {
    // @ts-expect-error - expect payload to be invalid when type is variable.
    await expect(stateMachine.handleEvent({ type: eventType, payload: null })).rejects.toThrow(InvalidStateMachineTransitionError);
  };

  const UPLOADED_REPORT = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();

  describe.each([FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.TO_DO_AMENDED])("when the fee record has the '%s' status", (toDoStatus: FeeRecordStatus) => {
    // Arrange
    const TO_DO_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus(toDoStatus).build();

    const VALID_TO_DO_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [FEE_RECORD_EVENT_TYPE.PAYMENT_ADDED, FEE_RECORD_EVENT_TYPE.CORRECTION_REQUESTED];
    const INVALID_TO_DO_FEE_RECORD_EVENT_TYPES = difference(FEE_RECORD_EVENT_TYPES, VALID_TO_DO_FEE_RECORD_EVENT_TYPES);

    if (INVALID_TO_DO_FEE_RECORD_EVENT_TYPES.length !== 0) {
      it.each(INVALID_TO_DO_FEE_RECORD_EVENT_TYPES)(
        "throws an 'InvalidStateMachineTransitionError' for event type %p",
        async (eventType: FeeRecordEventType) => {
          // Arrange
          const stateMachine = FeeRecordStateMachine.forFeeRecord(TO_DO_FEE_RECORD);

          // Act / Assert
          await expectInvalidStateMachineTransitionError(stateMachine, eventType);
        },
      );
    }

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.PAYMENT_ADDED}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(TO_DO_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.PAYMENT_ADDED,
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAndPaymentsMatch: true,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordPaymentAddedEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.CORRECTION_REQUESTED}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(TO_DO_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.CORRECTION_REQUESTED,
        payload: {
          transactionEntityManager: {} as EntityManager,
          requestedByUser: { id: '10000', firstName: 'Test', lastName: 'User' },
          reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT],
          additionalInfo: 'some additional information',
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
          bankTeamName: 'Payment Officer Team',
          bankTeamEmails: ['test@ukexportfinance.gov.uk'],
        },
      });

      // Assert
      expect(handleFeeRecordCorrectionRequestedEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe(`when the fee record has the '${FEE_RECORD_STATUS.PENDING_CORRECTION}' status`, () => {
    // Arrange
    const PENDING_CORRECTION_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();

    const VALID_PENDING_CORRECTION_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [FEE_RECORD_EVENT_TYPE.CORRECTION_RECEIVED];
    const INVALID_PENDING_CORRECTION_FEE_RECORD_EVENT_TYPES = difference(FEE_RECORD_EVENT_TYPES, VALID_PENDING_CORRECTION_FEE_RECORD_EVENT_TYPES);

    if (INVALID_PENDING_CORRECTION_FEE_RECORD_EVENT_TYPES.length !== 0) {
      it.each(INVALID_PENDING_CORRECTION_FEE_RECORD_EVENT_TYPES)(
        "throws an 'InvalidStateMachineTransitionError' for event type %p",
        async (eventType: FeeRecordEventType) => {
          // Arrange
          const stateMachine = FeeRecordStateMachine.forFeeRecord(PENDING_CORRECTION_FEE_RECORD);

          // Act / Assert
          await expectInvalidStateMachineTransitionError(stateMachine, eventType);
        },
      );
    }

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.CORRECTION_RECEIVED}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(PENDING_CORRECTION_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.CORRECTION_RECEIVED,
        payload: {
          transactionEntityManager: {} as EntityManager,
          correctionEntity: FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(PENDING_CORRECTION_FEE_RECORD, false).build(),
          correctionFormData: anEmptyRecordCorrectionTransientFormData(),
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordCorrectionReceivedEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe(`when the fee record has the '${FEE_RECORD_STATUS.MATCH}' status`, () => {
    // Arrange
    const MATCH_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus(FEE_RECORD_STATUS.MATCH).build();

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.PAYMENT_EDITED}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.PAYMENT_EDITED,
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAndPaymentsMatch: true,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordPaymentEditedEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.PAYMENT_DELETED}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.PAYMENT_DELETED,
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAndPaymentsMatch: true,
          hasAttachedPayments: false,
          hasCorrections: false,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordPaymentDeletedEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.GENERATE_KEYING_DATA}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.GENERATE_KEYING_DATA,
        payload: {
          transactionEntityManager: {} as EntityManager,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordGenerateKeyingDataEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.REMOVE_FROM_PAYMENT_GROUP}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.REMOVE_FROM_PAYMENT_GROUP,
        payload: {
          transactionEntityManager: {} as EntityManager,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordRemoveFromPaymentGroupEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP,
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAndPaymentsMatch: true,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordOtherFeeRemovedFromPaymentGroupEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_MATCH_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [
      FEE_RECORD_EVENT_TYPE.PAYMENT_DELETED,
      FEE_RECORD_EVENT_TYPE.PAYMENT_EDITED,
      FEE_RECORD_EVENT_TYPE.GENERATE_KEYING_DATA,
      FEE_RECORD_EVENT_TYPE.REMOVE_FROM_PAYMENT_GROUP,
      FEE_RECORD_EVENT_TYPE.OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP,
    ];
    const INVALID_MATCH_FEE_RECORD_EVENT_TYPES = difference(FEE_RECORD_EVENT_TYPES, VALID_MATCH_FEE_RECORD_EVENT_TYPES);

    if (INVALID_MATCH_FEE_RECORD_EVENT_TYPES.length !== 0) {
      it.each(INVALID_MATCH_FEE_RECORD_EVENT_TYPES)(
        "throws an 'InvalidStateMachineTransitionError' for event type %p",
        async (eventType: FeeRecordEventType) => {
          // Arrange
          const stateMachine = FeeRecordStateMachine.forFeeRecord(MATCH_FEE_RECORD);

          // Act / Assert
          await expectInvalidStateMachineTransitionError(stateMachine, eventType);
        },
      );
    }
  });

  describe(`when the fee record has the '${FEE_RECORD_STATUS.DOES_NOT_MATCH}' status`, () => {
    // Arrange
    const DOES_NOT_MATCH_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build();

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.PAYMENT_EDITED}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(DOES_NOT_MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.PAYMENT_EDITED,
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAndPaymentsMatch: true,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordPaymentEditedEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.PAYMENT_DELETED}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(DOES_NOT_MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.PAYMENT_DELETED,
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAndPaymentsMatch: true,
          hasAttachedPayments: false,
          hasCorrections: false,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordPaymentDeletedEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.PAYMENT_ADDED}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(DOES_NOT_MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.PAYMENT_ADDED,
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAndPaymentsMatch: true,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordPaymentAddedEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.REMOVE_FROM_PAYMENT_GROUP}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(DOES_NOT_MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.REMOVE_FROM_PAYMENT_GROUP,
        payload: {
          transactionEntityManager: {} as EntityManager,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordRemoveFromPaymentGroupEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(DOES_NOT_MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP,
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAndPaymentsMatch: true,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordOtherFeeRemovedFromPaymentGroupEvent).toHaveBeenCalledTimes(1);
    });

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.OTHER_FEE_ADDED_TO_PAYMENT_GROUP}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(DOES_NOT_MATCH_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.OTHER_FEE_ADDED_TO_PAYMENT_GROUP,
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAndPaymentsMatch: true,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_DOES_NOT_MATCH_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [
      FEE_RECORD_EVENT_TYPE.PAYMENT_ADDED,
      FEE_RECORD_EVENT_TYPE.PAYMENT_DELETED,
      FEE_RECORD_EVENT_TYPE.PAYMENT_EDITED,
      FEE_RECORD_EVENT_TYPE.REMOVE_FROM_PAYMENT_GROUP,
      FEE_RECORD_EVENT_TYPE.OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP,
      FEE_RECORD_EVENT_TYPE.OTHER_FEE_ADDED_TO_PAYMENT_GROUP,
    ];

    const INVALID_DOES_NOT_MATCH_FEE_RECORD_EVENT_TYPES = difference(FEE_RECORD_EVENT_TYPES, VALID_DOES_NOT_MATCH_FEE_RECORD_EVENT_TYPES);

    if (INVALID_DOES_NOT_MATCH_FEE_RECORD_EVENT_TYPES.length !== 0) {
      it.each(INVALID_DOES_NOT_MATCH_FEE_RECORD_EVENT_TYPES)(
        "throws an 'InvalidStateMachineTransitionError' for event type %p",
        async (eventType: FeeRecordEventType) => {
          // Arrange
          const stateMachine = FeeRecordStateMachine.forFeeRecord(DOES_NOT_MATCH_FEE_RECORD);

          // Act / Assert
          await expectInvalidStateMachineTransitionError(stateMachine, eventType);
        },
      );
    }
  });

  describe(`when the fee record has the '${FEE_RECORD_STATUS.READY_TO_KEY}' status`, () => {
    // Arrange
    const READY_TO_KEY_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build();

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.MARK_AS_RECONCILED}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(READY_TO_KEY_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.MARK_AS_RECONCILED,
        payload: {
          transactionEntityManager: {} as EntityManager,
          reconciledByUserId: 'abc123',
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordMarkAsReconciledEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_READY_TO_KEY_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [FEE_RECORD_EVENT_TYPE.MARK_AS_RECONCILED];
    const INVALID_READY_TO_KEY_FEE_RECORD_EVENT_TYPES = difference(FEE_RECORD_EVENT_TYPES, VALID_READY_TO_KEY_FEE_RECORD_EVENT_TYPES);

    if (INVALID_READY_TO_KEY_FEE_RECORD_EVENT_TYPES.length !== 0) {
      it.each(INVALID_READY_TO_KEY_FEE_RECORD_EVENT_TYPES)(
        "throws an 'InvalidStateMachineTransitionError' for event type %p",
        async (eventType: FeeRecordEventType) => {
          // Arrange
          const stateMachine = FeeRecordStateMachine.forFeeRecord(READY_TO_KEY_FEE_RECORD);

          // Act / Assert
          await expectInvalidStateMachineTransitionError(stateMachine, eventType);
        },
      );
    }
  });

  describe(`when the fee record has the '${FEE_RECORD_STATUS.RECONCILED}' status`, () => {
    // Arrange
    const RECONCILED_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus(FEE_RECORD_STATUS.RECONCILED).build();

    it(`should handle the '${FEE_RECORD_EVENT_TYPE.MARK_AS_READY_TO_KEY}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(RECONCILED_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: FEE_RECORD_EVENT_TYPE.MARK_AS_READY_TO_KEY,
        payload: {
          transactionEntityManager: {} as EntityManager,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordMarkAsReadyToKeyEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_RECONCILED_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [FEE_RECORD_EVENT_TYPE.MARK_AS_READY_TO_KEY];
    const INVALID_RECONCILED_FEE_RECORD_EVENT_TYPES = difference(FEE_RECORD_EVENT_TYPES, VALID_RECONCILED_FEE_RECORD_EVENT_TYPES);

    if (INVALID_RECONCILED_FEE_RECORD_EVENT_TYPES.length !== 0) {
      it.each(INVALID_RECONCILED_FEE_RECORD_EVENT_TYPES)(
        "throws an 'InvalidStateMachineTransitionError' for event type %p",
        async (eventType: FeeRecordEventType) => {
          // Arrange
          const stateMachine = FeeRecordStateMachine.forFeeRecord(RECONCILED_FEE_RECORD);

          // Act / Assert
          await expectInvalidStateMachineTransitionError(stateMachine, eventType);
        },
      );
    }
  });

  describe('when the fee record has an invalid status', () => {
    // Arrange
    const INVALID_FEE_RECORD_STATUS = 'INVALID_STATUS' as FeeRecordStatus;
    const INVALID_STATUS_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus(INVALID_FEE_RECORD_STATUS).build();

    const EXPECTED_ERROR = new Error(`Unexpected fee record status: '${INVALID_FEE_RECORD_STATUS}'`);

    it.each(FEE_RECORD_EVENT_TYPES)('throws an error for event type %p', async (eventType) => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(INVALID_STATUS_FEE_RECORD);

      // Act / Assert
      // @ts-expect-error - expect payload to be invalid when type is variable.
      await expect(stateMachine.handleEvent({ type: eventType, payload: null })).rejects.toThrow(EXPECTED_ERROR);
    });
  });
});
