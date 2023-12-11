const { when } = require('jest-when');
const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const api = require('../../../src/v1/api');
const { mockUpdateDeal } = require('../../../src/v1/__mocks__/common-api-mocks');
const { DEAL_TYPE, SUBMISSION_TYPE, DEAL_STAGE_TFM, PORTAL_DEAL_STATUS, DEAL_COMMENT_TYPE_PORTAL } = require('../../../src/constants/deals');
const { PIM } = require('../../../src/constants/teams');
const MOCK_DEAL_AIN_SUBMITTED = require('../../../src/v1/__mocks__/mock-deal-AIN-submitted');
const MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('../../../src/v1/__mocks__/mock-deal-MIN-second-submit-facilities-unissued-to-issued');
const MOCK_GEF_DEAL_MIA = require('../../../src/v1/__mocks__/mock-gef-deal-MIA');
const MOCK_DEAL_MIA_SUBMITTED_FACILITIES_UNISSUED_TO_ISSUED = require('../../../src/v1/__mocks__/mock-deal-MIA-second-submit-facilities-unissued-to-issued');

describe('PUT /deals/:dealId/underwriting/managers-decision', () => {
  const PIM_EMAIL = 'pim-test@ukexportfinance.com';
  const BANK_EMAIL = 'bank-test@ukexportfinance.com';
  const VALID_DEAL_ID = '61f94a2427c1a7009cde1b9d';
  const INVALID_DEAL_ID = 'InvalidDealId';
  const VALID_UNDERWRITER_MANAGERS_DECISION = {
    decision: DEAL_STAGE_TFM.UKEF_APPROVED_WITHOUT_CONDITIONS,
    userFullName: 'Test User',
  };
  const EXPECTED_NEW_PORTAL_STATUS = PORTAL_DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;

  let tokenUser;

  const resetMocks = () => {
    api.updateDeal.mockReset();
    api.updatePortalBssDealStatus.mockReset();
    api.updatePortalGefDealStatus.mockReset();
    api.addPortalDealComment.mockReset();
    api.addUnderwriterCommentToGefDeal.mockReset();
    api.findBankById.mockReset();
    api.findOneTeam.mockReset();
    api.sendEmail.mockReset();
  };

  beforeAll(async () => {
    tokenUser = await testUserCache.initialise(app);
  });

  beforeEach(() => {
    resetMocks();
    when(api.findOneTeam)
      .calledWith(PIM.id)
      .mockResolvedValueOnce({ email: PIM_EMAIL });
  });

  describe.each([{
    dealType: DEAL_TYPE.BSS_EWCS,
    miaDeal: MOCK_DEAL_MIA_SUBMITTED_FACILITIES_UNISSUED_TO_ISSUED,
    updateDealStatus: api.updatePortalBssDealStatus,
    addPortalDealComment: api.addPortalDealComment,
  }, {
    dealType: DEAL_TYPE.GEF,
    miaDeal: MOCK_GEF_DEAL_MIA,
    updateDealStatus: api.updatePortalGefDealStatus,
    addPortalDealComment: api.addUnderwriterCommentToGefDeal,
  }])('for a deal of type $dealType', ({ miaDeal, updateDealStatus, addPortalDealComment }) => {
    beforeEach(() => {
      when(api.updatePortalBssDealStatus)
        .calledWith(VALID_DEAL_ID, expect.any(Object))
        .mockResolvedValueOnce(undefined);
      when(api.updatePortalGefDealStatus)
        .calledWith(VALID_DEAL_ID, expect.any(Object))
        .mockResolvedValueOnce(undefined);
      when(api.findOneTeam)
        .calledWith(PIM.id)
        .mockResolvedValueOnce({ email: PIM_EMAIL });
    });

    it('should update the deal with the underwriter manager\'s decision', async () => {
      mockUpdateDeal(miaDeal);
      when(api.findBankById)
        .calledWith(miaDeal.maker.bank.id)
        .mockResolvedValueOnce({ emails: [BANK_EMAIL] });

      await as(tokenUser)
        .put(VALID_UNDERWRITER_MANAGERS_DECISION)
        .to(`/v1/deals/${VALID_DEAL_ID}/underwriting/managers-decision`);

      expect(api.updateDeal).toHaveBeenCalledWith(
        VALID_DEAL_ID,
        expect.objectContaining({
          tfm: {
            underwriterManagersDecision: {
              decision: VALID_UNDERWRITER_MANAGERS_DECISION.decision,
              userFullName: VALID_UNDERWRITER_MANAGERS_DECISION.userFullName,
              timestamp: expect.any(Number),
            },
            stage: VALID_UNDERWRITER_MANAGERS_DECISION.decision,
          }
        }),
        expect.any(Function),
      );
    });

    it('should update the deal\'s status in portal', async () => {
      mockUpdateDeal(miaDeal);
      when(api.findBankById)
        .calledWith(miaDeal.maker.bank.id)
        .mockResolvedValueOnce({ emails: [BANK_EMAIL] });

      await as(tokenUser)
        .put(VALID_UNDERWRITER_MANAGERS_DECISION)
        .to(`/v1/deals/${VALID_DEAL_ID}/underwriting/managers-decision`);

      expect(updateDealStatus).toHaveBeenCalledWith(VALID_DEAL_ID, EXPECTED_NEW_PORTAL_STATUS);
    });

    it('should add a comment to the deal in portal', async () => {
      mockUpdateDeal(miaDeal);
      when(api.findBankById)
        .calledWith(miaDeal.maker.bank.id)
        .mockResolvedValueOnce({ emails: [BANK_EMAIL] });

      await as(tokenUser)
        .put(VALID_UNDERWRITER_MANAGERS_DECISION)
        .to(`/v1/deals/${VALID_DEAL_ID}/underwriting/managers-decision`);

      expect(addPortalDealComment).toHaveBeenCalledWith(VALID_DEAL_ID, DEAL_COMMENT_TYPE_PORTAL.UKEF_DECISION, {
        text: undefined,
        decision: EXPECTED_NEW_PORTAL_STATUS,
      });
    });

    it('should return a 500 if adding a comment to the deal via DTFS Central rejects', async () => {
      mockUpdateDeal(miaDeal);
      when(api.findBankById)
        .calledWith(miaDeal.maker.bank.id)
        .mockResolvedValueOnce({ emails: [BANK_EMAIL] });
      when(addPortalDealComment)
        .calledWith(VALID_DEAL_ID, expect.any(String), expect.any(Object))
        .mockRejectedValueOnce(new Error('Test failure'));

      const { status, body } = await as(tokenUser)
        .put(VALID_UNDERWRITER_MANAGERS_DECISION)
        .to(`/v1/deals/${VALID_DEAL_ID}/underwriting/managers-decision`);

      expect(status).toBe(500);
      expect(body).toEqual({
        data: 'Unable to update the underwriter manager\'s decision',
      });
    });

    describe('when the deal submission type is MIA', () => {
      beforeEach(() => {
        mockUpdateDeal(miaDeal);
        when(api.findBankById)
          .calledWith(miaDeal.maker.bank.id)
          .mockResolvedValueOnce({ emails: [BANK_EMAIL] });
      });

      it('sends an email to the maker about the decision', async () => {
        await as(tokenUser)
          .put(VALID_UNDERWRITER_MANAGERS_DECISION)
          .to(`/v1/deals/${VALID_DEAL_ID}/underwriting/managers-decision`);

        expect(api.sendEmail).toHaveBeenCalledWith(expect.any(String), miaDeal.maker.email, expect.any(Object));
      });

      it('sends an email to the bank about the decision', async () => {
        await as(tokenUser)
          .put(VALID_UNDERWRITER_MANAGERS_DECISION)
          .to(`/v1/deals/${VALID_DEAL_ID}/underwriting/managers-decision`);

        expect(api.sendEmail).toHaveBeenCalledWith(expect.any(String), BANK_EMAIL, expect.any(Object));
      });

      it('sends an email to PIM about the decision', async () => {
        await as(tokenUser)
          .put(VALID_UNDERWRITER_MANAGERS_DECISION)
          .to(`/v1/deals/${VALID_DEAL_ID}/underwriting/managers-decision`);

        expect(api.sendEmail).toHaveBeenCalledWith(expect.any(String), PIM_EMAIL, expect.any(Object));
      });
    });

    describe.each([{
      submissionType: SUBMISSION_TYPE.AIN,
      deal: MOCK_DEAL_AIN_SUBMITTED,
    }, {
      submissionType: SUBMISSION_TYPE.MIN,
      deal: MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED,
    }])('when the deal submission type is $submissionType', ({ deal }) => {
      it('does not send any emails', async () => {
        mockUpdateDeal(deal);
        when(api.findBankById)
          .calledWith(deal.maker.bank.id)
          .mockResolvedValueOnce({ emails: [BANK_EMAIL] });

        await as(tokenUser)
          .put(VALID_UNDERWRITER_MANAGERS_DECISION)
          .to(`/v1/deals/${VALID_DEAL_ID}/underwriting/managers-decision`);

        expect(api.sendEmail).not.toHaveBeenCalled();
      });
    });
  });

  it('should return a 400 if deal id is invalid', async () => {
    const { status, body } = await as(tokenUser)
      .put(VALID_UNDERWRITER_MANAGERS_DECISION)
      .to(`/v1/deals/${INVALID_DEAL_ID}/underwriting/managers-decision`);

    expect(status).toBe(400);
    expect(body).toEqual({
      errors: [{
        location: 'params',
        msg: 'The Deal ID (dealId) provided should be a Mongo ID',
        path: 'dealId',
        type: 'field',
        value: INVALID_DEAL_ID
      }],
      status: 400,
    });
  });

  it('should return a 500 if updating the deal via DTFS Central rejects', async () => {
    when(api.updateDeal)
      .calledWith(VALID_DEAL_ID, expect.any(Object))
      .mockRejectedValueOnce(new Error(`Updating the deal with dealId ${VALID_DEAL_ID} failed with status 500 and message: test error message`));

    const { status, body } = await as(tokenUser)
      .put(VALID_UNDERWRITER_MANAGERS_DECISION)
      .to(`/v1/deals/${VALID_DEAL_ID}/underwriting/managers-decision`);

    expect(status).toBe(500);
    expect(body).toEqual({
      data: 'Unable to update the underwriter manager\'s decision',
    });
  });
});
