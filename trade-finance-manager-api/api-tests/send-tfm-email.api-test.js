const sendTfmEmail = require('../src/v1/controllers/send-tfm-email');
const app = require('../src/createApp');
const api = require('./api')(app);
const externalApis = require('../src/v1/api');
const { findOneDeal } = require('../src/v1/controllers/deal.controller');
const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../src/v1/__mocks__/mock-notify-email-response');

describe('sendTfmEmail', () => {
  const templateId = 'MOCK-NOTIFY-TEMPLATE-ID';
  const sendToEmailAddress = 'test@testing.com';
  const emailVariables = {
    name: 'Testing',
  };

  const sendEmailApiSpy = jest.fn(() => Promise.resolve(
    MOCK_NOTIFY_EMAIL_RESPONSE,
  ));

  beforeEach(() => {
    externalApis.sendEmail = sendEmailApiSpy;
  });

  it('should call api.sendEmail', async () => {
    const { body: submittedDeal } = await api.put({ dealId: MOCK_DEAL._id }).to('/v1/deals/submit');

    await sendTfmEmail(
      templateId,
      sendToEmailAddress,
      emailVariables,
      submittedDeal,
    );

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      templateId,
      sendToEmailAddress,
      emailVariables,
    );
  });

  it('should return response from api.sendEmail', async () => {
    const { body: submittedDeal } = await api.put({ dealId: MOCK_DEAL._id }).to('/v1/deals/submit');

    const result = await sendTfmEmail(
      templateId,
      sendToEmailAddress,
      emailVariables,
      submittedDeal,
    );

    expect(result).toEqual(MOCK_NOTIFY_EMAIL_RESPONSE);
  });

  it('should update deal emails history', async () => {
    const { body: submittedDeal } = await api.put({ dealId: MOCK_DEAL._id }).to('/v1/deals/submit');

    // check initial email history is empty
    expect(submittedDeal.tfm.history.emails).toEqual([]);

    await sendTfmEmail(
      templateId,
      sendToEmailAddress,
      emailVariables,
      submittedDeal,
    );

    const deal = await findOneDeal(MOCK_DEAL._id);

    expect(deal.tfm.history.emails[0].recipient).toEqual(sendToEmailAddress);
    expect(deal.tfm.history.emails[0].templateId).toEqual(templateId);
    expect(typeof deal.tfm.history.emails[0].timestamp).toEqual('string');
  });
});
