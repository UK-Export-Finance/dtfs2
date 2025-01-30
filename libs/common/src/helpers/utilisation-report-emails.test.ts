import { InvalidEnvironmentVariableError } from '../errors';
import { getTfmUiUrl, getUkefGefReportingEmailRecipients } from './utilisation-report-emails';

describe('utilisation-report-emails', () => {
  const originalProcessEnv = { ...process.env };

  afterEach(() => {
    jest.resetAllMocks();
    process.env = originalProcessEnv;
  });

  describe('getUkefGefReportingEmailRecipients', () => {
    it('should return recipients list as an array of emails', () => {
      // Arrange
      process.env.UKEF_GEF_REPORTING_EMAIL_RECIPIENT = '["email1@ukexportfinance.gov.uk", "email2@ukexportfinance.gov.uk"]';

      // Act
      const result = getUkefGefReportingEmailRecipients();

      // Assert
      expect(result).toEqual(['email1@ukexportfinance.gov.uk', 'email2@ukexportfinance.gov.uk']);
    });

    it('should throw an error if recipients list is not in the correct format', () => {
      // Arrange
      process.env.UKEF_GEF_REPORTING_EMAIL_RECIPIENT = 'email1@ukexportfinance.gov.uk,email2@ukexportfinance.gov.uk';

      // Act + Assert
      const expectedError = new InvalidEnvironmentVariableError('Failed to parse UKEF_GEF_REPORTING_EMAIL_RECIPIENT');
      expect(() => getUkefGefReportingEmailRecipients()).toThrow(expectedError);
    });

    it('should throw an error if recipients list is not defined', () => {
      // Arrange
      delete process.env.UKEF_GEF_REPORTING_EMAIL_RECIPIENT;

      // Act + Assert
      const expectedError = new InvalidEnvironmentVariableError('Failed to parse UKEF_GEF_REPORTING_EMAIL_RECIPIENT');
      expect(() => getUkefGefReportingEmailRecipients()).toThrow(expectedError);
    });
  });

  describe('getTfmUiUrl', () => {
    it('should return TFM_UI_URL', () => {
      // Arrange
      process.env.TFM_UI_URL = 'https://www.ukexportfinance.gov.uk';

      // Act
      const result = getTfmUiUrl();

      // Assert
      expect(result).toEqual('https://www.ukexportfinance.gov.uk');
    });

    it('should throw an error if TFM_UI_URL is not defined', () => {
      // Arrange
      delete process.env.TFM_UI_URL;

      // Act + Assert
      const expectedError = new InvalidEnvironmentVariableError('TFM_UI_URL environment variable is not defined or is empty');
      expect(() => getTfmUiUrl()).toThrow(expectedError);
    });
  });
});
