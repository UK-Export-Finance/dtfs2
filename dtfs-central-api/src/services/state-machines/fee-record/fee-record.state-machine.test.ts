import difference from 'lodash/difference';
import { EntityManager } from 'typeorm';
import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import { InvalidStateMachineTransitionError } from '../../../errors';
import { FEE_RECORD_EVENT_TYPE, FEE_RECORD_EVENT_TYPES, FeeRecordEventType } from './event/fee-record.event-type';
import { FeeRecordStateMachine } from './fee-record.state-machine';
import { handleFeeRecordAddAPaymentEvent } from './event-handlers';

jest.mock('./event-handlers');

describe('FeeRecordStateMachine', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const expectInvalidStateMachineTransitionError = async (stateMachine: FeeRecordStateMachine, eventType: FeeRecordEventType) => {
    // @ts-expect-error - expect payload to be invalid when type is variable.
    await expect(stateMachine.handleEvent({ type: eventType, payload: null })).rejects.toThrow(InvalidStateMachineTransitionError);
  };

  const UPLOADED_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  describe(`when the fee record has the '${FEE_RECORD_STATUS.TO_DO}' status`, () => {
    // Arrange
    const TO_DO_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus('TO_DO').build();

    const VALID_TO_DO_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = ['ADD_A_PAYMENT'];
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

    it(`handles the '${FEE_RECORD_EVENT_TYPE.ADD_A_PAYMENT}' event`, async () => {
      // Arrange
      const stateMachine = FeeRecordStateMachine.forFeeRecord(TO_DO_FEE_RECORD);

      // Act
      await stateMachine.handleEvent({
        type: 'ADD_A_PAYMENT',
        payload: {
          transactionEntityManager: {} as unknown as EntityManager,
          status: 'DOES_NOT_MATCH',
          requestSource: { platform: 'TFM', userId: 'abc123' },
        },
      });

      // Assert
      expect(handleFeeRecordAddAPaymentEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe(`when the fee record has the '${FEE_RECORD_STATUS.MATCH}' status`, () => {
    // Arrange
    const MATCH_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus('MATCH').build();

    const VALID_MATCH_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [];
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
    const DOES_NOT_MATCH_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus('DOES_NOT_MATCH').build();

    const VALID_DOES_NOT_MATCH_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [];
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
    const READY_TO_KEY_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus('READY_TO_KEY').build();

    const VALID_READY_TO_KEY_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [];
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
    const RECONCILED_FEE_RECORD = FeeRecordEntityMockBuilder.forReport(UPLOADED_REPORT).withStatus('RECONCILED').build();

    const VALID_RECONCILED_FEE_RECORD_EVENT_TYPES: FeeRecordEventType[] = [];
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
