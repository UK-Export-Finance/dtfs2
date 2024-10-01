import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { getEffectiveFromDate, GetEffectiveFromDateRequest } from './effective-from-date.controller';
import { EffectiveFromDateViewModel } from '../../../types/view-models';
import api from '../../../api';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  getDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';
const mockUser = aTfmSessionUser();

describe('getEffectiveFromDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<GetEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await getEffectiveFromDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<GetEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await getEffectiveFromDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/not-found`);
  });

  it('redirects to deal summary page if the submission type is invalid (MIA)', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });

    const { req, res } = createMocks<GetEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await getEffectiveFromDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/case/${dealId}/deal`);
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    it('renders the effective from date page without prepopulated data when it does not exist', async () => {
      // Arrange
      jest.mocked(api.getDealCancellation).mockResolvedValue({});
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });

      const { req, res } = createMocks<GetEffectiveFromDateRequest>({
        params: { _id: dealId },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
      });

      // Act
      await getEffectiveFromDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
      expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: mockUser,
        ukefDealId,
        dealId,
        day: '',
        month: '',
        year: '',
      });
    });

    it('renders the effective from page with prepopulated data when it exists', async () => {
      // Arrange
      const existingEffectiveFromDate = new Date('2024-03-21');
      jest.mocked(api.getDealCancellation).mockResolvedValue({ effectiveFrom: existingEffectiveFromDate.valueOf() });
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });

      const { req, res } = createMocks<GetEffectiveFromDateRequest>({
        params: { _id: dealId },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
      });

      // Act
      await getEffectiveFromDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
      expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: mockUser,
        ukefDealId,
        dealId,
        day: format(existingEffectiveFromDate, 'd'),
        month: format(existingEffectiveFromDate, 'M'),
        year: format(existingEffectiveFromDate, 'yyyy'),
      });
    });
  });
});
