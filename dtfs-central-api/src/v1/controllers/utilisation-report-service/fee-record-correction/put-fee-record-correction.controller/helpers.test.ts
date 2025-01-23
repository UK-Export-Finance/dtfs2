import { getTfmUiUrl, getUkefGefReportingEmailRecipients } from '@ukef/dtfs2-common';
import { aBank } from '../../../../../../test-helpers';
import externalApi from '../../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';
import { sendCorrectionReceivedBankNotificationEmails, sendCorrectionReceivedUkefNotificationEmails, sendFeeRecordCorrectionReceivedEmails } from './helpers';
import { getBankById } from '../../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../../errors';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  getTfmUiUrl: jest.fn(),
  getUkefGefReportingEmailRecipients: jest.fn(),
}));

jest.mock('../../../../../repositories/banks-repo');
jest.mock('../../../../../external-api/api');

console.error = jest.fn();

describe('put-fee-record-correction.controller helpers', () => {
  const bankName = 'Bank Name';

  const firstPaymentOfficerEmail = 'officer-1@ukexportfinance.gov.uk';
  const secondPaymentOfficerEmail = 'officer-2@ukexportfinance.gov.uk';
  const teamName = 'Payment Officer Team';

  const bank = {
    ...aBank(),
    name: bankName,
    paymentOfficerTeam: {
      teamName,
      emails: [firstPaymentOfficerEmail, secondPaymentOfficerEmail],
    },
  };

  const exporter = 'Export Name';

  const firstGefReportingEmail = 'gef-reporting-1@ukexportfinance.gov.uk';
  const secondGefReportingEmail = 'gef-reporting-2@ukexportfinance.gov.uk';

  const tfmHomepageUrl = 'http://localhost:5003';

  beforeEach(() => {
    jest.mocked(getUkefGefReportingEmailRecipients).mockReturnValue([firstGefReportingEmail, secondGefReportingEmail]);
    jest.mocked(getTfmUiUrl).mockReturnValue(tfmHomepageUrl);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('sendCorrectionReceivedBankNotificationEmails', () => {
    it('should send an email to each payment officer', async () => {
      // Act
      await sendCorrectionReceivedBankNotificationEmails([firstPaymentOfficerEmail, secondPaymentOfficerEmail], teamName, exporter);

      // Assert
      expect(externalApi.sendEmail).toHaveBeenCalledTimes(2);

      const expectedTemplateId = EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_RECEIVED_BANK_NOTIFICATION;

      const expectedVariables = {
        recipient: teamName,
        exporterName: exporter,
      };

      expect(externalApi.sendEmail).toHaveBeenCalledWith(expectedTemplateId, firstPaymentOfficerEmail, expectedVariables);
      expect(externalApi.sendEmail).toHaveBeenCalledWith(expectedTemplateId, secondPaymentOfficerEmail, expectedVariables);
    });
  });

  describe('sendCorrectionReceivedUkefNotificationEmails', () => {
    it('should send an email to each gef reporting email', async () => {
      // Act
      await sendCorrectionReceivedUkefNotificationEmails(exporter, bankName);

      // Assert
      expect(externalApi.sendEmail).toHaveBeenCalledTimes(2);

      const expectedTemplateId = EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_RECEIVED_UKEF_NOTIFICATION;

      const expectedVariables = {
        bankName,
        exporterName: exporter,
        tfmHomepageUrl,
      };

      expect(externalApi.sendEmail).toHaveBeenCalledWith(expectedTemplateId, firstGefReportingEmail, expect.objectContaining(expectedVariables));
      expect(externalApi.sendEmail).toHaveBeenCalledWith(expectedTemplateId, secondGefReportingEmail, expect.objectContaining(expectedVariables));
    });
  });

  describe('sendFeeRecordCorrectionReceivedEmails', () => {
    describe('when bank is not found', () => {
      beforeEach(() => {
        jest.mocked(getBankById).mockResolvedValue(null);
      });

      it('should throw a NotFoundError', async () => {
        // Arrange
        jest.mocked(getBankById).mockResolvedValue(null);

        // Act & Assert
        await expect(sendFeeRecordCorrectionReceivedEmails(exporter, bank.id)).rejects.toThrow(new NotFoundError(`Bank not found: ${bank.id}`));
        expect(console.error).toHaveBeenCalledWith('Bank not found: %s', bank.id);
      });
    });

    describe('when bank is found', () => {
      beforeEach(() => {
        jest.mocked(getBankById).mockResolvedValue(bank);
      });

      it('should send emails to the bank and UKEF GEF reporting team', async () => {
        // Act
        await sendFeeRecordCorrectionReceivedEmails(exporter, bank.id);

        // Assert
        expect(externalApi.sendEmail).toHaveBeenCalledTimes(4);

        const expectedBankTemplateId = EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_RECEIVED_BANK_NOTIFICATION;
        const expectedUkefTemplateId = EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_RECEIVED_UKEF_NOTIFICATION;

        const expectedBankVariables = {
          recipient: teamName,
          exporterName: exporter,
        };

        const expectedUkefVariables = {
          bankName,
          exporterName: exporter,
          tfmHomepageUrl,
        };

        expect(externalApi.sendEmail).toHaveBeenCalledWith(expectedBankTemplateId, firstPaymentOfficerEmail, expectedBankVariables);
        expect(externalApi.sendEmail).toHaveBeenCalledWith(expectedBankTemplateId, secondPaymentOfficerEmail, expectedBankVariables);

        expect(externalApi.sendEmail).toHaveBeenCalledWith(expectedUkefTemplateId, firstGefReportingEmail, expect.objectContaining(expectedUkefVariables));
        expect(externalApi.sendEmail).toHaveBeenCalledWith(expectedUkefTemplateId, secondGefReportingEmail, expect.objectContaining(expectedUkefVariables));
      });

      it('should return the notified bank email addresses', async () => {
        // Act
        const response = await sendFeeRecordCorrectionReceivedEmails(exporter, bank.id);

        // Assert
        expect(response).toEqual({
          emails: [firstPaymentOfficerEmail, secondPaymentOfficerEmail],
        });
      });
    });
  });
});
