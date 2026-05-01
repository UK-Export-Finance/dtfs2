const { when } = require('jest-when');
const { canSubmitToApimGift, submitFacilitiesToApimGift } = require('../../../server/v1/integrations/apim-gift');
const { createACBS } = require('../../../server/v1/controllers/acbs.controller');
const canSubmitToACBS = require('../../../server/v1/helpers/can-submit-to-acbs');
const api = require('../../../server/v1/api');
const { mockUpdateDeal } = require('../../../server/v1/__mocks__/common-api-mocks');
const { issueJWT } = require('../../../server/utils/crypto.util');
const { findByUsername } = require('../../../server/v1/controllers/user/user.controller');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const app = require('../../../server/createApp');
const { createApi } = require('../../api');

jest.mock('../../../server/v1/controllers/user/user.controller', () => ({
  findByUsername: jest.fn(),
}));

jest.setTimeout(30000);

jest.mock('../../../server/v1/integrations/apim-gift', () => ({
  canSubmitToApimGift: jest.fn(),
  submitFacilitiesToApimGift: jest.fn(),
}));

jest.mock('../../../server/v1/controllers/acbs.controller', () => ({
  createACBS: jest.fn(),
}));

jest.mock('../../../server/v1/helpers/can-submit-to-acbs', () => jest.fn());

const { as, put } = createApi(app);

describe('PUT /v1/parties/:dealId', () => {
  const VALID_DEAL_ID = '61f6b18502fade01b1e8f07f';
  const INVALID_DEAL_ID = 'InvalidDealId';
  const VALID_URL = `/v1/parties/${VALID_DEAL_ID}`;

  const partiesUpdate = {
    exporter: {
      partyUrn: '123',
      partyUrnRequired: true,
    },
    buyer: {
      partyUrn: '456',
      partyUrnRequired: true,
    },
  };

  const mockUser = {
    _id: '61f6b18502fade01b1e8f07f',
    username: 'api-tester@ukexportfinance.gov.uk',
    teams: [],
    firstName: 'API',
    lastName: 'Tester',
  };

  let token;

  beforeEach(() => {
    api.updateDeal.mockReset();

    canSubmitToApimGift.mockReset();
    canSubmitToApimGift.mockResolvedValue({
      canSubmitFacilitiesToApimGift: false,
      issuedFacilities: [],
      isBssEwcsDeal: false,
      isGefDeal: true,
    });

    submitFacilitiesToApimGift.mockReset();

    canSubmitToACBS.mockReset();
    canSubmitToACBS.mockResolvedValue(false);

    createACBS.mockReset();

    const auth = issueJWT(mockUser);
    token = auth.token;

    findByUsername.mockImplementation((username, callback) => {
      callback(null, {
        ...mockUser,
        sessionIdentifier: auth.sessionIdentifier,
      });
    });

    mockUpdateDeal({
      _id: VALID_DEAL_ID,
      tfm: {
        parties: partiesUpdate,
      },
    });
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => put(VALID_URL, partiesUpdate),
    makeRequestWithAuthHeader: (authHeader) =>
      put(VALID_URL, partiesUpdate, {
        headers: { Authorization: authHeader },
      }),
  });

  it('returns updated parties', async () => {
    const { status, body } = await as({ token }).put(partiesUpdate).to(VALID_URL);

    expect(status).toEqual(200);
    expect(body).toEqual({
      updateParty: {
        parties: partiesUpdate,
      },
    });
    expect(canSubmitToApimGift).toHaveBeenCalledTimes(1);
  });

  it('calls submitFacilitiesToApimGift when APIM/GIFT submission is allowed', async () => {
    const issuedFacilities = [{ _id: 'facility-1' }];

    canSubmitToApimGift.mockResolvedValue({
      canSubmitFacilitiesToApimGift: true,
      issuedFacilities,
      isBssEwcsDeal: false,
      isGefDeal: true,
    });

    await as({ token }).put(partiesUpdate).to(VALID_URL);

    expect(submitFacilitiesToApimGift).toHaveBeenCalledWith({
      deal: expect.any(Object),
      facilities: issuedFacilities,
      isBssEwcsDeal: false,
      isGefDeal: true,
    });
  });

  it('does not call submitFacilitiesToApimGift when APIM/GIFT submission is not allowed', async () => {
    canSubmitToApimGift.mockResolvedValue({
      canSubmitFacilitiesToApimGift: false,
      issuedFacilities: [],
      isBssEwcsDeal: false,
      isGefDeal: true,
    });

    await as({ token }).put(partiesUpdate).to(VALID_URL);

    expect(submitFacilitiesToApimGift).not.toHaveBeenCalled();
  });

  it('returns 400 when deal id is invalid', async () => {
    const { status, body } = await as({ token }).put(partiesUpdate).to(`/v1/parties/${INVALID_DEAL_ID}`);

    expect(status).toEqual(400);
    expect(body).toEqual({
      errors: [
        {
          location: 'params',
          msg: 'The Deal ID (dealId) provided should be a Mongo ID',
          path: 'dealId',
          type: 'field',
          value: INVALID_DEAL_ID,
        },
      ],
      status: 400,
    });
  });

  it('returns 500 if updateDeal fails', async () => {
    when(api.updateDeal).calledWith(expect.anything()).mockRejectedValueOnce(new Error('update failed'));

    const { status } = await as({ token }).put(partiesUpdate).to(VALID_URL);

    expect(status).toEqual(500);
  });
});
