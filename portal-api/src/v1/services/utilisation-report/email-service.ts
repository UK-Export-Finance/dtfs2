import { array, string } from 'zod';
import { PaymentOfficerTeam, asString } from '@ukef/dtfs2-common';
import sendEmail from '../../email';
import { EMAIL_TEMPLATE_IDS } from '../../../constants';
import { formatDateForEmail } from '../../helpers/formatDateForEmail';
import api from '../../api';
import { InvalidEnvironmentVariableError } from '../../errors';

const getUkefGefReportingEmailRecipients = () => {
  const EmailsSchema = array(string());

  try {
    const emails =  EmailsSchema.parse(JSON.parse(asString(process.env.UKEF_GEF_REPORTING_EMAIL_RECIPIENT, 'UKEF_GEF_REPORTING_EMAIL_RECIPIENT')));
    return emails;
  } catch (error) {
    console.error('Failed to parse UKEF_GEF_REPORTING_EMAIL_RECIPIENTS ', error);
    throw new InvalidEnvironmentVariableError('Failed to parse UKEF_GEF_REPORTING_EMAIL_RECIPIENTS');
  }
};

/**
 * Sends notification email to UKEF GEF reporting email recipients that a utilisation report has been submitted
 * @param {string} bankName - name of the bank
 * @param {string} reportPeriod - period for which the report covers as a string, eg. June 2023
 */
export const sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam = async (bankName: string, reportPeriod: string) => {
  await Promise.all(
    getUkefGefReportingEmailRecipients().map((email) =>
      sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION, email, {
        bankName,
        reportPeriod,
      }),
    ),
  );
};

/**
 * Calls the DTFS Central API to get bank details by bank ID and
 * returns only the payment officer team
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
 */
export const sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam = async (
  reportPeriod: string,
  bankId: string,
  submittedDate: Date,
  submittedByFirstName: string,
  submittedByLastName: string,
) => {
  try {
    const reportSubmittedBy = `${submittedByFirstName} ${submittedByLastName}`;
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
