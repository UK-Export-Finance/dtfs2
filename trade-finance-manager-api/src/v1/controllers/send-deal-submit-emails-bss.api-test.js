const {
  sendFirstTaskEmail,
  sendDealSubmitEmails,
  generateBssDealAinMinConfirmationEmailVariables,
  sendMiaAcknowledgement,
} = require('./send-deal-submit-emails');
const { generateFacilityLists } = require('../helpers/notify-template-formatters');

const CONSTANTS = require('../../constants');
const api = require('../api');

const MOCK_NOTIFY_EMAIL_RESPONSE = require('../__mocks__/mock-notify-email-response');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

describe('send-deal-submit-emails - BSS', () => {
  let mockDeal;

  beforeEach(async () => {
    api.sendEmail.mockClear();
    api.sendEmail = sendEmailApiSpy;

    const mockDealMia = await api.findOneDeal('MOCK_MIA_NOT_SUBMITTED');

    mockDeal = {
      _id: mockDealMia._id,
      ukefDealId: mockDealMia.dealSnapshot.details.ukefDealId,
      submissionType: mockDealMia.dealSnapshot.submissionType,
      bankReferenceNumber: mockDealMia.dealSnapshot.bankInternalRefName,
      maker: mockDealMia.dealSnapshot.maker,
      exporter: {
        companyName: mockDealMia.dealSnapshot.exporter.companyName,
      },
      facilities: [
        ...mockDealMia.dealSnapshot.bondTransactions.items,
        ...mockDealMia.dealSnapshot.loanTransactions.items,
      ],
      tfm: mockDealMia.tfm,
    };
  });

  describe('BSS deal', () => {
    describe('MIA with no issued facilities', () => {
      it('should return object of sent emails', async () => {
        const result = await sendDealSubmitEmails(mockDeal);

        const expected = {
          firstTaskEmail: await sendFirstTaskEmail(mockDeal),
          emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDeal),
          emailAcknowledgementAinMin: null,
        };

        expect(result).toEqual(expected);
      });
    });

    describe('MIN with issued and unissued facilities', () => {
      let mockDealIssuedAndUnissued;

      beforeAll(async () => {
        const mockDealMin = await api.findOneDeal('MOCK_DEAL_MIN');

        mockDealIssuedAndUnissued = {
          _id: mockDealMin._id,
          dealType: mockDealMin.dealSnapshot.dealType,
          ukefDealId: mockDealMin.dealSnapshot.details.ukefDealId,
          submissionType: mockDealMin.dealSnapshot.submissionType,
          bankReferenceNumber: mockDealMin.dealSnapshot.bankInternalRefName,
          maker: mockDealMin.dealSnapshot.maker,
          exporter: {
            companyName: mockDealMin.dealSnapshot.exporter.companyName,
          },
          facilities: [
            {
              ...mockDealMin.dealSnapshot.bondTransactions.items[0],
              hasBeenIssued: false, // field is added during deal.submit mapping
            },
            {
              ...mockDealMin.dealSnapshot.loanTransactions.items[0],
              hasBeenIssued: true, // field is added during deal.submit mapping
            },
          ],
          tfm: mockDealMin.tfm,
        };
      });

      it('should call sendEmail and return object of sent emails', async () => {
        const result = await sendDealSubmitEmails(mockDealIssuedAndUnissued);

        const facilityLists = generateFacilityLists(
          mockDealIssuedAndUnissued.dealType,
          mockDealIssuedAndUnissued.facilities,
        );

        const expectedEmailVariables = generateBssDealAinMinConfirmationEmailVariables(
          mockDealIssuedAndUnissued,
          facilityLists,
        );

        expect(sendEmailApiSpy).toHaveBeenCalled();

        const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

        expect(lastSendEmailCall).toEqual([
          CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION,
          mockDealIssuedAndUnissued.maker.email,
          { ...expectedEmailVariables },
        ]);

        expect(result).toEqual({
          firstTaskEmail: await sendFirstTaskEmail(mockDealIssuedAndUnissued),
          emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDealIssuedAndUnissued),
          emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
        });
      });
    });

    describe('MIN with issued facilities', () => {
      let mockDealIssued;

      beforeAll(async () => {
        const mockDealMin = await api.findOneDeal('MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED');

        mockDealIssued = {
          _id: mockDealMin._id,
          dealType: mockDealMin.dealSnapshot.dealType,
          ukefDealId: mockDealMin.dealSnapshot.details.ukefDealId,
          submissionType: mockDealMin.dealSnapshot.submissionType,
          bankReferenceNumber: mockDealMin.dealSnapshot.bankInternalRefName,
          maker: mockDealMin.dealSnapshot.maker,
          exporter: {
            companyName: mockDealMin.dealSnapshot.exporter.companyName,
          },
          facilities: [
            {
              ...mockDealMin.dealSnapshot.bondTransactions.items[0],
              hasBeenIssued: true, // field is added during deal.submit mapping
            },
            {
              ...mockDealMin.dealSnapshot.loanTransactions.items[0],
              hasBeenIssued: true, // field is added during deal.submit mapping
            },
          ],
          tfm: mockDealMin.tfm,
        };
      });

      it('should call sendEmail and return object of sent emails', async () => {
        const result = await sendDealSubmitEmails(mockDealIssued);

        const facilityLists = generateFacilityLists(
          mockDealIssued.dealType,
          mockDealIssued.facilities,
        );

        const expectedEmailVariables = generateBssDealAinMinConfirmationEmailVariables(mockDealIssued, facilityLists);

        expect(sendEmailApiSpy).toHaveBeenCalled();

        const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

        expect(lastSendEmailCall).toEqual([
          CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION,
          mockDealIssued.maker.email,
          { ...expectedEmailVariables },
        ]);

        expect(result).toEqual({
          firstTaskEmail: await sendFirstTaskEmail(mockDealIssued),
          emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDealIssued),
          emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
        });
      });
    });

    describe('AIN with issued and unissued facilities', () => {
      let mockDealIssuedAndUnissued;

      beforeEach(async () => {
        const mockDealAin = await api.findOneDeal('AIN_DEAL_SUBMITTED');

        mockDealIssuedAndUnissued = {
          _id: mockDealAin._id,
          dealType: mockDealAin.dealSnapshot.dealType,
          ukefDealId: mockDealAin.dealSnapshot.details.ukefDealId,
          submissionType: mockDealAin.dealSnapshot.submissionType,
          bankReferenceNumber: mockDealAin.dealSnapshot.bankInternalRefName,
          maker: mockDealAin.dealSnapshot.maker,
          exporter: {
            companyName: mockDealAin.dealSnapshot.exporter.companyName,
          },
          facilities: [
            {
              ...mockDealAin.dealSnapshot.bondTransactions.items[0],
              hasBeenIssued: false, // field is added during deal.submit mapping
            },
            {
              ...mockDealAin.dealSnapshot.loanTransactions.items[0],
              hasBeenIssued: true, // field is added during deal.submit mapping
            },
          ],
          tfm: mockDealAin.tfm,
        };
      });

      it('should call sendEmail and return object of sent emails', async () => {
        const result = await sendDealSubmitEmails(mockDealIssuedAndUnissued);

        const facilityLists = generateFacilityLists(
          mockDealIssuedAndUnissued.dealType,
          mockDealIssuedAndUnissued.facilities,
        );

        const expectedEmailVariables = generateBssDealAinMinConfirmationEmailVariables(
          mockDealIssuedAndUnissued,
          facilityLists,
        );

        expect(sendEmailApiSpy).toHaveBeenCalled();

        const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

        expect(lastSendEmailCall).toEqual([
          CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION,
          mockDealIssuedAndUnissued.maker.email,
          { ...expectedEmailVariables },
        ]);

        expect(result).toEqual({
          firstTaskEmail: await sendFirstTaskEmail(mockDealIssuedAndUnissued),
          emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDealIssuedAndUnissued),
          emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
        });
      });
    });

    describe('AIN with issued facilities', () => {
      let mockDealIssued;

      beforeEach(async () => {
        const mockDealAin = await api.findOneDeal('MOCK_DEAL_ISSUED_FACILITIES');

        mockDealIssued = {
          _id: mockDealAin._id,
          dealType: mockDealAin.dealSnapshot.dealType,
          ukefDealId: mockDealAin.dealSnapshot.details.ukefDealId,
          submissionType: mockDealAin.dealSnapshot.submissionType,
          bankReferenceNumber: mockDealAin.dealSnapshot.bankInternalRefName,
          maker: mockDealAin.dealSnapshot.maker,
          exporter: {
            companyName: mockDealAin.dealSnapshot.exporter.companyName,
          },
          facilities: [
            {
              ...mockDealAin.dealSnapshot.bondTransactions.items[0],
              hasBeenIssued: true, // field is added during deal.submit mapping
            },
            {
              ...mockDealAin.dealSnapshot.loanTransactions.items[0],
              hasBeenIssued: true, // field is added during deal.submit mapping
            },
          ],
          tfm: mockDealAin.tfm,
        };
      });

      it('should call sendEmail and return object of sent emails', async () => {
        const result = await sendDealSubmitEmails(mockDealIssued);

        const facilityLists = generateFacilityLists(
          mockDealIssued.dealType,
          mockDealIssued.facilities,
        );

        const expectedEmailVariables = generateBssDealAinMinConfirmationEmailVariables(
          mockDealIssued,
          facilityLists,
        );

        expect(sendEmailApiSpy).toHaveBeenCalled();

        const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

        expect(lastSendEmailCall).toEqual([
          CONSTANTS.EMAIL_TEMPLATE_IDS.BSS_DEAL_SUBMIT_CONFIRMATION,
          mockDealIssued.maker.email,
          { ...expectedEmailVariables },
        ]);

        expect(result).toEqual({
          firstTaskEmail: await sendFirstTaskEmail(mockDealIssued),
          emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDealIssued),
          emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
        });
      });
    });
  });
});
