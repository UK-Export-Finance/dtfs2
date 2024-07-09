import {
  UtilisationReportDueReportInitialisedEvent,
  UtilisationReportFeeRecordKeyedEvent,
  UtilisationReportManuallySetCompletedEvent,
  UtilisationReportManuallySetIncompleteEvent,
  UtilisationReportAddAPaymentEvent,
  UtilisationReportDeletePaymentEvent,
  UtilisationReportReportUploadedEvent,
  UtilisationReportEditPaymentEvent,
  UtilisationReportRemoveFeesFromPaymentEvent,
} from '../event-handlers';

export type UtilisationReportEvent =
  | UtilisationReportDueReportInitialisedEvent
  | UtilisationReportFeeRecordKeyedEvent
  | UtilisationReportManuallySetCompletedEvent
  | UtilisationReportManuallySetIncompleteEvent
  | UtilisationReportAddAPaymentEvent
  | UtilisationReportDeletePaymentEvent
  | UtilisationReportReportUploadedEvent
  | UtilisationReportEditPaymentEvent
  | UtilisationReportRemoveFeesFromPaymentEvent;
