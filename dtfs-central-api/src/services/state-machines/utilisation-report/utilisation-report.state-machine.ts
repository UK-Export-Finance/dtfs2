import {
  UtilisationReportEntity,
  ReportPeriod,
  PENDING_RECONCILIATION,
  RECONCILIATION_COMPLETED,
  RECONCILIATION_IN_PROGRESS,
  REPORT_NOT_RECEIVED,
} from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../repositories/utilisation-reports-repo';
import { InvalidStateMachineTransitionError, NotFoundError } from '../../../errors';
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
import { UtilisationReportEvent } from './event/utilisation-report.event';
import { UTILISATION_REPORT_EVENT_TYPE } from './event/utilisation-report.event-type';

/**
 * The utilisation report state machine class
 */
export class UtilisationReportStateMachine {
  private readonly report: UtilisationReportEntity | null;

  private constructor(report: UtilisationReportEntity | null) {
    this.report = report;
  }

  /**
   * Creates a state machine for the supplied report
   * @param report - The report to create a state machine for
   * @returns The state machine
   */
  public static forReport(report: UtilisationReportEntity): UtilisationReportStateMachine {
    return new UtilisationReportStateMachine(report);
  }

  /**
   * Creates a state machine for the report with the supplied id
   * @param id - The report id
   * @returns The state machine
   * @throws {NotFoundError} If a report with the supplied id cannot be found
   */
  public static async forReportId(id: number): Promise<UtilisationReportStateMachine> {
    const report = await UtilisationReportRepo.findOneBy({ id });
    if (!report) {
      throw new NotFoundError(`Failed to find report with id ${id}`);
    }
    return new UtilisationReportStateMachine(report);
  }

  /**
   * Creates a state machine for the report with the supplied bank id and report period
   * @param bankId - The bank id
   * @param reportPeriod - The report period
   * @returns The state machine
   */
  public static async forBankIdAndReportPeriod(bankId: string, reportPeriod: ReportPeriod): Promise<UtilisationReportStateMachine> {
    const report = await UtilisationReportRepo.findOneByBankIdAndReportPeriod(bankId, reportPeriod);
    return new UtilisationReportStateMachine(report);
  }

  /**
   * Handles an invalid transition event
   * @param param - The event
   * @param param.type - The event type
   */
  private handleInvalidTransition = ({ type: eventType }: UtilisationReportEvent): never => {
    const entityName = UtilisationReportEntity.name;

    if (this.report) {
      throw InvalidStateMachineTransitionError.forEntity({
        eventType,
        entityName,
        state: this.report.status,
        entityId: this.report.id,
      });
    }

    throw InvalidStateMachineTransitionError.forUninitialisedEntity({
      eventType,
      entityName,
    });
  };

  /**
   * Implements the 'Utilisation Reports' state machine detailed in '/doc/state-machines.md'.
   * @param event - The event
   * @returns The modified report
   */
  public async handleEvent(event: UtilisationReportEvent): Promise<UtilisationReportEntity> {
    switch (this.report?.status) {
      case undefined:
        switch (event.type) {
          case UTILISATION_REPORT_EVENT_TYPE.DUE_REPORT_INITIALISED:
            return handleUtilisationReportDueReportInitialisedEvent(event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case REPORT_NOT_RECEIVED:
        switch (event.type) {
          case UTILISATION_REPORT_EVENT_TYPE.REPORT_UPLOADED:
            return handleUtilisationReportReportUploadedEvent(this.report, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case PENDING_RECONCILIATION:
        switch (event.type) {
          case UTILISATION_REPORT_EVENT_TYPE.ADD_A_PAYMENT:
            return handleUtilisationReportAddAPaymentEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_COMPLETED:
            return handleUtilisationReportManuallySetCompletedEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.GENERATE_KEYING_DATA:
            return handleUtilisationReportGenerateKeyingDataEvent(this.report, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case RECONCILIATION_IN_PROGRESS:
        switch (event.type) {
          case UTILISATION_REPORT_EVENT_TYPE.ADD_A_PAYMENT:
            return handleUtilisationReportAddAPaymentEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.DELETE_PAYMENT:
            return handleUtilisationReportDeletePaymentEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.GENERATE_KEYING_DATA:
            return handleUtilisationReportGenerateKeyingDataEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.EDIT_PAYMENT:
            return handleUtilisationReportEditPaymentEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_READY_TO_KEY:
            return handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_RECONCILED:
            return handleUtilisationReportMarkFeeRecordsAsReconciledEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.REMOVE_FEES_FROM_PAYMENT_GROUP:
            return handleUtilisationReportRemoveFeesFromPaymentGroupEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.ADD_FEES_TO_AN_EXISTING_PAYMENT_GROUP:
            return handleUtilisationReportAddFeesToAnExistingPaymentGroupEvent(this.report, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case RECONCILIATION_COMPLETED:
        switch (event.type) {
          case UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_INCOMPLETE:
            return handleUtilisationReportManuallySetIncompleteEvent(this.report, event.payload);
          case UTILISATION_REPORT_EVENT_TYPE.MARK_FEE_RECORDS_AS_READY_TO_KEY:
            return handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent(this.report, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      default:
        throw new Error(`Unexpected report status: '${this.report?.status}'`);
    }
  }
}
