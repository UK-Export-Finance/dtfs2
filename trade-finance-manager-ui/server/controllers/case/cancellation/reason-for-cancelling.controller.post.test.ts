import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../test-helpers';
import { postReasonForCancelling, PostReasonForCancellingRequest } from './reason-for-cancelling.controller';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { ReasonForCancellingErrorsViewModel, ReasonForCancellingViewModel } from '../../../types/view-models';
import api from '../../../api';

const validateReasonForCancellingMock: jest.Mock<ReasonForCancellingErrorsViewModel> = jest.fn(() => ({
  errorSummary: [],
  reasonForCancellingErrorMessage: undefined,
}));

jest.mock('./validation/validate-reason-for-cancelling', () => ({
  validateReasonForCancelling: (reason: string | undefined) => validateReasonForCancellingMock(reason),
}));

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  updateDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';
const mockUser = aTfmSessionUser();

describe('postReasonForCancelling', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.AIN } });
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<PostReasonForCancellingRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
      body: {
        reason: 'reasonForCancelling',
      },
    });

    // Act
    await postReasonForCancelling(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<PostReasonForCancellingRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
      body: {
        reason: 'reasonForCancelling',
      },
    });

    // Act
    await postReasonForCancelling(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to deal summary page if the submission type is invalid (MIA)', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });

    const { req, res } = createMocks<PostReasonForCancellingRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
      body: {
        reason: 'reasonForCancelling',
      },
    });

    // Act
    await postReasonForCancelling(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    describe('when there are validation errors', () => {
      const validationErrors = {
        errorSummary: [{ text: 'an error', href: 'reason ' }],
        reasonForCancellingErrorMessage: 'reasonForCancellingErrorMessage',
      };

      beforeEach(() => {
        validateReasonForCancellingMock.mockReturnValueOnce(validationErrors);
        jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
      });

      it('calls validateReasonForCancelling', async () => {
        // Arrange
        const reasonForCancelling = 'reasonForCancelling';
        const { req, res } = createMocks<PostReasonForCancellingRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: {
            reason: reasonForCancelling,
          },
        });

        // Act
        await postReasonForCancelling(req, res);

        expect(validateReasonForCancellingMock).toHaveBeenCalledTimes(1);
        expect(validateReasonForCancellingMock).toHaveBeenCalledWith(reasonForCancelling);
      });

      it('renders the reason for cancelling page with errors', async () => {
        // Arrange
        const reasonForCancelling = 'reasonForCancelling';
        const { req, res } = createMocks<PostReasonForCancellingRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: {
            reason: reasonForCancelling,
          },
        });

        // Act
        await postReasonForCancelling(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('case/cancellation/reason-for-cancelling.njk');
        expect(res._getRenderData() as ReasonForCancellingViewModel).toEqual({
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          user: mockUser,
          ukefDealId,
          dealId,
          errors: validationErrors,
          reasonForCancelling,
        });
      });

      it('does not update the deal cancellation object', async () => {
        // Arrange
        const reasonForCancelling = 'reasonForCancelling';
        const { req, res } = createMocks<PostReasonForCancellingRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: {
            reason: reasonForCancelling,
          },
        });

        // Act
        await postReasonForCancelling(req, res);

        // Assert
        expect(api.updateDealCancellation).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    describe('when there are no validation errors', () => {
      beforeEach(() => {
        validateReasonForCancellingMock.mockReturnValueOnce({
          errorSummary: [],
          reasonForCancellingErrorMessage: undefined,
        });
        jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
      });

      it('updates the deal cancellation reason', async () => {
        // Arrange
        const reason = 'reason';
        const userToken = 'userToken';

        const { req, res } = createMocks<PostReasonForCancellingRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken,
          },
          body: {
            reason,
          },
        });

        // Act
        await postReasonForCancelling(req, res);

        // Assert
        expect(api.updateDealCancellation).toHaveBeenCalledTimes(1);
        expect(api.updateDealCancellation).toHaveBeenCalledWith(dealId, { reason }, userToken);
      });

      it('redirects to the bank request date page', async () => {
        // Arrange
        const { req, res } = createMocks<PostReasonForCancellingRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: {
            reason: 'reasonForCancelling',
          },
        });

        // Act
        await postReasonForCancelling(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/cancellation/bank-request-date`);
      });
    });
  });
});
