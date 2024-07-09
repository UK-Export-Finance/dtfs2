import { FeeRecordGenerateKeyingDataEvent, FeeRecordPaymentAddedEvent, FeeRecordPaymentDeletedEvent, FeeRecordPaymentEditedEvent } from '../event-handlers';

export type FeeRecordEvent = FeeRecordPaymentAddedEvent | FeeRecordPaymentDeletedEvent | FeeRecordPaymentEditedEvent | FeeRecordGenerateKeyingDataEvent;
