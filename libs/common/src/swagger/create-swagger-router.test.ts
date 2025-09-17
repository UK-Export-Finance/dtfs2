import swaggerDocs, { Options } from 'swagger-jsdoc';
import { SERVICES } from '../constants';
import { swaggerRouter } from './create-swagger-router';

jest.mock('swagger-jsdoc');

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

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return an Express router', () => {
    // Act
    const router = swaggerRouter(mockDefinition, mockApis);

    // Assert
    expect(router).toBeDefined();
    expect(typeof router.get).toBe('function');
    expect(typeof router.use).toBe('function');
  });

  it('should call swagger docs with correct options', () => {
    // Arrange
    const options: Options = {
      swaggerDefinition: mockDefinition,
      apis: mockApis,
    };

    // Act
    swaggerRouter(mockDefinition, mockApis);

    // Assert
    expect(swaggerDocs).toHaveBeenCalledTimes(1);
    expect(swaggerDocs).toHaveBeenCalledWith(options);
  });
});
