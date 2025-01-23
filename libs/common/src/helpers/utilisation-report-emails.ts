import z from 'zod';
import { InvalidEnvironmentVariableError } from '../errors';
import { asString } from './validation';

/**
 * Retrieves the UKEF GEF Reporting email recipients from the environment variables.
 * @returns The UKEF GEF Reporting email recipients.
 */
export const getUkefGefReportingEmailRecipients = () => {
  const EmailsSchema = z.array(z.string().email());

  try {
    const emails = EmailsSchema.parse(JSON.parse(asString(process.env.UKEF_GEF_REPORTING_EMAIL_RECIPIENT, 'UKEF_GEF_REPORTING_EMAIL_RECIPIENT')));
    return emails;
  } catch (error) {
    console.error('Failed to parse UKEF_GEF_REPORTING_EMAIL_RECIPIENT ', error);
    throw new InvalidEnvironmentVariableError('Failed to parse UKEF_GEF_REPORTING_EMAIL_RECIPIENT');
  }
};

/**
 * Retrieves the TFM UI URL from the environment variables.
 * @returns The TFM UI URL.
 * @throws {InvalidEnvironmentVariableError} If the TFM_UI_URL environment variable is not defined or is empty.
 */
export const getTfmUiUrl = (): string => {
  const { TFM_UI_URL } = process.env;

  if (!TFM_UI_URL) {
    throw new InvalidEnvironmentVariableError('TFM_UI_URL environment variable is not defined or is empty');
  }

  return TFM_UI_URL;
};
