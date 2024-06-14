import { FeeRecordPaymentAddedEvent, FeeRecordPaymentDeletedEvent } from '../event-handlers';

export type FeeRecordEvent = FeeRecordPaymentAddedEvent | FeeRecordPaymentDeletedEvent;
