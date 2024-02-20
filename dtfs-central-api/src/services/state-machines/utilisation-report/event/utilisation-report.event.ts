import {
  UtilisationReportDueReportInitialisedEvent,
  UtilisationReportFeeRecordKeyedEvent,
  UtilisationReportManuallySetCompletedEvent,
  UtilisationReportManuallySetIncompleteEvent,
  UtilisationReportPaymentAddedToFeeRecordEvent,
  UtilisationReportPaymentRemovedFromFeeRecordEvent,
  UtilisationReportReportUploadedEvent,
} from '../event-handlers';

export type UtilisationReportEvent =
  | UtilisationReportDueReportInitialisedEvent
  | UtilisationReportFeeRecordKeyedEvent
  | UtilisationReportManuallySetCompletedEvent
  | UtilisationReportManuallySetIncompleteEvent
  | UtilisationReportPaymentAddedToFeeRecordEvent
  | UtilisationReportPaymentRemovedFromFeeRecordEvent
  | UtilisationReportReportUploadedEvent;
