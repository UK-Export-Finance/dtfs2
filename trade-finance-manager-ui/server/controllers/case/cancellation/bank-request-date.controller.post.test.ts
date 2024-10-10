import { createMocks } from 'node-mocks-http';
import { DayMonthYearInput, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { BankRequestDateValidationViewModel, BankRequestDateViewModel } from '../../../types/view-models';
import { postBankRequestDate, PostBankRequestDateRequest } from './bank-request-date.controller';
import api from '../../../api';

const validateBankRequestDateMock: jest.Mock<BankRequestDateValidationViewModel> = jest.fn(() => ({
  errors: null,
  bankRequestDate: new Date(),
}));

jest.mock('./validation/validate-bank-request-date', () => ({
  validateBankRequestDate: (date: DayMonthYearInput) => validateBankRequestDateMock(date),
}));

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  updateDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';
const mockUser = aTfmSessionUser();

describe('postBankRequestDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<PostBankRequestDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await postBankRequestDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<PostBankRequestDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await postBankRequestDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to deal summary page if the submission type is invalid (MIA)', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });

    const { req, res } = createMocks<PostBankRequestDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await postBankRequestDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
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
        jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
      });

      it('calls validateBankRequestDate', async () => {
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
        await postBankRequestDate(req, res);

        expect(validateBankRequestDateMock).toHaveBeenCalledTimes(1);
        expect(validateBankRequestDateMock).toHaveBeenCalledWith({ day, month, year });
      });

      it('renders the bank request date page with errors', async () => {
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
        await postBankRequestDate(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('case/cancellation/bank-request-date.njk');
        expect(res._getRenderData() as BankRequestDateViewModel).toEqual({
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          user: mockUser,
          ukefDealId,
          dealId,
          errors,
          day,
          month,
          year,
          previousPage: `/case/${dealId}/cancellation/reason`,
        });
      });

      it('renders the page with the back URL as the check details page when "change" is passed in as a query parameter', async () => {
        // Arrange
        const { req, res } = createMocks<PostBankRequestDateRequest>({
          params: { _id: dealId },
          query: { status: 'change' },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: inputtedDate,
        });

        // Act
        await postBankRequestDate(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('case/cancellation/bank-request-date.njk');
        expect(res._getRenderData() as BankRequestDateViewModel).toEqual({
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          user: mockUser,
          ukefDealId,
          dealId,
          errors,
          day,
          month,
          year,
          previousPage: `/case/${dealId}/cancellation/check-details`,
        });
      });

      it('does not update the deal cancellation object', async () => {
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
        await postBankRequestDate(req, res);

        // Assert
        expect(api.updateDealCancellation).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    describe('when there are no validation errors', () => {
      const testDate = new Date('2024-03-21');

      beforeEach(() => {
        validateBankRequestDateMock.mockReturnValueOnce({
          errors: null,
          bankRequestDate: testDate,
        });
        jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
      });

      it('updates the deal cancellation bank request date', async () => {
        // Arrange
        const userToken = 'userToken';

        const { req, res } = createMocks<PostBankRequestDateRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken,
          },
          body: {
            'bank-request-date-day': testDate.getDate(),
            'bank-request-date-month': testDate.getMonth() + 1,
            'bank-request-date-year': testDate.getFullYear(),
          },
        });

        // Act
        await postBankRequestDate(req, res);

        // Assert
        expect(api.updateDealCancellation).toHaveBeenCalledTimes(1);
        expect(api.updateDealCancellation).toHaveBeenCalledWith(dealId, { bankRequestDate: testDate.valueOf() }, userToken);
      });

      it('redirects to the effective from date page', async () => {
        // Arrange
        const { req, res } = createMocks<PostBankRequestDateRequest>({
          params: { _id: dealId },
          session: {
            user: mockUser,
            userToken: 'a user token',
          },
          body: {
            'bank-request-date-day': testDate.getDate(),
            'bank-request-date-month': testDate.getMonth() + 1,
            'bank-request-date-year': testDate.getFullYear(),
          },
        });

        // Act
        await postBankRequestDate(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/cancellation/effective-from-date`);
      });
    });
  });
});
