import { BaseStateMachineEvent } from '../../base-state-machine.event';
import { UtilisationReportEventType } from './utilisation-report.event-type';

export type BaseUtilisationReportEvent<TType extends UtilisationReportEventType, TPayload extends object | undefined> = BaseStateMachineEvent<TType, TPayload>;
