import { HttpStatusCode } from 'axios';
import { NotImplementedError } from './not-implemented.error';

describe('NotImplementedError', () => {
  it('exposes the 501 (Not Implemented) status code', () => {
    // Act
    const error = new NotImplementedError();

    // Assert
    expect(error.status).toEqual(HttpStatusCode.NotImplemented);
  });

  it('exposes the name of the error', () => {
    // Act
    const error = new NotImplementedError();

    // Assert
    expect(error.name).toEqual('NotImplementedError');
  });
});
