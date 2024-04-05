import difference from 'lodash/difference';
import { EntityManager } from 'typeorm';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntityMockBuilder, MOCK_AZURE_FILE_INFO, DbRequestSource } from '@ukef/dtfs2-common';
import {
  handleUtilisationReportDueReportInitialisedEvent,
  handleUtilisationReportFeeRecordKeyedEvent,
  handleUtilisationReportManuallySetCompletedEvent,
  handleUtilisationReportManuallySetIncompleteEvent,
  handleUtilisationReportPaymentAddedToFeeRecordEvent,
  handleUtilisationReportPaymentRemovedFromFeeRecordEvent,
  handleUtilisationReportReportUploadedEvent,
} from './event-handlers';
import { UtilisationReportRepo } from '../../../repositories/utilisation-reports-repo';
import { UtilisationReportStateMachine } from './utilisation-report.state-machine';
import { UTILISATION_REPORT_EVENT_TYPE, UTILISATION_REPORT_EVENT_TYPES, UtilisationReportEventType } from './event/utilisation-report.event-type';
import { InvalidStateMachineTransitionError } from '../../../errors';

jest.mock('./event-handlers');

describe('UtilisationReportStateMachine', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const expectInvalidStateMachineTransitionError = async (stateMachine: UtilisationReportStateMachine, eventType: UtilisationReportEventType) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - expect payload to be invalid when type is variable.
    await expect(stateMachine.handleEvent({ type: eventType, payload: null })).rejects.toThrow(InvalidStateMachineTransitionError);
  };

  describe('when no report yet exists in the database', () => {
    beforeEach(() => {
      jest.spyOn(UtilisationReportRepo, 'findOneByBankIdAndReportPeriod').mockResolvedValue(null);
    });

    const BANK_ID = '956';
    const REPORT_PERIOD = {
      start: { month: 12, year: 2023 },
      end: { month: 1, year: 2024 },
    };

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.DUE_REPORT_INITIALISED}' event`, async () => {
      // Arrange
      const stateMachine = await UtilisationReportStateMachine.forBankIdAndReportPeriod(BANK_ID, REPORT_PERIOD);

      // Act
      await stateMachine.handleEvent({
        type: 'DUE_REPORT_INITIALISED',
        payload: { bankId: BANK_ID, reportPeriod: REPORT_PERIOD },
      });

      // Assert
      expect(handleUtilisationReportDueReportInitialisedEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_UNINITIALISED_REPORT_EVENT_TYPES = [UTILISATION_REPORT_EVENT_TYPE.DUE_REPORT_INITIALISED];

    it.each(difference(UTILISATION_REPORT_EVENT_TYPES, VALID_UNINITIALISED_REPORT_EVENT_TYPES))(
      "throws an 'InvalidStateMachineTransitionError' for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = await UtilisationReportStateMachine.forBankIdAndReportPeriod(BANK_ID, REPORT_PERIOD);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });

  describe(`when report is in '${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED}' status`, () => {
    // Arrange
    const REPORT_NOT_RECEIVED_REPORT = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.REPORT_UPLOADED}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(REPORT_NOT_RECEIVED_REPORT);
      const userId = '5ce819935e539c343f141ece';

      // Act
      await stateMachine.handleEvent({
        type: 'REPORT_UPLOADED',
        payload: {
          azureFileInfo: MOCK_AZURE_FILE_INFO,
          reportCsvData: [],
          uploadedByUserId: userId,
          requestSource: { platform: 'PORTAL', userId },
        },
      });

      // Assert
      expect(handleUtilisationReportReportUploadedEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_REPORT_NOT_RECEIVED_EVENT_TYPES = [UTILISATION_REPORT_EVENT_TYPE.REPORT_UPLOADED];

    it.each(difference(UTILISATION_REPORT_EVENT_TYPES, VALID_REPORT_NOT_RECEIVED_EVENT_TYPES))(
      "throws an 'InvalidStateMachineTransitionError' for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = UtilisationReportStateMachine.forReport(REPORT_NOT_RECEIVED_REPORT);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });

  describe(`when report is in '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}' status`, () => {
    const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.PAYMENT_ADDED_TO_FEE_RECORD}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(PENDING_RECONCILIATION_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'PAYMENT_ADDED_TO_FEE_RECORD',
        payload: { feeRecordId: 1, paymentId: 2 },
      });

      // Assert
      expect(handleUtilisationReportPaymentAddedToFeeRecordEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_COMPLETED}' event`, async () => {
      // Arrange
      const requestSource: DbRequestSource = {
        platform: 'TFM',
        userId: 'abc123',
      };
      const transactionEntityManager = {} as unknown as EntityManager;
      const stateMachine = UtilisationReportStateMachine.forReport(PENDING_RECONCILIATION_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'MANUALLY_SET_COMPLETED',
        payload: {
          requestSource,
          transactionEntityManager,
        },
      });

      // Assert
      expect(handleUtilisationReportManuallySetCompletedEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_PENDING_RECONCILIATION_EVENT_TYPES = [
      UTILISATION_REPORT_EVENT_TYPE.PAYMENT_ADDED_TO_FEE_RECORD,
      UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_COMPLETED,
    ];

    it.each(difference(UTILISATION_REPORT_EVENT_TYPES, VALID_PENDING_RECONCILIATION_EVENT_TYPES))(
      "throws an 'InvalidStateMachineTransitionError' for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = UtilisationReportStateMachine.forReport(PENDING_RECONCILIATION_REPORT);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });

  describe(`when report is in '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS}' status`, () => {
    const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.PAYMENT_ADDED_TO_FEE_RECORD}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'PAYMENT_ADDED_TO_FEE_RECORD',
        payload: { feeRecordId: 1, paymentId: 2 },
      });

      // Assert
      expect(handleUtilisationReportPaymentAddedToFeeRecordEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.PAYMENT_REMOVED_FROM_FEE_RECORD}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'PAYMENT_REMOVED_FROM_FEE_RECORD',
        payload: { feeRecordId: 1, paymentId: 2 },
      });

      // Assert
      expect(handleUtilisationReportPaymentRemovedFromFeeRecordEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.FEE_RECORD_KEYED}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'FEE_RECORD_KEYED',
        payload: { feeRecordId: 1 },
      });

      // Assert
      expect(handleUtilisationReportFeeRecordKeyedEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_RECONCILIATION_IN_PROGRESS_EVENT_TYPES = [
      UTILISATION_REPORT_EVENT_TYPE.PAYMENT_ADDED_TO_FEE_RECORD,
      UTILISATION_REPORT_EVENT_TYPE.PAYMENT_REMOVED_FROM_FEE_RECORD,
      UTILISATION_REPORT_EVENT_TYPE.FEE_RECORD_KEYED,
    ];

    it.each(difference(UTILISATION_REPORT_EVENT_TYPES, VALID_RECONCILIATION_IN_PROGRESS_EVENT_TYPES))(
      "throws an 'InvalidStateMachineTransitionError' for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });

  describe(`when report is in '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}' status`, () => {
    const RECONCILIATION_COMPLETED_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').build();

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_INCOMPLETE}' event`, async () => {
      // Arrange
      const requestSource: DbRequestSource = {
        platform: 'TFM',
        userId: 'abc123',
      };
      const transactionEntityManager = {} as unknown as EntityManager;
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_COMPLETED_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'MANUALLY_SET_INCOMPLETE',
        payload: {
          requestSource,
          transactionEntityManager,
        },
      });

      // Assert
      expect(handleUtilisationReportManuallySetIncompleteEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_RECONCILIATION_COMPLETED_EVENT_TYPES = [UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_INCOMPLETE];

    it.each(difference(UTILISATION_REPORT_EVENT_TYPES, VALID_RECONCILIATION_COMPLETED_EVENT_TYPES))(
      "throws an 'InvalidStateMachineTransitionError' for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_COMPLETED_REPORT);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });
});
