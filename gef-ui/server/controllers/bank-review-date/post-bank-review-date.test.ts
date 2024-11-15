/* eslint-disable import/first */
const getFacilityMock = jest.fn();
const updateFacilityMock = jest.fn();
const updateApplicationMock = jest.fn();
const validateAndParseBankReviewDateMock = jest.fn();
const getCoverStartDateOrStartOfTodayMock = jest.fn();

import httpMocks from 'node-mocks-http';
import { aPortalSessionUser, DayMonthYearInput, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { postBankReviewDate, PostBankReviewDateRequest } from './post-bank-review-date';

jest.mock('../../utils/get-cover-start-date-or-start-of-today', () => ({
  getCoverStartDateOrStartOfToday: getCoverStartDateOrStartOfTodayMock,
}));
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('../../services/api', () => ({
  getFacility: getFacilityMock,
  updateFacility: updateFacilityMock,
  updateApplication: updateApplicationMock,
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('./validation', () => ({
  validateAndParseBankReviewDate: validateAndParseBankReviewDateMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const mockUris = {
  nextPage: 'nextPage',
  previousPage: 'previousPage',
  saveAndReturn: 'saveAndReturn',
};

const bankReviewDate = new Date(2024, 8, 9);

const dayMonthYear: DayMonthYearInput = {
  day: '9',
  month: '9',
  year: '2024',
};

const coverStartDate = new Date();

const mockUser = aPortalSessionUser();
const userToken = 'userToken';

const generateHttpMocks = ({ day, month, year }: DayMonthYearInput, status?: string) =>
  httpMocks.createMocks<PostBankReviewDateRequest>({
    params: {
      dealId,
      facilityId,
    },
    query: {
      status,
    },
    session: {
      user: mockUser,
      userToken,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
    body: {
      'bank-review-date-day': day,
      'bank-review-date-month': month,
      'bank-review-date-year': year,
    },
  });

describe('postBankReviewDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getFacilityMock.mockResolvedValue({
      details: {
        _id: facilityId,
        dealId,
      },
    });
    getCoverStartDateOrStartOfTodayMock.mockReturnValueOnce(coverStartDate);
  });

  describe('when the bank review date is valid and has changed', () => {
    beforeEach(() => {
      validateAndParseBankReviewDateMock.mockReturnValueOnce({
        date: bankReviewDate,
      });
    });

    it('updates the facility', async () => {
      // Arrange
      const mockStatus = 'mock status';
      const { req: mockReq, res: mockRes } = generateHttpMocks(dayMonthYear, mockStatus);

      // Act
      await postBankReviewDate({ req: mockReq, res: mockRes, uris: mockUris });

      // Assert
      expect(updateFacilityMock).toHaveBeenCalledTimes(1);
      expect(updateFacilityMock).toHaveBeenCalledWith({
        facilityId,
        payload: {
          bankReviewDate,
        },
        userToken,
      });
    });

    it('updates the deal', async () => {
      // Arrange
      const mockStatus = 'mock status';
      const { req: mockReq, res: mockRes } = generateHttpMocks(dayMonthYear, mockStatus);

      // Act
      await postBankReviewDate({ req: mockReq, res: mockRes, uris: mockUris });

      // Assert
      expect(updateApplicationMock).toHaveBeenCalledTimes(1);
      expect(updateApplicationMock).toHaveBeenCalledWith({ dealId, application: { editorId: mockUser._id }, userToken });
    });
  });

  describe('when the bank review date is valid and has not changed', () => {
    beforeEach(() => {
      getFacilityMock.mockResolvedValueOnce({
        details: {
          _id: facilityId,
          dealId,
          bankReviewDate: bankReviewDate.toISOString(),
        },
      });
      validateAndParseBankReviewDateMock.mockReturnValueOnce({
        date: bankReviewDate,
      });
    });

    it('does not update the facility', async () => {
      // Arrange
      const mockStatus = 'mock status';
      const { req: mockReq, res: mockRes } = generateHttpMocks(dayMonthYear, mockStatus);

      // Act
      await postBankReviewDate({ req: mockReq, res: mockRes, uris: mockUris });

      // Assert
      expect(updateFacilityMock).toHaveBeenCalledTimes(0);
    });

    it('does not update the deal', async () => {
      // Arrange
      const mockStatus = 'mock status';
      const { req: mockReq, res: mockRes } = generateHttpMocks(dayMonthYear, mockStatus);

      // Act
      await postBankReviewDate({ req: mockReq, res: mockRes, uris: mockUris });

      // Assert
      expect(updateApplicationMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('when the bank review date is invalid', () => {
    beforeEach(() => {
      validateAndParseBankReviewDateMock.mockReturnValueOnce({
        errors: [
          {
            errRef: 'errRef',
            errMsg: 'errMsg',
            errCode: 'errCode',
            subFieldErrorRefs: ['subFieldErrorRef'],
          },
        ],
      });
    });

    it('renders the current page with errors', async () => {
      // Arrange
      const mockStatus = 'mock status';
      const { req: mockReq, res: mockRes } = generateHttpMocks(dayMonthYear, mockStatus);

      // Act
      await postBankReviewDate({ req: mockReq, res: mockRes, uris: mockUris });

      // Assert
      expect(mockRes._getRenderView()).toEqual('_partials/bank-review-date.njk');
      expect(mockRes._getRenderData()).toEqual({
        dealId,
        facilityId,
        previousPage: mockUris.previousPage,
        status: mockStatus,
        errors: {
          errorSummary: [
            {
              href: '#errRef',
              text: 'errMsg',
            },
          ],
          fieldErrors: {
            errRef: {
              text: 'errMsg',
            },
            subFieldErrorRef: {
              text: 'errMsg',
            },
          },
        },
        bankReviewDate: dayMonthYear,
      });
    });

    it('does not update the facility', async () => {
      // Arrange
      const mockStatus = 'mock status';
      const { req: mockReq, res: mockRes } = generateHttpMocks(dayMonthYear, mockStatus);

      // Act
      await postBankReviewDate({ req: mockReq, res: mockRes, uris: mockUris });

      // Assert
      expect(updateFacilityMock).toHaveBeenCalledTimes(0);
    });

    it('does not update the deal', async () => {
      // Arrange
      const mockStatus = 'mock status';
      const { req: mockReq, res: mockRes } = generateHttpMocks(dayMonthYear, mockStatus);

      // Act
      await postBankReviewDate({ req: mockReq, res: mockRes, uris: mockUris });

      // Assert
      expect(updateApplicationMock).toHaveBeenCalledTimes(0);
    });
  });

  it('validates the input', async () => {
    // Arrange
    const mockStatus = 'mock status';
    const { req: mockReq, res: mockRes } = generateHttpMocks(dayMonthYear, mockStatus);

    // Act
    await postBankReviewDate({ req: mockReq, res: mockRes, uris: mockUris });

    // Assert
    expect(validateAndParseBankReviewDateMock).toHaveBeenCalledTimes(1);
    expect(validateAndParseBankReviewDateMock).toHaveBeenCalledWith(dayMonthYear, coverStartDate);
  });

  it('renders problem with the service page when an error is thrown', async () => {
    // Arrange
    const mockStatus = 'mock status';
    const { req: mockReq, res: mockRes } = generateHttpMocks(dayMonthYear, mockStatus);

    getFacilityMock.mockRejectedValueOnce(new Error('An error occurred'));

    // Act
    await postBankReviewDate({ req: mockReq, res: mockRes, uris: mockUris });

    // Assert
    expect(mockRes._getRenderView()).toEqual('_partials/problem-with-service.njk');
  });
});
