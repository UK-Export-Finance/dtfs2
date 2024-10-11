import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { aRequestSession } from '../../../../test-helpers';
import api from '../../../api';
import { postDealCancellationDetails, PostDealCancellationDetailsRequest } from './check-details.controller';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

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
    });

    // Act
    await postDealCancellationDetails(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to deal summary page if the submission type is invalid (MIA)', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });

    const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
    });

    // Act
    await postDealCancellationDetails(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    beforeEach(() => {
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
    });

    // TODO: DTFS2-7298 - test deal cancellation endpoints are called with correct payload

    it('redirects to the effective from date page', async () => {
      // Arrange
      const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await postDealCancellationDetails(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });
  });
});
