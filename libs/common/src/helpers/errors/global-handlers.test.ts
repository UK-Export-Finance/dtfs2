import { exceptionHandlers } from './global-handlers';

describe('exceptionHandlers', () => {
  const processSpy = jest.spyOn(process, 'on');

  console.error = jest.fn();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should catch an unhanded rejection when thrown', () => {
    // Act
    exceptionHandlers();

    // Assert
    expect(processSpy).toHaveBeenCalledTimes(2);
    expect(processSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    expect(processSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
  });
});
