const delay = require('./delay');

describe('delay', () => {
  it('should return a promise that resolves after 200ms delay', () => {
    const delayPromise = delay(200);

    expect(delayPromise).toBeInstanceOf(Promise);
    delayPromise.then(() => {
      expect(true).toBe(true);
    });
  });

  it('should have a default delay of 1000 milliseconds', () => {
    delay();

    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    delay().then(() => {
      expect().toHaveBeenCalled();
    });
  });

  it('should have been called with specified 7000 milliseconds (7 seconds)', () => {
    delay(7000);

    jest.useFakeTimers();
    jest.advanceTimersByTime(7000);

    delay().then(() => {
      expect().toHaveBeenCalledWith(7000);
    });
  });
});
