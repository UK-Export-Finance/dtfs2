import { BaseStateMachineEvent } from '../../base-state-machine.event';
import { FeeRecordEventType } from './fee-record.event-type';

export type BaseFeeRecordEvent<TType extends FeeRecordEventType, TPayload extends object | undefined> = BaseStateMachineEvent<TType, TPayload>;
