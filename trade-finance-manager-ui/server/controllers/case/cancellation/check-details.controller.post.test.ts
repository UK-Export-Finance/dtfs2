import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { aRequestSession } from '../../../../test-helpers';
import api from '../../../api';
import { postDealCancellationDetails, PostDealCancellationDetailsRequest } from './check-details.controller';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  submitDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

const reason = 'reason';
const bankRequestDate = new Date().valueOf().toString();
const effectiveFrom = new Date().valueOf().toString();

describe('postBankRequestDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
      body: { reason, bankRequestDate, effectiveFrom },
    });

    // Act
    await postDealCancellationDetails(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
      body: { reason, bankRequestDate, effectiveFrom },
    });

    // Act
    await postDealCancellationDetails(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    beforeEach(() => {
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
    });

    it('submits the deal cancellation', async () => {
      // Arrange
      const session = aRequestSession();

      const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
        params: { _id: dealId },
        session,
        body: { reason, bankRequestDate, effectiveFrom },
      });

      // Act
      await postDealCancellationDetails(req, res);

      // Assert
      expect(api.submitDealCancellation).toHaveBeenCalledTimes(1);
      expect(api.submitDealCancellation).toHaveBeenCalledWith(
        dealId,
        { reason, bankRequestDate: Number(bankRequestDate), effectiveFrom: Number(effectiveFrom) },
        session.userToken,
      );
    });

    it('redirects to the deal summary', async () => {
      // Arrange
      const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
        body: { reason, bankRequestDate, effectiveFrom },
      });

      // Act
      await postDealCancellationDetails(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });
  });
});
