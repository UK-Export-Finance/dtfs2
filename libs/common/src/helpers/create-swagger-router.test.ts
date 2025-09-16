import { SERVICES } from '../constants';
import { swaggerRouter } from './create-swagger-router';

describe('swaggerRouter', () => {
  const mockDefinition = {
    info: {
      title: SERVICES.NAME,
      version: '1.0.0',
      description: 'Mock micro-service definition',
    },
    tags: [
      {
        name: 'Bank',
        description: 'Get and create banks. This is only used in the central API.',
      },
    ],
  };

  const mockApis = ['**/*.js'];

  beforeEach(() => {});

  it('should return an Express router', () => {
    // Act
    const router = swaggerRouter(mockDefinition, mockApis);

    // Assert
    expect(router).toBeDefined();
    expect(typeof router.get).toBe('function');
    expect(typeof router.use).toBe('function');
  });
});
