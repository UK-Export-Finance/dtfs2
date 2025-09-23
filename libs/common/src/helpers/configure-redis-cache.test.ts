import redis from 'redis';
import connectRedis from 'connect-redis';
import { redisStore } from './configure-redis-cache';

jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('connect-redis');
jest.mock('express-session', () => jest.fn());

console.info = jest.fn();
console.error = jest.fn();

describe('redisStore', () => {
  const onMock: jest.Mock = jest.fn();
  const createClientMock: jest.Mock = jest.fn().mockReturnValue({
    on: onMock,
  });
  const RedisStoreMock: jest.Mock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (redis.createClient as jest.Mock) = createClientMock;

    (connectRedis as jest.Mock).mockReturnValue(RedisStoreMock);
    RedisStoreMock.mockImplementation(({ client }: { client: redis.RedisClient }) => ({ client }));
  });

  it('should create a Redis client with supplied port and hostname', () => {
    // Arrange
    process.env.REDIS_PORT = '1234';
    process.env.REDIS_HOSTNAME = 'localhost';
    process.env.REDIS_KEY = '';

    // Act
    const store = redisStore();

    // Assert
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(createClientMock).toHaveBeenCalledWith(1234, 'localhost', {});

    expect(store.client).toBeDefined();

    expect(onMock).toHaveBeenCalledTimes(2);
    expect(onMock).toHaveBeenCalledWith('error', expect.any(Function));
    expect(onMock).toHaveBeenCalledWith('connect', expect.any(Function));
  });

  it('should create a Redis client with default port and undefined hostname', () => {
    // Arrange
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_HOSTNAME;
    delete process.env.REDIS_KEY;

    // Act
    redisStore();

    // Assert
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(createClientMock).toHaveBeenCalledWith(6379, undefined, {});
  });

  it('should call with correct options when both Redis key and hostname have been supplied', () => {
    // Arrange
    process.env.REDIS_HOSTNAME = 'localhost';
    process.env.REDIS_KEY = '1234';
    const mockOptions = {
      auth_pass: '1234',
      tls: { servername: 'localhost' },
    };

    // Act
    redisStore();

    // Assert
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(createClientMock).toHaveBeenCalledWith(6379, 'localhost', mockOptions);
  });
});
