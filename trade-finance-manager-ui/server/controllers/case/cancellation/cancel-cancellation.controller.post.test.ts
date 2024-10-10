import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { aRequestSession } from '../../../../test-helpers';
import { postCancelCancellation, PostCancelCancellationRequest } from './cancel-cancellation.controller';
import api from '../../../api';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  deleteDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

describe('postCancelCancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to previous page if return=`true`', async () => {
    // Arrange
    const previousPage = `/case/${dealId}/cancellation/reason`;

    const { req, res } = createMocks<PostCancelCancellationRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
      query: {
        return: 'true',
      },
      body: {
        previousPage,
      },
    });

    // Act
    await postCancelCancellation(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(previousPage);
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<PostCancelCancellationRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
    });

    // Act
    await postCancelCancellation(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<PostCancelCancellationRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
    });

    // Act
    await postCancelCancellation(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/not-found`);
  });

  describe(`when the deal type is ${DEAL_SUBMISSION_TYPE.MIA}`, () => {
    beforeEach(() => {
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });
    });

    it('redirects to deal summary page', async () => {
      // Arrange
      const { req, res } = createMocks<PostCancelCancellationRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await postCancelCancellation(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe(`/case/${dealId}/deal`);
    });

    it('does not delete the deal cancellation', async () => {
      // Arrange
      const { req, res } = createMocks<PostCancelCancellationRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await postCancelCancellation(req, res);

      // Assert
      expect(api.deleteDealCancellation).toHaveBeenCalledTimes(0);
    });
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    it('calls deleteDealCancellation with the correct arguments', async () => {
      // Arrange
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });

      const userToken = 'userToken';

      const { req, res } = createMocks<PostCancelCancellationRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await postCancelCancellation(req, res);

      // Assert
      expect(api.deleteDealCancellation).toHaveBeenCalledTimes(1);
      expect(api.deleteDealCancellation).toHaveBeenCalledWith(dealId, userToken);
    });

    it('redirects to the deal summary page', async () => {
      // Arrange
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });

      const { req, res } = createMocks<PostCancelCancellationRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await postCancelCancellation(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe(`/case/${dealId}/deal`);
    });
  });
});
