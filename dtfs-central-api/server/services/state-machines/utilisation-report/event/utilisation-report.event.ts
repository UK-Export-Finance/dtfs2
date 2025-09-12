import {
  UtilisationReportDueReportInitialisedEvent,
  UtilisationReportGenerateKeyingDataEvent,
  UtilisationReportAddAPaymentEvent,
  UtilisationReportDeletePaymentEvent,
  UtilisationReportReportUploadedEvent,
  UtilisationReportEditPaymentEvent,
  UtilisationReportMarkFeeRecordsAsReconciledEvent,
  UtilisationReportMarkFeeRecordsAsReadyToKeyEvent,
  UtilisationReportRemoveFeesFromPaymentGroupEvent,
  UtilisationReportAddFeesToAnExistingPaymentGroupEvent,
} from '../event-handlers';

export type UtilisationReportEvent =
  | UtilisationReportDueReportInitialisedEvent
  | UtilisationReportGenerateKeyingDataEvent
  | UtilisationReportAddAPaymentEvent
  | UtilisationReportDeletePaymentEvent
  | UtilisationReportReportUploadedEvent
  | UtilisationReportEditPaymentEvent
  | UtilisationReportMarkFeeRecordsAsReconciledEvent
  | UtilisationReportMarkFeeRecordsAsReadyToKeyEvent
  | UtilisationReportRemoveFeesFromPaymentGroupEvent
  | UtilisationReportAddFeesToAnExistingPaymentGroupEvent;
