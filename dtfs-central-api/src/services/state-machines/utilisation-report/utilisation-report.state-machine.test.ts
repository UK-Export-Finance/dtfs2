import difference from 'lodash/difference';
import { EntityManager } from 'typeorm';
import {
  REQUEST_PLATFORM_TYPE,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  MOCK_AZURE_FILE_INFO,
  DbRequestSource,
  PaymentEntity,
} from '@ukef/dtfs2-common';
import {
  handleUtilisationReportDueReportInitialisedEvent,
  handleUtilisationReportGenerateKeyingDataEvent,
  handleUtilisationReportManuallySetCompletedEvent,
  handleUtilisationReportManuallySetIncompleteEvent,
  handleUtilisationReportAddAPaymentEvent,
  handleUtilisationReportReportUploadedEvent,
  handleUtilisationReportDeletePaymentEvent,
  handleUtilisationReportEditPaymentEvent,
  handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent,
  handleUtilisationReportMarkFeeRecordsAsReconciledEvent,
  handleUtilisationReportRemoveFeesFromPaymentGroupEvent,
  handleUtilisationReportAddFeesToAnExistingPaymentGroupEvent,
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
    const REPORT_NOT_RECEIVED_REPORT = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED).build();

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.REPORT_UPLOADED}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(REPORT_NOT_RECEIVED_REPORT);
      const userId = '5ce819935e539c343f141ece';
      const transactionEntityManager = {} as unknown as EntityManager;

      // Act
      await stateMachine.handleEvent({
        type: 'REPORT_UPLOADED',
        payload: {
          azureFileInfo: MOCK_AZURE_FILE_INFO,
          reportCsvData: [],
          uploadedByUserId: userId,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId },
          transactionEntityManager,
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
    const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.ADD_A_PAYMENT}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(PENDING_RECONCILIATION_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'ADD_A_PAYMENT',
        payload: {
          transactionEntityManager: {} as unknown as EntityManager,
          feeRecords: [],
          paymentDetails: {
            currency: 'GBP',
            amount: 100,
            dateReceived: new Date(),
            reference: 'A payment reference',
          },
          requestSource: {
            platform: 'TFM',
            userId: 'abc123',
          },
        },
      });

      // Assert
      expect(handleUtilisationReportAddAPaymentEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.GENERATE_KEYING_DATA}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(PENDING_RECONCILIATION_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAtMatchStatusWithPayments: [],
          requestSource: { platform: 'TFM', userId: 'abc123' },
        },
      });

      // Assert
      expect(handleUtilisationReportGenerateKeyingDataEvent).toHaveBeenCalledTimes(1);
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
      UTILISATION_REPORT_EVENT_TYPE.ADD_A_PAYMENT,
      UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_COMPLETED,
      UTILISATION_REPORT_EVENT_TYPE.GENERATE_KEYING_DATA,
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

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.ADD_A_PAYMENT}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'ADD_A_PAYMENT',
        payload: {
          transactionEntityManager: {} as unknown as EntityManager,
          feeRecords: [],
          paymentDetails: {
            currency: 'GBP',
            amount: 100,
            dateReceived: new Date(),
            reference: 'A payment reference',
          },
          requestSource: {
            platform: 'TFM',
            userId: 'abc123',
          },
        },
      });

      // Assert
      expect(handleUtilisationReportAddAPaymentEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.DELETE_PAYMENT}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'DELETE_PAYMENT',
        payload: {
          transactionEntityManager: {} as EntityManager,
          paymentId: 1,
          requestSource: { platform: 'TFM', userId: 'abc123' },
        },
      });

      // Assert
      expect(handleUtilisationReportDeletePaymentEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.GENERATE_KEYING_DATA}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsAtMatchStatusWithPayments: [],
          requestSource: { platform: 'TFM', userId: 'abc123' },
        },
      });

      // Assert
      expect(handleUtilisationReportGenerateKeyingDataEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.EDIT_PAYMENT}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'EDIT_PAYMENT',
        payload: {
          transactionEntityManager: {} as EntityManager,
          payment: {} as PaymentEntity,
          feeRecords: [],
          paymentAmount: 100,
          datePaymentReceived: new Date(),
          paymentReference: undefined,
          requestSource: { platform: 'TFM', userId: 'abc123' },
        },
      });

      // Assert
      expect(handleUtilisationReportEditPaymentEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.REMOVE_FEES_FROM_PAYMENT_GROUP}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'REMOVE_FEES_FROM_PAYMENT_GROUP',
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsToRemove: [],
          otherFeeRecordsInGroup: [],
          requestSource: { platform: 'TFM', userId: 'abc123' },
        },
      });
      expect(handleUtilisationReportRemoveFeesFromPaymentGroupEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_READY_TO_KEY}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'MARK_FEE_RECORDS_AS_READY_TO_KEY',
        payload: {
          transactionEntityManager: {} as unknown as EntityManager,
          feeRecordsToMarkAsReadyToKey: [],
          requestSource: {
            platform: 'TFM',
            userId: 'abc123',
          },
        },
      });

      // Assert
      expect(handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_RECONCILED}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'MARK_FEE_RECORDS_AS_RECONCILED',
        payload: {
          transactionEntityManager: {} as unknown as EntityManager,
          feeRecordsToReconcile: [],
          reconciledByUserId: 'abc123',
          requestSource: {
            platform: 'TFM',
            userId: 'abc123',
          },
        },
      });

      // Assert
      expect(handleUtilisationReportMarkFeeRecordsAsReconciledEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP',
        payload: {
          transactionEntityManager: {} as EntityManager,
          feeRecordsToAdd: [],
          existingFeeRecordsInPaymentGroup: [],
          payments: [],
          requestSource: { platform: 'TFM', userId: 'abc123' },
        },
      });
      expect(handleUtilisationReportAddFeesToAnExistingPaymentGroupEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_RECONCILIATION_IN_PROGRESS_EVENT_TYPES = [
      UTILISATION_REPORT_EVENT_TYPE.ADD_A_PAYMENT,
      UTILISATION_REPORT_EVENT_TYPE.DELETE_PAYMENT,
      UTILISATION_REPORT_EVENT_TYPE.GENERATE_KEYING_DATA,
      UTILISATION_REPORT_EVENT_TYPE.EDIT_PAYMENT,
      UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_READY_TO_KEY,
      UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_RECONCILED,
      UTILISATION_REPORT_EVENT_TYPE.REMOVE_FEES_FROM_PAYMENT_GROUP,
      UTILISATION_REPORT_EVENT_TYPE.ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP,
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
    const RECONCILIATION_COMPLETED_REPORT = UtilisationReportEntityMockBuilder.forStatus(
      UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
    ).build();

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

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_READY_TO_KEY}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_COMPLETED_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'MARK_FEE_RECORDS_AS_READY_TO_KEY',
        payload: {
          transactionEntityManager: {} as unknown as EntityManager,
          feeRecordsToMarkAsReadyToKey: [],
          requestSource: {
            platform: 'TFM',
            userId: 'abc123',
          },
        },
      });

      // Assert
      expect(handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_RECONCILIATION_COMPLETED_EVENT_TYPES = [
      UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_INCOMPLETE,
      UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_READY_TO_KEY,
    ];

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
