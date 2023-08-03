const createRateLimit = require('.');
const InvalidEnvironmentVariableError = require('../../errors/invalid-environment-variable.error');

// TODO SR-8: make sure PRs run these tests
describe('createRateLimit', () => {
  let originalProcessEnv;
  let originalConsoleError;
  let originalConsoleInfo;

  const invalidThresholds = [
    { value: '', description: 'the empty string' },
    { value: ' ', description: 'a whitespace' },
    { value: 'a', description: 'a' },
    { value: 'abc', description: 'abc' },
    { value: '0', description: '0' },
    { value: '-1', description: '-1' },
    { value: 'NaN', description: 'NaN' },
  ];

  const validThresholds = [
    '1',
    '5',
    '100',
  ];

  const setRateLimitThresholdEnvVariableTo = (value) => {
    process.env = { RATE_LIMIT_THRESHOLD: value };
  };

  const invalidThresholdErrorMessage = (threshold) => `Invalid rate limit threshold value ${threshold}.`;
  const rateLimitingInfoMessage = (threshold) => `Rate-limiting requests to a maximum of ${threshold} requests per 1 minute window.`;

  beforeEach(() => {
    originalProcessEnv = { ...process.env };

    originalConsoleError = console.error;
    console.error = jest.fn();

    originalConsoleInfo = console.info;
    console.info = jest.fn();
  });

  afterEach(() => {
    process.env = originalProcessEnv;
    console.error = originalConsoleError;
    console.info = originalConsoleInfo;
  });

  describe('creating the rate limit middleware', () => {
    describe.each(invalidThresholds)('when the RATE_LIMIT_THRESHOLD env variable is $description, which is invalid', ({ value: invalidThresholdValue }) => {
      it('logs a console error', () => {
        setRateLimitThresholdEnvVariableTo(invalidThresholdValue);

        try {
          createRateLimit();
        } catch {
          // ignored for test
        }

        expect(console.error).toHaveBeenCalledWith(invalidThresholdErrorMessage(invalidThresholdValue));
      });

      it('does not log the rate limiting message at info level', () => {
        setRateLimitThresholdEnvVariableTo(invalidThresholdValue);

        try {
          createRateLimit();
        } catch {
          // ignored for test
        }

        expect(console.info).not.toHaveBeenCalledWith(rateLimitingInfoMessage(invalidThresholdValue));
      });

      it('throws an InvalidEnvironmentVariable error', () => {
        setRateLimitThresholdEnvVariableTo(invalidThresholdValue);

        const creatingTheRateLimit = () => createRateLimit();

        expect(creatingTheRateLimit).toThrow(InvalidEnvironmentVariableError);
        expect(creatingTheRateLimit).toThrow(invalidThresholdErrorMessage(invalidThresholdValue));
      });
    });

    describe.each(validThresholds)('when the RATE_LIMIT_THRESHOLD env variable is %s, which is valid', (validThresholdValue) => {
      it('does not long an invalid threshold error message', () => {
        setRateLimitThresholdEnvVariableTo(validThresholdValue);

        createRateLimit();

        expect(console.error).not.toHaveBeenCalledWith(invalidThresholdErrorMessage(validThresholdValue));
      });

      it('logs the rate limiting message at info level', () => {
        setRateLimitThresholdEnvVariableTo(validThresholdValue);

        createRateLimit();

        expect(console.info).toHaveBeenCalledWith(rateLimitingInfoMessage(validThresholdValue));
      });

      it('does not throw', () => {
        setRateLimitThresholdEnvVariableTo(validThresholdValue);

        const creatingTheRateLimit = () => createRateLimit();

        expect(creatingTheRateLimit).not.toThrow();
      });
    });
  });

  describe('the created rate limit middleware', () => {
    const threshold = 10;
    const originalUrl = '/some/url';

    let rateLimitMiddleware;

    let req;
    let res;
    let next;

    const handleRequestTimes = (numberOfRequestsToHandle) =>
      Promise.allSettled(Array.from({ length: numberOfRequestsToHandle }, () => rateLimitMiddleware(req, res, next)));

    beforeEach(() => {
      jest.useFakeTimers();

      setRateLimitThresholdEnvVariableTo(threshold.toString());
      rateLimitMiddleware = createRateLimit();

      req = { originalUrl };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn(), setHeader: jest.fn(), };
      next = jest.fn();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('calls next for each request if the threshold has not been reached', async () => {
      const numberOfRequestsToSendBelowThreshold = threshold - 1;

      await handleRequestTimes(numberOfRequestsToSendBelowThreshold);

      expect(next).toHaveBeenCalledTimes(numberOfRequestsToSendBelowThreshold);
    });

    it('calls next for each request up until the threshold is reached', async () => {
      const numberOfRequestsToSendEqualToThreshold = threshold;

      await handleRequestTimes(numberOfRequestsToSendEqualToThreshold);

      expect(next).toHaveBeenCalledTimes(numberOfRequestsToSendEqualToThreshold);
    });

    it('does not call next for a request that happens immediately after the threshold is reached', async () => {
      const numberOfRequestsToSendEqualToThreshold = threshold;
      await handleRequestTimes(numberOfRequestsToSendEqualToThreshold);
      next.mockClear();

      await handleRequestTimes(1);

      expect(next).not.toHaveBeenCalled();
    });

    it('sets the response to 429 for a request that happens immediately after the threshold is reached', async () => {
      const numberOfRequestsToSendEqualToThreshold = threshold;
      await handleRequestTimes(numberOfRequestsToSendEqualToThreshold);
      res.status.mockClear();

      await handleRequestTimes(1);

      expect(res.status).toHaveBeenCalledWith(429);
    });

    it('sends an error string response for a request that happens immediately after the threshold is reached', async () => {
      const numberOfRequestsToSendEqualToThreshold = threshold;
      await handleRequestTimes(numberOfRequestsToSendEqualToThreshold);
      res.send.mockClear();

      await handleRequestTimes(1);

      expect(res.send).toHaveBeenCalledWith('Request threshold reached, please try again later.');
    });

    it('logs a rate limiting error message for a request that happens immediately after the threshold is reached', async () => {
      const numberOfRequestsToSendEqualToThreshold = threshold;
      await handleRequestTimes(numberOfRequestsToSendEqualToThreshold);
      console.error.mockClear();

      await handleRequestTimes(1);

      expect(console.error).toHaveBeenCalledWith(`Rate limit threshold exceeded. Returning rate limit error message for request to ${originalUrl}.`);
    });

    it('does not call next for a request that happens 59 seconds after the threshold is reached', async () => {
      const numberOfRequestsToSendEqualToThreshold = threshold;
      await handleRequestTimes(numberOfRequestsToSendEqualToThreshold);
      next.mockClear();

      jest.advanceTimersByTime(59 * 1000);
      await handleRequestTimes(1);

      expect(next).not.toHaveBeenCalled();
    });

    it('sets the response to 429 for a request that happens 59 seconds after the threshold is reached', async () => {
      const numberOfRequestsToSendEqualToThreshold = threshold;
      await handleRequestTimes(numberOfRequestsToSendEqualToThreshold);
      res.status.mockClear();

      jest.advanceTimersByTime(59 * 1000);
      await handleRequestTimes(1);

      expect(res.status).toHaveBeenCalledWith(429);
    });

    it('sends an error string response for a request that happens 59 seconds after the threshold is reached', async () => {
      const numberOfRequestsToSendEqualToThreshold = threshold;
      await handleRequestTimes(numberOfRequestsToSendEqualToThreshold);
      res.send.mockClear();

      jest.advanceTimersByTime(59 * 1000);
      await handleRequestTimes(1);

      expect(res.send).toHaveBeenCalledWith('Request threshold reached, please try again later.');
    });

    it('logs a rate limiting error message for a request that happens 59 seconds after the threshold is reached', async () => {
      const numberOfRequestsToSendEqualToThreshold = threshold;
      await handleRequestTimes(numberOfRequestsToSendEqualToThreshold);
      console.error.mockClear();

      jest.advanceTimersByTime(59 * 1000);
      await handleRequestTimes(1);

      expect(console.error).toHaveBeenCalledWith(`Rate limit threshold exceeded. Returning rate limit error message for request to ${originalUrl}.`);
    });

    it('calls next for a request that happens 1 minute after the threshold is reached', async () => {
      await handleRequestTimes(threshold);
      next.mockClear();

      jest.advanceTimersByTime(60 * 1000);
      await handleRequestTimes(1);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
