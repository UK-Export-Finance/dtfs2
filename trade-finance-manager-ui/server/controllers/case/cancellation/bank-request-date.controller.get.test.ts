import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { BankRequestDateViewModel } from '../../../types/view-models';
import { getBankRequestDate, GetBankRequestDateRequest } from './bank-request-date.controller';
import api from '../../../api';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  getDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';
const mockUser = aTfmSessionUser();
const defaultBackUrl = `/case/${dealId}/cancellation/reason`;

describe('getBankRequestDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<GetBankRequestDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await getBankRequestDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<GetBankRequestDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await getBankRequestDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to deal summary page if the submission type is invalid (MIA)', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });

    const { req, res } = createMocks<GetBankRequestDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await getBankRequestDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    it('renders the bank request date page without prepopulated data when it does not exist', async () => {
      // Arrange
      jest.mocked(api.getDealCancellation).mockResolvedValue({});
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });

      const { req, res } = createMocks<GetBankRequestDateRequest>({
        params: { _id: dealId },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
      });

      // Act
      await getBankRequestDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/bank-request-date.njk');
      expect(res._getRenderData() as BankRequestDateViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: mockUser,
        ukefDealId,
        dealId,
        day: '',
        month: '',
        year: '',
        previousPage: defaultBackUrl,
      });
    });

    it('renders the bank request date page with prepopulated data when it exists', async () => {
      // Arrange
      const existingBankRequestDate = new Date('2024-03-21');
      jest.mocked(api.getDealCancellation).mockResolvedValue({ bankRequestDate: existingBankRequestDate.valueOf() });
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });

      const { req, res } = createMocks<GetBankRequestDateRequest>({
        params: { _id: dealId },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
      });

      // Act
      await getBankRequestDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/bank-request-date.njk');
      expect(res._getRenderData() as BankRequestDateViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: mockUser,
        ukefDealId,
        dealId,
        day: format(existingBankRequestDate, 'd'),
        month: format(existingBankRequestDate, 'M'),
        year: format(existingBankRequestDate, 'yyyy'),
        previousPage: defaultBackUrl,
      });
    });

    it('renders the page with the back URL as the check details page when "change" is passed in as a query parameter', async () => {
      // Arrange
      const existingBankRequestDate = new Date('2024-03-21');
      jest.mocked(api.getDealCancellation).mockResolvedValue({ bankRequestDate: existingBankRequestDate.valueOf() });
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });

      const { req, res } = createMocks<GetBankRequestDateRequest>({
        params: { _id: dealId },
        query: { status: 'change' },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
      });

      // Act
      await getBankRequestDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/bank-request-date.njk');
      expect(res._getRenderData() as BankRequestDateViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: mockUser,
        ukefDealId,
        dealId,
        day: format(existingBankRequestDate, 'd'),
        month: format(existingBankRequestDate, 'M'),
        year: format(existingBankRequestDate, 'yyyy'),
        previousPage: `/case/${dealId}/cancellation/check-details`,
      });
    });
  });
});
