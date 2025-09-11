import { HttpStatusCode } from 'axios';
import { InvalidStateMachineTransitionError } from './invalid-state-machine-transition.error';

describe('InvalidStateMachineTransitionError', () => {
  const uninitialisedEntityParams = {
    eventType: 'DELETE_ENTITY',
    entityName: 'SomeEntity',
  };

  it('exposes a message when uninitialised entity params are provided', () => {
    // Act
    const error = InvalidStateMachineTransitionError.forUninitialisedEntity(uninitialisedEntityParams);

    // Assert
    expect(error.message).toEqual("Event type 'DELETE_ENTITY' is invalid for uninitialised 'SomeEntity'");
  });

  it('exposes a message when entity params are provided', () => {
    // Arrange
    const entityParams = {
      ...uninitialisedEntityParams,
      state: 'COMPLETED',
      entityId: 123,
    };

    // Act
    const error = InvalidStateMachineTransitionError.forEntity(entityParams);

    // Assert
    expect(error.message).toEqual("Event type 'DELETE_ENTITY' is invalid for 'SomeEntity' (ID: '123') in state 'COMPLETED'");
  });

  it('exposes the 400 (Bad Request) status code', () => {
    // Act
    const error = InvalidStateMachineTransitionError.forUninitialisedEntity(uninitialisedEntityParams);

    // Assert
    expect(error.status).toEqual(HttpStatusCode.BadRequest);
  });

  it('exposes the name of the error', () => {
    // Act
    const error = InvalidStateMachineTransitionError.forUninitialisedEntity(uninitialisedEntityParams);

    // Assert
    expect(error.name).toEqual('InvalidStateMachineTransitionError');
  });
});
