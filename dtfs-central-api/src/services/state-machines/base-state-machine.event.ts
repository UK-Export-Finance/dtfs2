export type BaseStateMachineEvent<TType extends string, TPayload extends object | undefined> = TPayload extends undefined
  ? { type: TType }
  : { type: TType; payload: TPayload };
