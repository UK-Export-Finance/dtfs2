import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE, TFM_DEAL_CANCELLATION_STATUS } from '@ukef/dtfs2-common';
import { aRequestSession } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { CancelCancellationViewModel } from '../../../types/view-models';
import { getCancelCancellation, GetCancelCancellationRequest } from './cancel-cancellation.controller';
import api from '../../../api';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  getDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

describe('getCancelCancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<GetCancelCancellationRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
    });

    // Act
    await getCancelCancellation(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<GetCancelCancellationRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
    });

    // Act
    await getCancelCancellation(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  describe(`when the deal type is ${DEAL_SUBMISSION_TYPE.MIA}`, () => {
    beforeEach(() => {
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });
    });

    it('redirects to deal summary page', async () => {
      // Arrange
      const { req, res } = createMocks<GetCancelCancellationRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getCancelCancellation(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });

    it('does not get the cancellation', async () => {
      // Arrange
      const { req, res } = createMocks<GetCancelCancellationRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getCancelCancellation(req, res);

      // Assert
      expect(api.getDealCancellation).toHaveBeenCalledTimes(0);
    });
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    beforeEach(() => {
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
    });

    it('redirects to deal summary page if the deal cancellation is empty', async () => {
      // Arrange
      jest.mocked(api.getDealCancellation).mockResolvedValue({});

      const { req, res } = createMocks<GetCancelCancellationRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getCancelCancellation(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });

    it('redirects to deal summary page if the deal cancellation is not in draft', async () => {
      // Arrange
      jest.mocked(api.getDealCancellation).mockResolvedValue({ status: TFM_DEAL_CANCELLATION_STATUS.COMPLETED });

      const { req, res } = createMocks<GetCancelCancellationRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getCancelCancellation(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });

    it('renders the cancel cancellation page', async () => {
      // Arrange
      jest.mocked(api.getDealCancellation).mockResolvedValue({ reason: 'reason', status: TFM_DEAL_CANCELLATION_STATUS.DRAFT });

      const previousPage = 'previousPage';
      const session = aRequestSession();

      const { req, res } = createMocks<GetCancelCancellationRequest>({
        params: { _id: dealId },
        session,
        headers: {
          referer: previousPage,
        },
      });

      // Act
      await getCancelCancellation(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/cancel.njk');
      expect(res._getRenderData() as CancelCancellationViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: session.user,
        ukefDealId,
        previousPage,
      });
    });
  });
});
