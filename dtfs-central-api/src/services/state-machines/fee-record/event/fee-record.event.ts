import {
  FeeRecordPaymentAddedEvent,
  FeeRecordPaymentDeletedEvent,
  FeeRecordPaymentEditedEvent,
  FeeRecordRemoveFromPaymentEvent,
  FeeRecordOtherFeeRemovedFromGroupEvent,
} from '../event-handlers';

export type FeeRecordEvent =
  | FeeRecordPaymentAddedEvent
  | FeeRecordPaymentDeletedEvent
  | FeeRecordPaymentEditedEvent
  | FeeRecordRemoveFromPaymentEvent
  | FeeRecordOtherFeeRemovedFromGroupEvent;
