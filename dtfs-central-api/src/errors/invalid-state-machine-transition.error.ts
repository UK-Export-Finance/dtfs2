type RequiredParams = {
  eventType: string;
  entityName: string;
};

type EntityParams = RequiredParams & {
  state: string;
  entityId: number;
};

export class InvalidStateMachineTransitionError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  public static forUninitialisedEntity({ eventType, entityName }: RequiredParams): InvalidStateMachineTransitionError {
    const message = `Event type '${eventType}' is invalid for uninitialised '${entityName}'`;
    return new InvalidStateMachineTransitionError(message);
  }

  public static forEntity({ eventType, entityName, state, entityId }: EntityParams): InvalidStateMachineTransitionError {
    const message = `Event type '${eventType}' is invalid for '${entityName}' (ID: '${entityId}') in state '${state}'`;
    return new InvalidStateMachineTransitionError(message);
  }
}
