import {
  UtilisationReportDueReportInitialisedEvent,
  UtilisationReportFeeRecordKeyedEvent,
  UtilisationReportManuallySetCompletedEvent,
  UtilisationReportManuallySetIncompleteEvent,
  UtilisationReportAddAPaymentEvent,
  UtilisationReportPaymentRemovedFromFeeRecordEvent,
  UtilisationReportReportUploadedEvent,
} from '../event-handlers';

export type UtilisationReportEvent =
  | UtilisationReportDueReportInitialisedEvent
  | UtilisationReportFeeRecordKeyedEvent
  | UtilisationReportManuallySetCompletedEvent
  | UtilisationReportManuallySetIncompleteEvent
  | UtilisationReportAddAPaymentEvent
  | UtilisationReportPaymentRemovedFromFeeRecordEvent
  | UtilisationReportReportUploadedEvent;
