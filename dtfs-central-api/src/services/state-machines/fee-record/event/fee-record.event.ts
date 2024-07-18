import {
  FeeRecordPaymentAddedEvent,
  FeeRecordPaymentDeletedEvent,
  FeeRecordPaymentEditedEvent,
  FeeRecordGenerateKeyingDataEvent,
  FeeRecordRemoveFromPaymentGroupEvent,
  FeeRecordOtherFeeRemovedFromGroupEvent,
  FeeRecordMarkAsReadyToKeyEvent,
  FeeRecordMarkAsReconciledEvent,
} from '../event-handlers';

export type FeeRecordEvent =
  | FeeRecordPaymentAddedEvent
  | FeeRecordPaymentDeletedEvent
  | FeeRecordPaymentEditedEvent
  | FeeRecordGenerateKeyingDataEvent
  | FeeRecordMarkAsReconciledEvent
  | FeeRecordMarkAsReadyToKeyEvent
  | FeeRecordRemoveFromPaymentGroupEvent
  | FeeRecordOtherFeeRemovedFromGroupEvent;
