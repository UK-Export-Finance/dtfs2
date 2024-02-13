import { InvalidStateMachineTransitionError } from './invalid-state-machine-transition.error';

describe('InvalidStateMachineTransitionError', () => {
  const params = {
    entityName: 'SomeEntity',
    entityId: 123,
    state: 'COMPLETED',
    eventType: 'DELETE_ENTITY',
  };

  it('exposes a message based on the parameters provided', () => {
    // Act
    const error = new InvalidStateMachineTransitionError(params);

    // Assert
    expect(error.message).toBe("Event type 'DELETE_ENTITY' is invalid for 'SomeEntity' (ID: '123') in state 'COMPLETED'");
  });

  it('exposes the name of the error', () => {
    // Act
    const error = new InvalidStateMachineTransitionError(params);

    // Assert
    expect(error.name).toBe('InvalidStateMachineTransitionError');
  });
});
