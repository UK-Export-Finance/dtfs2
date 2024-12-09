import {
  FeeRecordPaymentAddedEvent,
  FeeRecordPaymentDeletedEvent,
  FeeRecordPaymentEditedEvent,
  FeeRecordGenerateKeyingDataEvent,
  FeeRecordRemoveFromPaymentGroupEvent,
  FeeRecordOtherFeeRemovedFromPaymentGroupEvent,
  FeeRecordMarkAsReadyToKeyEvent,
  FeeRecordMarkAsReconciledEvent,
  FeeRecordOtherFeeAddedToPaymentGroupEvent,
  FeeRecordCorrectionRequestedEvent,
} from '../event-handlers';

export type FeeRecordEvent =
  | FeeRecordPaymentAddedEvent
  | FeeRecordPaymentDeletedEvent
  | FeeRecordPaymentEditedEvent
  | FeeRecordGenerateKeyingDataEvent
  | FeeRecordMarkAsReconciledEvent
  | FeeRecordMarkAsReadyToKeyEvent
  | FeeRecordRemoveFromPaymentGroupEvent
  | FeeRecordOtherFeeRemovedFromPaymentGroupEvent
  | FeeRecordOtherFeeAddedToPaymentGroupEvent
  | FeeRecordCorrectionRequestedEvent;
