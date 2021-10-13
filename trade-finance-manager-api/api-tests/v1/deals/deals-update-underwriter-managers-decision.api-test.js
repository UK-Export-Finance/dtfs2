const app = require('../../../src/createApp');
const api = require('../../api')(app);
const externalApis = require('../../../src/v1/api');
const { updateTfmUnderwriterManagersDecision } = require('../../../src/v1/controllers/deal.controller');
const mapTfmDealStageToPortalStatus = require('../../../src/v1/mappings/map-tfm-deal-stage-to-portal-status');

const MOCK_DEAL_MIA_SUBMITTED = require('../../../src/v1/__mocks__/mock-deal-MIA-submitted');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../src/v1/__mocks__/mock-notify-email-response');
const CONSTANTS = require('../../../src/constants');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

const updatePortalBssDealStatusSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

describe('update tfm underwriter managers decision', () => {
  const dealId = MOCK_DEAL_MIA_SUBMITTED._id;
  const comments = 'Testing';
  const internalComments = '';
  const userFullName = 'Test User';

  beforeEach(async () => {
    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;

    await api.put({ dealId }).to('/v1/deals/submit');

    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;
    updatePortalBssDealStatusSpy.mockClear();
    externalApis.updatePortalBssDealStatus = updatePortalBssDealStatusSpy;
  });

  describe('when deal is MIA with decision: approved with conditions', () => {
    it('should send email', async () => {
      const decision = 'Approved (with conditions)';

      await updateTfmUnderwriterManagersDecision(
        dealId,
        decision,
        comments,
        internalComments,
        userFullName,
      );

      const expected = {
        templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_APPROVED_WITH_CONDITIONS,
        sendToEmailAddress: MOCK_DEAL_MIA_SUBMITTED.details.maker.email,
        emailVariables: {
          recipientName: MOCK_DEAL_MIA_SUBMITTED.details.maker.firstname,
          exporterName: MOCK_DEAL_MIA_SUBMITTED.submissionDetails['supplier-name'],
          bankReferenceNumber: MOCK_DEAL_MIA_SUBMITTED.details.bankSupplyContractID,
          ukefDealId: MOCK_DEAL_MIA_SUBMITTED.details.ukefDealId,
          conditions: comments,
        },
      };

      expect(sendEmailApiSpy).toBeCalledTimes(1);
      expect(sendEmailApiSpy).toHaveBeenCalledWith(
        expected.templateId,
        expected.sendToEmailAddress,
        expected.emailVariables,
      );
    });
  });

  describe('when deal is MIA with decision: approved without conditions', () => {
    it('should send email', async () => {
      const decision = 'Approved (without conditions)';

      await updateTfmUnderwriterManagersDecision(
        dealId,
        decision,
        comments,
        internalComments,
        userFullName,
      );

      const expected = {
        templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_APPROVED_WITHOUT_CONDITIONS,
        sendToEmailAddress: MOCK_DEAL_MIA_SUBMITTED.details.maker.email,
        emailVariables: {
          recipientName: MOCK_DEAL_MIA_SUBMITTED.details.maker.firstname,
          exporterName: MOCK_DEAL_MIA_SUBMITTED.submissionDetails['supplier-name'],
          bankReferenceNumber: MOCK_DEAL_MIA_SUBMITTED.details.bankSupplyContractID,
          ukefDealId: MOCK_DEAL_MIA_SUBMITTED.details.ukefDealId,
        },
      };

      expect(sendEmailApiSpy).toBeCalledTimes(1);
      expect(sendEmailApiSpy).toHaveBeenCalledWith(
        expected.templateId,
        expected.sendToEmailAddress,
        expected.emailVariables,
      );
    });
  });

  describe('when deal is MIA with decision: declined', () => {
    it('should send email', async () => {
      const decision = 'Declined';

      await updateTfmUnderwriterManagersDecision(
        dealId,
        decision,
        comments,
        internalComments,
        userFullName,
      );

      const expected = {
        templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_DECLINED,
        sendToEmailAddress: MOCK_DEAL_MIA_SUBMITTED.details.maker.email,
        emailVariables: {
          recipientName: MOCK_DEAL_MIA_SUBMITTED.details.maker.firstname,
          exporterName: MOCK_DEAL_MIA_SUBMITTED.submissionDetails['supplier-name'],
          bankReferenceNumber: MOCK_DEAL_MIA_SUBMITTED.details.bankSupplyContractID,
          ukefDealId: MOCK_DEAL_MIA_SUBMITTED.details.ukefDealId,
          reasonForRejection: comments,
        },
      };

      expect(sendEmailApiSpy).toBeCalledTimes(1);
      expect(sendEmailApiSpy).toHaveBeenCalledWith(
        expected.templateId,
        expected.sendToEmailAddress,
        expected.emailVariables,
      );
    });
  });

  it('should call api.updatePortalBssDealStatus', async () => {
    const decision = 'Declined';

    await updateTfmUnderwriterManagersDecision(
      dealId,
      decision,
      comments,
      internalComments,
      userFullName,
    );

    expect(updatePortalBssDealStatusSpy).toHaveBeenCalledWith(
      dealId,
      mapTfmDealStageToPortalStatus(decision),
    );
  });
});
