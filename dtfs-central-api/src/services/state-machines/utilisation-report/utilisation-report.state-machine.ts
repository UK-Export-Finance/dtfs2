import { UtilisationReportEntity, ReportPeriod } from '@ukef/dtfs2-common';
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
} from './event-handlers';
import { UtilisationReportEvent } from './event/utilisation-report.event';

export class UtilisationReportStateMachine {
  private readonly report: UtilisationReportEntity | null;

  private constructor(report: UtilisationReportEntity | null) {
    this.report = report;
  }

  public static forReport(report: UtilisationReportEntity): UtilisationReportStateMachine {
    return new UtilisationReportStateMachine(report);
  }

  public static async forReportId(id: number): Promise<UtilisationReportStateMachine> {
    const report = await UtilisationReportRepo.findOneBy({ id });
    if (!report) {
      throw new NotFoundError(`Failed to find report with id ${id}`);
    }
    return new UtilisationReportStateMachine(report);
  }

  public static async forBankIdAndReportPeriod(bankId: string, reportPeriod: ReportPeriod): Promise<UtilisationReportStateMachine> {
    const report = await UtilisationReportRepo.findOneByBankIdAndReportPeriod(bankId, reportPeriod);
    return new UtilisationReportStateMachine(report);
  }

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
   */
  public async handleEvent(event: UtilisationReportEvent): Promise<UtilisationReportEntity> {
    switch (this.report?.status) {
      case undefined:
        switch (event.type) {
          case 'DUE_REPORT_INITIALISED':
            return handleUtilisationReportDueReportInitialisedEvent(event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case 'REPORT_NOT_RECEIVED':
        switch (event.type) {
          case 'REPORT_UPLOADED':
            return handleUtilisationReportReportUploadedEvent(this.report, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case 'PENDING_RECONCILIATION':
        switch (event.type) {
          case 'ADD_A_PAYMENT':
            return handleUtilisationReportAddAPaymentEvent(this.report, event.payload);
          case 'MANUALLY_SET_COMPLETED':
            return handleUtilisationReportManuallySetCompletedEvent(this.report, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case 'RECONCILIATION_IN_PROGRESS':
        switch (event.type) {
          case 'ADD_A_PAYMENT':
            return handleUtilisationReportAddAPaymentEvent(this.report, event.payload);
          case 'DELETE_PAYMENT':
            return handleUtilisationReportDeletePaymentEvent(this.report, event.payload);
          case 'GENERATE_KEYING_DATA':
            return handleUtilisationReportGenerateKeyingDataEvent(this.report, event.payload);
          case 'EDIT_PAYMENT':
            return handleUtilisationReportEditPaymentEvent(this.report, event.payload);
          case 'MARK_FEE_RECORDS_AS_READY_TO_KEY':
            return handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent(this.report, event.payload);
          case 'MARK_FEE_RECORDS_AS_RECONCILED':
            return handleUtilisationReportMarkFeeRecordsAsReconciledEvent(this.report, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case 'RECONCILIATION_COMPLETED':
        switch (event.type) {
          case 'MANUALLY_SET_INCOMPLETE':
            return handleUtilisationReportManuallySetIncompleteEvent(this.report, event.payload);
          case 'MARK_FEE_RECORDS_AS_READY_TO_KEY':
            return handleUtilisationReportMarkFeeRecordsAsReadyToKeyEvent(this.report, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      default:
        throw new Error(`Unexpected report status: '${this.report?.status}'`);
    }
  }
}
