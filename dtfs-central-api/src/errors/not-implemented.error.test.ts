import { NotImplementedError } from './not-implemented.error';

describe('NotImplementedError', () => {
  it('exposes the name of the error', () => {
    // Act
    const error = new NotImplementedError();

    // Assert
    expect(error.name).toBe('NotImplementedError');
  });
});
