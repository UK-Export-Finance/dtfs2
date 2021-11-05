const {
  sendDealSubmitEmails,
} = require('./send-deal-submit-emails');
const api = require('../api');

describe('sendDealSubmitEmails', () => {
  it('should return false when there is no deal', async () => {
    const result = await sendDealSubmitEmails();
    expect(result).toEqual(false);
  });
});
