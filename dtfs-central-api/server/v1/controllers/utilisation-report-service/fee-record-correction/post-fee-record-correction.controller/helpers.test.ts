import { getFormattedReportPeriodWithLongMonth, mapReasonToDisplayValue, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { formatReasonsAsBulletedListForEmail, generateFeeRecordCorrectionRequestEmailParameters, sendFeeRecordCorrectionRequestEmails } from './helpers';
import { aReportPeriod } from '../../../../../../test-helpers';
import externalApi from '../../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';

jest.mock('../../../../../repositories/banks-repo');
jest.mock('../../../../../external-api/api');

console.error = jest.fn();

describe('post-fee-record-correction.controller helpers', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const firstPaymentOfficerEmail = 'officer-1@example.com';
  const secondPaymentOfficerEmail = 'officer-2@example.com';
  const teamName = 'Payment Officer Team';
  const teamEmails = [firstPaymentOfficerEmail, secondPaymentOfficerEmail];

  describe('formatReasonsAsBulletedListForEmail', () => {
    it('should format reasons as a bulleted list when there is a single reasons', () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;
      const reasons: RecordCorrectionReason[] = [reason];

      // Act
      const result = formatReasonsAsBulletedListForEmail(reasons);

      // Assert
      const expected = `*${mapReasonToDisplayValue(reason)}`;
      expect(result).toEqual(expected);
    });

    it('should format reasons as a bulleted list when there are multiple reasons', () => {
      // Arrange
      const firstReason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const secondReason = RECORD_CORRECTION_REASON.OTHER;
      const reasons: RecordCorrectionReason[] = [firstReason, secondReason];

      // Act
      const result = formatReasonsAsBulletedListForEmail(reasons);

      // Assert
      const expected = `*${mapReasonToDisplayValue(firstReason)}\n*${mapReasonToDisplayValue(secondReason)}`;
      expect(result).toEqual(expected);
    });
  });

  describe('generateFeeRecordCorrectionRequestEmailParameters', () => {
    const reasons: RecordCorrectionReason[] = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];
    const reportPeriod = aReportPeriod();
    const exporter = 'Test Exporter';
    const requestedByUserEmail = 'user@example.com';

    it('should generate email parameters', () => {
      // Act
      const result = generateFeeRecordCorrectionRequestEmailParameters(reasons, reportPeriod, exporter, requestedByUserEmail, teamName, teamEmails);

      // Assert
      expect(result).toEqual({
        emails: [firstPaymentOfficerEmail, secondPaymentOfficerEmail, requestedByUserEmail],
        variables: {
          recipient: teamName,
          reportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
          exporterName: exporter,
          reasonsList: formatReasonsAsBulletedListForEmail(reasons),
        },
      });
    });
  });

  describe('sendFeeRecordCorrectionRequestEmails', () => {
    it('should send the fee record correction request emails to bank payment officers and requested by user', async () => {
      // Arrange
      const reasons: RecordCorrectionReason[] = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];
      const reportPeriod = aReportPeriod();
      const exporter = 'Potato exporter';
      const requestedByUserEmail = 'tfm-user@email.com';

      // Act
      await sendFeeRecordCorrectionRequestEmails(reasons, reportPeriod, exporter, requestedByUserEmail, teamName, teamEmails);

      // Assert
      const { variables } = generateFeeRecordCorrectionRequestEmailParameters(reasons, reportPeriod, exporter, requestedByUserEmail, teamName, teamEmails);
      expect(externalApi.sendEmail).toHaveBeenCalledTimes(3);
      expect(externalApi.sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_REQUEST, firstPaymentOfficerEmail, variables);
      expect(externalApi.sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_REQUEST, secondPaymentOfficerEmail, variables);
      expect(externalApi.sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_REQUEST, requestedByUserEmail, variables);
    });

    it('should return the notified email addresses', async () => {
      // Arrange
      const reasons: RecordCorrectionReason[] = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];
      const reportPeriod = aReportPeriod();
      const exporter = 'Potato exporter';
      const requestedByUserEmail = 'tfm-user@email.com';

      // Act
      const response = await sendFeeRecordCorrectionRequestEmails(reasons, reportPeriod, exporter, requestedByUserEmail, teamName, teamEmails);

      // Assert
      const { emails } = generateFeeRecordCorrectionRequestEmailParameters(reasons, reportPeriod, exporter, requestedByUserEmail, teamName, teamEmails);

      expect(response).toEqual({ emails });
    });

    it('should log and rethrow error if sending an email fails', async () => {
      const error = new Error('Failed to send second email');
      jest.mocked(externalApi.sendEmail).mockResolvedValueOnce().mockRejectedValueOnce(error);

      // Act + Assert
      await expect(sendFeeRecordCorrectionRequestEmails([], aReportPeriod(), 'test exporter', 'test2@test.com', teamName, teamEmails)).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith('Error sending fee record correction request email: %o', error);
    });
  });
});
