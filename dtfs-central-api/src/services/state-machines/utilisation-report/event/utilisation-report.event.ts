import {
  UtilisationReportDueReportInitialisedEvent,
  UtilisationReportGenerateKeyingDataEvent,
  UtilisationReportManuallySetCompletedEvent,
  UtilisationReportManuallySetIncompleteEvent,
  UtilisationReportAddAPaymentEvent,
  UtilisationReportDeletePaymentEvent,
  UtilisationReportReportUploadedEvent,
  UtilisationReportEditPaymentEvent,
  UtilisationReportMarkFeeRecordsAsReconciledEvent,
  UtilisationReportMarkFeeRecordsAsReadyToKeyEvent,
  UtilisationReportRemoveFeesFromPaymentGroupEvent,
} from '../event-handlers';

export type UtilisationReportEvent =
  | UtilisationReportDueReportInitialisedEvent
  | UtilisationReportGenerateKeyingDataEvent
  | UtilisationReportManuallySetCompletedEvent
  | UtilisationReportManuallySetIncompleteEvent
  | UtilisationReportAddAPaymentEvent
  | UtilisationReportDeletePaymentEvent
  | UtilisationReportReportUploadedEvent
  | UtilisationReportEditPaymentEvent
  | UtilisationReportMarkFeeRecordsAsReconciledEvent
  | UtilisationReportMarkFeeRecordsAsReadyToKeyEvent
  | UtilisationReportRemoveFeesFromPaymentGroupEvent;
