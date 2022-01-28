const app = require('../../../src/createApp');
const api = require('../../api')(app);
const externalApis = require('../../../src/v1/api');
const { updateTfmUnderwriterManagersDecision } = require('../../../src/v1/controllers/deal.controller');
const mapTfmDealStageToPortalStatus = require('../../../src/v1/mappings/map-tfm-deal-stage-to-portal-status');

const MOCK_DEAL_BSS_MIA = require('../../../src/v1/__mocks__/mock-deal-MIA-submitted');
const MOCK_DEAL_GEF_MIA = require('../../../src/v1/__mocks__/mock-gef-deal-MIA');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../src/v1/__mocks__/mock-notify-email-response');
const CONSTANTS = require('../../../src/constants');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

const updatePortalBssDealStatusSpy = jest.fn(() => Promise.resolve({}));
const updatePortalGefDealStatusSpy = jest.fn(() => Promise.resolve({}));
const addUnderwriterCommentToGefDealSpy = jest.fn(() => Promise.resolve({}));
const addPortalDealCommentSpy = jest.fn(() => Promise.resolve({}));

describe('update tfm underwriter managers decision', () => {
  const bssDealId = MOCK_DEAL_BSS_MIA._id;
  const comments = 'Testing';
  const internalComments = '';
  const userFullName = 'Test User';

  beforeEach(async () => {
    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;

    await api.put({ bssDealId }).to('/v1/deals/submit');

    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;
    updatePortalBssDealStatusSpy.mockClear();
    externalApis.updatePortalBssDealStatus = updatePortalBssDealStatusSpy;
    externalApis.updatePortalGefDealStatus = updatePortalGefDealStatusSpy;
    externalApis.addUnderwriterCommentToGefDeal = addUnderwriterCommentToGefDealSpy;
    externalApis.addPortalDealComment = addPortalDealCommentSpy;
  });

  describe('when deal is MIA with decision: approved with conditions', () => {
    it('should send email', async () => {
      const decision = 'Approved (with conditions)';

      await updateTfmUnderwriterManagersDecision(
        bssDealId,
        decision,
        comments,
        internalComments,
        userFullName,
      );

      const expected = {
        templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_APPROVED_WITH_CONDITIONS,
        sendToEmailAddress: MOCK_DEAL_BSS_MIA.maker.email,
        emailVariables: {
          recipientName: MOCK_DEAL_BSS_MIA.maker.firstname,
          exporterName: MOCK_DEAL_BSS_MIA.exporter.companyName,
          name: MOCK_DEAL_BSS_MIA.bankInternalRefName,
          ukefDealId: MOCK_DEAL_BSS_MIA.details.ukefDealId,
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
        bssDealId,
        decision,
        comments,
        internalComments,
        userFullName,
      );

      const expected = {
        templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_APPROVED_WITHOUT_CONDITIONS,
        sendToEmailAddress: MOCK_DEAL_BSS_MIA.maker.email,
        emailVariables: {
          recipientName: MOCK_DEAL_BSS_MIA.maker.firstname,
          exporterName: MOCK_DEAL_BSS_MIA.exporter.companyName,
          name: MOCK_DEAL_BSS_MIA.bankInternalRefName,
          ukefDealId: MOCK_DEAL_BSS_MIA.details.ukefDealId,
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
        bssDealId,
        decision,
        comments,
        internalComments,
        userFullName,
      );

      const expected = {
        templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_DECLINED,
        sendToEmailAddress: MOCK_DEAL_BSS_MIA.maker.email,
        emailVariables: {
          recipientName: MOCK_DEAL_BSS_MIA.maker.firstname,
          exporterName: MOCK_DEAL_BSS_MIA.exporter.companyName,
          name: MOCK_DEAL_BSS_MIA.bankInternalRefName,
          ukefDealId: MOCK_DEAL_BSS_MIA.details.ukefDealId,
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

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should call api.updatePortalBssDealStatus', async () => {
      const decision = 'Declined';
      await updateTfmUnderwriterManagersDecision(bssDealId, decision, comments, internalComments, userFullName);
      expect(updatePortalBssDealStatusSpy).toHaveBeenCalledWith(bssDealId, mapTfmDealStageToPortalStatus(decision));
    });

    it('should call api.addPortalDealComment', async () => {
      const ukefDecision = 'ukefDecision';
      const ukefDecisionText = 'Application declined';

      await updateTfmUnderwriterManagersDecision(bssDealId, ukefDecision, ukefDecisionText, internalComments, userFullName);
      expect(addPortalDealCommentSpy).toHaveBeenCalledWith(bssDealId, 'ukefComments', { text: 'Testing', decision: 'Rejected by UKEF' });
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    const gefDealId = MOCK_DEAL_GEF_MIA._id;

    it('should call api.updatePortalGefDealStatus', async () => {
      const decision = 'Declined';

      await updateTfmUnderwriterManagersDecision(gefDealId, decision, comments, internalComments, userFullName);
      expect(updatePortalGefDealStatusSpy).toHaveBeenCalledWith(gefDealId, mapTfmDealStageToPortalStatus(decision));
    });

    it('should call api.addUnderwriterCommentToGefDeal', async () => {
      const decision = 'Declined';
      const ukefDecision = 'ukefDecision';

      await updateTfmUnderwriterManagersDecision(gefDealId, decision, comments, internalComments, userFullName);
      expect(addUnderwriterCommentToGefDealSpy).toHaveBeenCalledWith(gefDealId, ukefDecision, { text: 'Testing', decision: 'Rejected by UKEF' });
    });
  });
});
