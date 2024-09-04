import z from 'zod';
import { InvalidEnvironmentVariableError, PaymentOfficerTeam, asString } from '@ukef/dtfs2-common';
import sendEmail from '../../email';
import { EMAIL_TEMPLATE_IDS } from '../../../constants';
import { formatDateForEmail } from '../../helpers/formatDateForEmail';
import api from '../../api';

const getUkefGefReportingEmailRecipients = () => {
  const EmailsSchema = z.array(z.string().email());

  try {
    const emails = EmailsSchema.parse(JSON.parse(asString(process.env.UKEF_GEF_REPORTING_EMAIL_RECIPIENT, 'UKEF_GEF_REPORTING_EMAIL_RECIPIENT')));
    return emails;
  } catch (error) {
    console.error('Failed to parse UKEF_GEF_REPORTING_EMAIL_RECIPIENTS ', error);
    throw new InvalidEnvironmentVariableError('Failed to parse UKEF_GEF_REPORTING_EMAIL_RECIPIENTS');
  }
};

/**
 * Retrieves the TFM UI URL from the environment variables.
 * @returns The TFM UI URL.
 * @throws {InvalidEnvironmentVariableError} If the TFM_UI_URL environment variable is not defined or is empty.
 */
const getTfmUiUrl = () => {
  const tfmUiUrl = process.env.TFM_UI_URL;
  if (!tfmUiUrl) {
    throw new InvalidEnvironmentVariableError('TFM_UI_URL environment variable is not defined or is empty');
  }

  return tfmUiUrl;
};

/**
 * Sends notification email to UKEF GEF reporting email recipients that a utilisation report has been submitted
 * @param bankName - name of the bank
 * @param reportPeriod - period for which the report covers as a string, eg. June 2023
 * @param tfmHomepageUrl - URL for the TFM homepage
 */
export const sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam = async (bankName: string, reportPeriod: string) => {
  const tfmHomepageUrl = getTfmUiUrl();

  await Promise.all(
    getUkefGefReportingEmailRecipients().map((email) =>
      sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION, email, {
        bankName,
        reportPeriod,
        tfmHomepageUrl,
      }),
    ),
  );
};

/**
 * Calls the DTFS Central API to get bank details by bank ID and
 * returns only the payment officer team
 * @param bankId - the id of the bank
 * @returns - payment officer team
 */
const getPaymentOfficerTeamDetailsFromBank = async (bankId: string): Promise<PaymentOfficerTeam> => {
  try {
    const bank = await api.getBankById(bankId);
    return bank.paymentOfficerTeam;
  } catch (error) {
    console.error('Unable to get bank payment officer team details by ID %o', error);
    throw error;
  }
};

/**
 * Sends notification email to bank payment officer team that a utilisation report has been
 * received and return the payment officer team email address.
 * @param reportPeriod - period for which the report covers as a string, eg. June 2023
 * @param bankId - the id of the bank
 * @param submittedDate - the date the report was submitted
 * @param submittedByFirstName - the first name of the user who submitted the report
 * @param submittedBySurname - the surname name of the user who submitted the report
 */
export const sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam = async (
  reportPeriod: string,
  bankId: string,
  submittedDate: Date,
  submittedByFirstName: string,
  submittedBySurname: string,
) => {
  try {
    const reportSubmittedBy = `${submittedByFirstName} ${submittedBySurname}`;
    const { teamName, emails } = await getPaymentOfficerTeamDetailsFromBank(bankId);
    const formattedSubmittedDate = formatDateForEmail(submittedDate);

    await Promise.all(
      emails.map((email) =>
        sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_CONFIRMATION, email, {
          recipient: teamName,
          reportPeriod,
          reportSubmittedBy,
          reportSubmittedDate: formattedSubmittedDate,
        }),
      ),
    );
    return { paymentOfficerEmails: emails };
  } catch (error) {
    console.error('Unable to get payment officer team details and send email %o', error);
    throw error;
  }
};
