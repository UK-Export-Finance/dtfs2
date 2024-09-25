import { createMocks } from 'node-mocks-http';
import { DayMonthYearInput } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { getEffectiveFromDate, GetEffectiveFromDateRequest, postEffectiveFromDate, PostEffectiveFromDateRequest } from './effective-from-date.controller';
import { EffectiveFromDateValidationViewModel, EffectiveFromDateViewModel } from '../../../types/view-models';

const validateEffectiveFromDateMock: jest.Mock<EffectiveFromDateValidationViewModel> = jest.fn(() => ({
  errors: null,
  effectiveFromDate: new Date(),
}));

jest.mock('./validation/validate-effective-from-date', () => ({
  validateEffectiveFromDate: (date: DayMonthYearInput) => validateEffectiveFromDateMock(date),
}));

const dealId = 'dealId';
const mockUser = aTfmSessionUser();

describe('getEffectiveFromDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the effective from date page', () => {
    // Arrange
    const { req, res } = createMocks<GetEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    getEffectiveFromDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
    expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user: mockUser,
      ukefDealId: '0040613574', // TODO: DTFS2-7417 get values from database
      dealId,
    });
  });
});

describe('postEffectiveFromDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

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
    });

    it('calls validateEffectiveFromDate', () => {
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
      postEffectiveFromDate(req, res);

      // Assert
      expect(validateEffectiveFromDateMock).toHaveBeenCalledTimes(1);
      expect(validateEffectiveFromDateMock).toHaveBeenCalledWith({ day, month, year });
    });

    it('renders the reason for cancelling page with errors', () => {
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
      postEffectiveFromDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
      expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: mockUser,
        ukefDealId: '0040613574', // TODO: DTFS2-7350 get values from database
        dealId,
        errors,
        day,
        month,
        year,
      });
    });
  });

  describe('when there are no validation errors', () => {
    beforeEach(() => {
      validateEffectiveFromDateMock.mockReturnValueOnce({
        errors: null,
        effectiveFromDate: new Date(),
      });
    });

    it('redirects to the effective from date page', () => {
      // Arrange
      const today = new Date();

      const { req, res } = createMocks<PostEffectiveFromDateRequest>({
        params: { _id: dealId },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
        body: {
          'effective-from-date-day': today.getDate(),
          'effective-from-date-month': today.getMonth() + 1,
          'effective-from-date-year': today.getFullYear(),
        },
      });

      // Act
      postEffectiveFromDate(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe(`/case/${dealId}/cancellation/check-details`);
    });
  });
});
