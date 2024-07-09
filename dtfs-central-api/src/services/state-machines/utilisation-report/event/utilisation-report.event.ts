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
  | UtilisationReportMarkFeeRecordsAsReadyToKeyEvent;
