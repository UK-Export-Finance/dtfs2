import {
  UtilisationReportDueReportInitialisedEvent,
  UtilisationReportFeeRecordKeyedEvent,
  UtilisationReportManuallySetCompletedEvent,
  UtilisationReportManuallySetIncompleteEvent,
  UtilisationReportAddAPaymentEvent,
  UtilisationReportDeletePaymentEvent,
  UtilisationReportReportUploadedEvent,
} from '../event-handlers';

export type UtilisationReportEvent =
  | UtilisationReportDueReportInitialisedEvent
  | UtilisationReportFeeRecordKeyedEvent
  | UtilisationReportManuallySetCompletedEvent
  | UtilisationReportManuallySetIncompleteEvent
  | UtilisationReportAddAPaymentEvent
  | UtilisationReportDeletePaymentEvent
  | UtilisationReportReportUploadedEvent;
