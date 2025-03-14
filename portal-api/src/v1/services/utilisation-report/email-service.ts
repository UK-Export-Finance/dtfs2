import { PaymentOfficerTeam, formatDateForEmail, getTfmUiUrl, getUkefGefReportingEmailRecipients } from '@ukef/dtfs2-common';
import sendEmail from '../../email';
import { EMAIL_TEMPLATE_IDS } from '../../../constants';
import api from '../../api';

/**
 * Sends notification email to UKEF GEF reporting email recipients that a utilisation report has been submitted
 * @param bankName - name of the bank
 * @param reportPeriod - period for which the report covers as a string, eg. June 2023
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
