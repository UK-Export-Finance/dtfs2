import {
  UtilisationReportDueReportInitialisedEvent,
  UtilisationReportFeeRecordKeyedEvent,
  UtilisationReportManuallySetCompletedEvent,
  UtilisationReportManuallySetIncompleteEvent,
  UtilisationReportAddAPaymentEvent,
  UtilisationReportDeletePaymentEvent,
  UtilisationReportReportUploadedEvent,
  UtilisationReportEditPaymentEvent,
} from '../event-handlers';

export type UtilisationReportEvent =
  | UtilisationReportDueReportInitialisedEvent
  | UtilisationReportFeeRecordKeyedEvent
  | UtilisationReportManuallySetCompletedEvent
  | UtilisationReportManuallySetIncompleteEvent
  | UtilisationReportAddAPaymentEvent
  | UtilisationReportDeletePaymentEvent
  | UtilisationReportReportUploadedEvent
  | UtilisationReportEditPaymentEvent;
