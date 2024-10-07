import { createMocks } from 'node-mocks-http';
import { DayMonthYearInput, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { postEffectiveFromDate, PostEffectiveFromDateRequest } from './effective-from-date.controller';
import { EffectiveFromDateValidationViewModel, EffectiveFromDateViewModel } from '../../../types/view-models';
import api from '../../../api';

const validateEffectiveFromDateMock: jest.Mock<EffectiveFromDateValidationViewModel> = jest.fn(() => ({
  errors: null,
  effectiveFromDate: new Date(),
}));

jest.mock('./validation/validate-effective-from-date', () => ({
  validateEffectiveFromDate: (date: DayMonthYearInput) => validateEffectiveFromDateMock(date),
}));

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  updateDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';
const mockUser = aTfmSessionUser();
const defaultBackUrl = `/case/${dealId}/cancellation/bank-request-date`;

describe('postEffectiveFromDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<PostEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await postEffectiveFromDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<PostEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await postEffectiveFromDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/not-found`);
  });

  it('redirects to deal summary page if the submission type is invalid (MIA)', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });

    const { req, res } = createMocks<PostEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await postEffectiveFromDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/case/${dealId}/deal`);
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    describe('when there are validation errors', () => {
      const errors = {
        summary: [{ text: 'error summary text', href: `#error-field` }],
        effectiveFromDateError: { message: 'error text', fields: ['error-field'] },
      };

      const day = 1;
      const month = 0;
      const year = 'invalid year';

      const inputtedDate = {
        'effective-from-date-day': day,
        'effective-from-date-month': month,
        'effective-from-date-year': year,
      };

      beforeEach(() => {
        validateEffectiveFromDateMock.mockReturnValueOnce({ errors });
        jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
      });

      it('calls validateEffectiveFromDate', async () => {
        // Arrange
        const { req, res } = createMocks<PostEffectiveFromDateRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: inputtedDate,
        });

        // Act
        await postEffectiveFromDate(req, res);

        // Assert
        expect(validateEffectiveFromDateMock).toHaveBeenCalledTimes(1);
        expect(validateEffectiveFromDateMock).toHaveBeenCalledWith({ day, month, year });
      });

      it('renders the effective from page with errors', async () => {
        // Arrange
        const { req, res } = createMocks<PostEffectiveFromDateRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: inputtedDate,
        });

        // Act
        await postEffectiveFromDate(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
        expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          user: mockUser,
          ukefDealId,
          dealId,
          errors,
          day,
          month,
          year,
          backUrl: defaultBackUrl,
        });
      });

      it('renders the page with the back URL as the check details page when "change" is passed in as a query parameter', async () => {
        // Arrange
        const { req, res } = createMocks<PostEffectiveFromDateRequest>({
          params: { _id: dealId },
          query: { status: 'change' },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: inputtedDate,
        });

        // Act
        await postEffectiveFromDate(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
        expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          user: mockUser,
          ukefDealId,
          dealId,
          errors,
          day,
          month,
          year,
          backUrl: `/case/${dealId}/cancellation/check-details`,
        });
      });

      it('does not update the deal cancellation object', async () => {
        // Arrange
        const { req, res } = createMocks<PostEffectiveFromDateRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: inputtedDate,
        });

        // Act
        await postEffectiveFromDate(req, res);

        // Assert
        expect(api.updateDealCancellation).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    describe('when there are no validation errors', () => {
      const testDate = new Date('2024-03-21');

      beforeEach(() => {
        validateEffectiveFromDateMock.mockReturnValueOnce({
          errors: null,
          effectiveFromDate: testDate,
        });
        jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
      });

      it('updates the deal cancellation effective from date', async () => {
        // Arrange
        const userToken = 'userToken';

        const { req, res } = createMocks<PostEffectiveFromDateRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken,
          },
          body: {
            'effective-from-date-day': testDate.getDate(),
            'effective-from-date-month': testDate.getMonth() + 1,
            'effective-from-date-year': testDate.getFullYear(),
          },
        });

        // Act
        await postEffectiveFromDate(req, res);

        // Assert
        expect(api.updateDealCancellation).toHaveBeenCalledTimes(1);
        expect(api.updateDealCancellation).toHaveBeenCalledWith(dealId, { effectiveFrom: testDate.valueOf() }, userToken);
      });

      it('redirects to the check cancellation details page', async () => {
        // Arrange
        const userToken = 'userToken';

        const { req, res } = createMocks<PostEffectiveFromDateRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken,
          },
          body: {
            'effective-from-date-day': testDate.getDate(),
            'effective-from-date-month': testDate.getMonth() + 1,
            'effective-from-date-year': testDate.getFullYear(),
          },
        });

        // Act
        await postEffectiveFromDate(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe(`/case/${dealId}/cancellation/check-details`);
      });
    });
  });
});
