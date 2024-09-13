import { createMocks } from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../test-helpers';
import {
  getReasonForCancelling,
  GetReasonForCancellingRequest,
  postReasonForCancelling,
  PostReasonForCancellingRequest,
} from './reason-for-cancelling.controller';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { ReasonForCancellingErrorsViewModel, ReasonForCancellingViewModel } from '../../../types/view-models';

const validateReasonForCancellingMock: jest.Mock<ReasonForCancellingErrorsViewModel> = jest.fn(() => ({
  errorSummary: [],
  reasonForCancellingErrorMessage: undefined,
}));

jest.mock('./validation/validate-reason-for-cancelling', () => ({
  validateReasonForCancelling: (reason: string | undefined) => validateReasonForCancellingMock(reason),
}));

const dealId = 'dealId';
const mockUser = aTfmSessionUser();

describe('getReasonForCancelling', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the reason for cancelling page', () => {
    // Arrange
    const { req, res } = createMocks<GetReasonForCancellingRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    getReasonForCancelling(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('case/cancellation/reason-for-cancelling.njk');
    expect(res._getRenderData() as ReasonForCancellingViewModel).toEqual({
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user: mockUser,
      ukefDealId: '0040613574', // TODO: DTFS2-7350 get values from database
      dealId,
    });
  });
});

describe('postReasonForCancelling', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when there are validation errors', () => {
    const validationErrors = {
      errorSummary: [{ text: 'an error', href: 'reason ' }],
      reasonForCancellingErrorMessage: 'reasonForCancellingErrorMessage',
    };

    beforeEach(() => {
      validateReasonForCancellingMock.mockReturnValueOnce(validationErrors);
    });

    it('calls validateReasonForCancelling', () => {
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
      postReasonForCancelling(req, res);

      expect(validateReasonForCancellingMock).toHaveBeenCalledTimes(1);
      expect(validateReasonForCancellingMock).toHaveBeenCalledWith(reasonForCancelling);
    });

    it('renders the reason for cancelling page with errors', () => {
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
      postReasonForCancelling(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/reason-for-cancelling.njk');
      expect(res._getRenderData() as ReasonForCancellingViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: mockUser,
        ukefDealId: '0040613574', // TODO: DTFS2-7350 get values from database
        dealId,
        errors: validationErrors,
        reasonForCancelling,
      });
    });
  });

  describe('when there are no validation errors', () => {
    beforeEach(() => {
      validateReasonForCancellingMock.mockReturnValueOnce({
        errorSummary: [],
        reasonForCancellingErrorMessage: undefined,
      });
    });

    it('redirects to the bank request date page', () => {
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
      postReasonForCancelling(req, res);

      expect(res._getRedirectUrl()).toBe(`/case/${dealId}/cancellation/bank-request-date`);
    });
  });
});
