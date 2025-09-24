import express from 'express';
import { configure } from './configure-express-application';

describe('configure', () => {
  const truthyValues = ['1', 'true'];
  const falsyValues = ['', '0', 'false', 'undefined', 'null'];

  it.each(truthyValues)('should configure the application to trust proxy as `%s`', (value) => {
    // Arrange
    const mockApp = express();
    process.env.HTTPS = value;

    // Act
    configure(mockApp);

    // Assert
    expect(mockApp.get('trust proxy')).toBe(1);
  });

  it.each(falsyValues)('should configure the application to trust proxy as `%s`', (value) => {
    // Arrange
    const mockApp = express();
    process.env.HTTPS = value;

    // Act
    configure(mockApp);

    // Assert
    expect(mockApp.get('trust proxy')).toBeFalsy();
  });
});
