import difference from 'lodash/difference';
import { MOCK_UTILISATION_REPORT_ENTITY, UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntity } from '@ukef/dtfs2-common';
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
import { UTILISATION_REPORT_EVENT_TYPE, UTILISATION_REPORT_EVENT_TYPES, UtilisationReportEventType } from './event/utilisation-report.event-type.ts';
import { InvalidStateMachineTransitionError } from '../../../errors';

jest.mock('./event-handlers');

jest.mock('../../../repositories/utilisation-reports-repo/utilisation-report-sql.repo');
const mockedUtilisationReportRepo = jest.mocked(UtilisationReportRepo);

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
      mockedUtilisationReportRepo.findOneByBankIdAndReportPeriod.mockResolvedValue(null);
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
      "throws an 'InvalidStateMachineTransitionError for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = await UtilisationReportStateMachine.forBankIdAndReportPeriod(BANK_ID, REPORT_PERIOD);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });

  describe(`when report is in '${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED}' status`, () => {
    const REPORT_NOT_RECEIVED_REPORT: UtilisationReportEntity = {
      ...MOCK_UTILISATION_REPORT_ENTITY,
      status: 'REPORT_NOT_RECEIVED',
    };

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.REPORT_UPLOADED}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(REPORT_NOT_RECEIVED_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'REPORT_UPLOADED',
        payload: { csvData: [] },
      });

      // Assert
      expect(handleUtilisationReportReportUploadedEvent).toHaveBeenCalledTimes(1);
    });

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_COMPLETED}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(REPORT_NOT_RECEIVED_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'MANUALLY_SET_COMPLETED',
      });

      // Assert
      expect(handleUtilisationReportManuallySetCompletedEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_REPORT_NOT_RECEIVED_EVENT_TYPES = [UTILISATION_REPORT_EVENT_TYPE.REPORT_UPLOADED, UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_COMPLETED];

    it.each(difference(UTILISATION_REPORT_EVENT_TYPES, VALID_REPORT_NOT_RECEIVED_EVENT_TYPES))(
      "throws an 'InvalidStateMachineTransitionError for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = UtilisationReportStateMachine.forReport(REPORT_NOT_RECEIVED_REPORT);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });

  describe(`when report is in '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}' status`, () => {
    const PENDING_RECONCILIATION_REPORT: UtilisationReportEntity = {
      ...MOCK_UTILISATION_REPORT_ENTITY,
      status: 'PENDING_RECONCILIATION',
    };

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
      const stateMachine = UtilisationReportStateMachine.forReport(PENDING_RECONCILIATION_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'MANUALLY_SET_COMPLETED',
      });

      // Assert
      expect(handleUtilisationReportManuallySetCompletedEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_PENDING_RECONCILIATION_EVENT_TYPES = [
      UTILISATION_REPORT_EVENT_TYPE.PAYMENT_ADDED_TO_FEE_RECORD,
      UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_COMPLETED,
    ];

    it.each(difference(UTILISATION_REPORT_EVENT_TYPES, VALID_PENDING_RECONCILIATION_EVENT_TYPES))(
      "throws an 'InvalidStateMachineTransitionError for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = UtilisationReportStateMachine.forReport(PENDING_RECONCILIATION_REPORT);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });

  describe(`when report is in '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS}' status`, () => {
    const RECONCILIATION_IN_PROGRESS_REPORT: UtilisationReportEntity = {
      ...MOCK_UTILISATION_REPORT_ENTITY,
      status: 'RECONCILIATION_IN_PROGRESS',
    };

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
      "throws an 'InvalidStateMachineTransitionError for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_IN_PROGRESS_REPORT);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });

  describe(`when report is in '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}' status`, () => {
    const RECONCILIATION_COMPLETED_REPORT: UtilisationReportEntity = {
      ...MOCK_UTILISATION_REPORT_ENTITY,
      status: 'RECONCILIATION_COMPLETED',
    };

    it(`handles the '${UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_INCOMPLETE}' event`, async () => {
      // Arrange
      const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_COMPLETED_REPORT);

      // Act
      await stateMachine.handleEvent({
        type: 'MANUALLY_SET_INCOMPLETE',
      });

      // Assert
      expect(handleUtilisationReportManuallySetIncompleteEvent).toHaveBeenCalledTimes(1);
    });

    const VALID_RECONCILIATION_COMPLETED_EVENT_TYPES = [UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_INCOMPLETE];

    it.each(difference(UTILISATION_REPORT_EVENT_TYPES, VALID_RECONCILIATION_COMPLETED_EVENT_TYPES))(
      "throws an 'InvalidStateMachineTransitionError for event type %p",
      async (eventType: UtilisationReportEventType) => {
        // Arrange
        const stateMachine = UtilisationReportStateMachine.forReport(RECONCILIATION_COMPLETED_REPORT);

        // Act
        await expectInvalidStateMachineTransitionError(stateMachine, eventType);
      },
    );
  });
});
