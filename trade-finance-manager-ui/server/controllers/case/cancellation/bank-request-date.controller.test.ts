import { createMocks } from 'node-mocks-http';
import { DayMonthYearInput } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { BankRequestDateValidationViewModel, BankRequestDateViewModel } from '../../../types/view-models';
import { getBankRequestDate, GetBankRequestDateRequest, postBankRequestDate, PostBankRequestDateRequest } from './bank-request-date.controller';

const validateBankRequestDateMock: jest.Mock<BankRequestDateValidationViewModel> = jest.fn(() => ({
  errors: null,
  bankRequestDate: new Date(),
}));

jest.mock('./validation/validate-bank-request-date', () => ({
  validateBankRequestDate: (date: DayMonthYearInput) => validateBankRequestDateMock(date),
}));

const dealId = 'dealId';
const mockUser = aTfmSessionUser();

describe('getBankRequestDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the bank request date page', () => {
    // Arrange
    const { req, res } = createMocks<GetBankRequestDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    getBankRequestDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('case/cancellation/bank-request-date.njk');
    expect(res._getRenderData() as BankRequestDateViewModel).toEqual({
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user: mockUser,
      ukefDealId: '0040613574', // TODO: DTFS2-7409 get values from database
      dealId,
    });
  });
});

describe('postBankRequestDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when there are validation errors', () => {
    const errors = {
      summary: [{ text: 'error summary text', href: `#error-field` }],
      bankRequestDateError: { message: 'error text', fields: ['error-field'] },
    };

    const day = 1;
    const month = 0;
    const year = 'invalid year';

    const inputtedDate = {
      'bank-request-date-day': day,
      'bank-request-date-month': month,
      'bank-request-date-year': year,
    };

    beforeEach(() => {
      validateBankRequestDateMock.mockReturnValueOnce({ errors });
    });

    it('calls validateBankRequestDate', () => {
      // Arrange
      const { req, res } = createMocks<PostBankRequestDateRequest>({
        params: { _id: dealId },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
        body: inputtedDate,
      });

      // Act
      postBankRequestDate(req, res);

      expect(validateBankRequestDateMock).toHaveBeenCalledTimes(1);
      expect(validateBankRequestDateMock).toHaveBeenCalledWith({ day, month, year });
    });

    it('renders the reason for cancelling page with errors', () => {
      // Arrange
      const { req, res } = createMocks<PostBankRequestDateRequest>({
        params: { _id: dealId },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
        body: inputtedDate,
      });

      // Act
      postBankRequestDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/bank-request-date.njk');
      expect(res._getRenderData() as BankRequestDateViewModel).toEqual({
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
      validateBankRequestDateMock.mockReturnValueOnce({
        errors: null,
        bankRequestDate: new Date(),
      });
    });

    it('redirects to the effective from date page', () => {
      // Arrange
      const today = new Date();

      const { req, res } = createMocks<PostBankRequestDateRequest>({
        params: { _id: dealId },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
        body: {
          'bank-request-date-day': today.getDate(),
          'bank-request-date-month': today.getMonth() + 1,
          'bank-request-date-year': today.getFullYear(),
        },
      });

      // Act
      postBankRequestDate(req, res);

      expect(res._getRedirectUrl()).toBe(`/case/${dealId}/cancellation/effective-from-date`);
    });
  });
});
