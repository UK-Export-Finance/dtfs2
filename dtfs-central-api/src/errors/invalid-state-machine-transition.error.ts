type Params = {
  eventType: string;
  state?: string;
  entityName: string;
  entityId?: number;
};

export class InvalidStateMachineTransitionError extends Error {
  constructor({ entityName, entityId, state, eventType }: Params) {
    const preamble = `Event type '${eventType}' is invalid`;
    const message =
      !!entityId && !!state ? `${preamble} for '${entityName}' (ID: '${entityId}') in state '${state}'` : `${preamble} for uninitialised '${entityName}'`;

    super(message);
    this.name = this.constructor.name;
  }
}
