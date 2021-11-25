const {
  sendFirstTaskEmail,
  sendDealSubmitEmails,
  sendMiaAcknowledgement,
  sendAinMinAcknowledgement,
} = require('./send-deal-submit-emails');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');
const { gefFacilitiesList } = require('../emails/AIN-MIN-confirmation/gef-facilities-list');
const generateAinMinConfirmationEmailVars = require('../emails/AIN-MIN-confirmation/generate-email-variables');
const { generateMiaConfirmationEmailVars } = require('../emails/MIA-confirmation/generate-email-variables');

const CONSTANTS = require('../../constants');
const api = require('../api');

const MOCK_NOTIFY_EMAIL_RESPONSE = require('../__mocks__/mock-notify-email-response');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

describe('send-deal-submit-emails - GEF', () => {
  beforeEach(() => {
    api.sendEmail.mockClear();
    api.sendEmail = sendEmailApiSpy;
  });

  describe('GEF deal - AIN', () => {
    let mockGefDealAin;

    beforeEach(async () => {
      mockGefDealAin = await api.findOneDeal('MOCK_GEF_DEAL');
    });

    it('should call sendEmail and return object of sent emails', async () => {
      const mappedDeal = mapSubmittedDeal(mockGefDealAin);

      const result = await sendDealSubmitEmails(mappedDeal);

      const facilityLists = gefFacilitiesList(mappedDeal.facilities);

      const expectedEmailVariables = generateAinMinConfirmationEmailVars(
        mappedDeal,
        facilityLists,
      );

      expect(sendEmailApiSpy).toHaveBeenCalled();

      const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

      expect(lastSendEmailCall).toEqual([
        CONSTANTS.EMAIL_TEMPLATE_IDS.GEF_DEAL_SUBMIT_CONFIRMATION,
        mappedDeal.maker.email,
        { ...expectedEmailVariables },
      ]);

      expect(result).toEqual({
        firstTaskEmail: await sendFirstTaskEmail(mappedDeal),
        emailAcknowledgementMIA: await sendMiaAcknowledgement(mappedDeal),
        emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
      });
    });
  });

  describe('GEF deal - MIA', () => {
    let mockGefDealMia;

    beforeEach(async () => {
      mockGefDealMia = await api.findOneDeal('MOCK_GEF_DEAL_MIA');
    });

    it('should call sendEmail and return object of sent emails', async () => {
      const mappedDeal = mapSubmittedDeal(mockGefDealMia);

      const result = await sendDealSubmitEmails(mappedDeal);

      const expectedEmailVariables = generateMiaConfirmationEmailVars(mappedDeal);

      expect(sendEmailApiSpy).toHaveBeenCalled();

      const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

      expect(lastSendEmailCall).toEqual([
        CONSTANTS.EMAIL_TEMPLATE_IDS.GEF_DEAL_MIA_RECEIVED,
        mappedDeal.maker.email,
        { ...expectedEmailVariables },
      ]);

      expect(result).toEqual({
        firstTaskEmail: await sendFirstTaskEmail(mappedDeal),
        emailAcknowledgementMIA: MOCK_NOTIFY_EMAIL_RESPONSE,
        emailAcknowledgementAinMin: await sendAinMinAcknowledgement(mappedDeal),
      });
    });
  });

  describe('GEF deal - MIN', () => {
    let mockGefDealMin;

    beforeEach(async () => {
      mockGefDealMin = await api.findOneDeal('MOCK_GEF_DEAL_MIN');
    });

    it('should call sendEmail and return object of sent emails', async () => {
      const mappedDeal = mapSubmittedDeal(mockGefDealMin);

      const result = await sendDealSubmitEmails(mappedDeal);

      const facilityLists = gefFacilitiesList(mappedDeal.facilities);

      const expectedEmailVariables = generateAinMinConfirmationEmailVars(
        mappedDeal,
        facilityLists,
      );

      expect(sendEmailApiSpy).toHaveBeenCalled();

      const lastSendEmailCall = sendEmailApiSpy.mock.calls[1];

      expect(lastSendEmailCall).toEqual([
        CONSTANTS.EMAIL_TEMPLATE_IDS.GEF_DEAL_SUBMIT_CONFIRMATION,
        mappedDeal.maker.email,
        { ...expectedEmailVariables },
      ]);

      expect(result).toEqual({
        firstTaskEmail: await sendFirstTaskEmail(mappedDeal),
        emailAcknowledgementMIA: await sendMiaAcknowledgement(mappedDeal),
        emailAcknowledgementAinMin: MOCK_NOTIFY_EMAIL_RESPONSE,
      });
    });
  });
});
