import { FeeRecordPaymentAddedEvent, FeeRecordPaymentDeletedEvent, FeeRecordPaymentEditedEvent, FeeRecordRemoveFromPaymentEvent } from '../event-handlers';

export type FeeRecordEvent = FeeRecordPaymentAddedEvent | FeeRecordPaymentDeletedEvent | FeeRecordPaymentEditedEvent | FeeRecordRemoveFromPaymentEvent;
