import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE, TFM_DEAL_CANCELLATION_STATUS } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { aRequestSession } from '../../../../test-helpers';
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
const previousPage = `/case/${dealId}/cancellation/bank-request-date`;

describe('getEffectiveFromDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<GetEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
    });

    // Act
    await getEffectiveFromDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<GetEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
    });

    // Act
    await getEffectiveFromDate(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  describe(`when the deal type is ${DEAL_SUBMISSION_TYPE.MIA}`, () => {
    beforeEach(() => {
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });
    });

    it('redirects to deal summary page', async () => {
      // Arrange
      const { req, res } = createMocks<GetEffectiveFromDateRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getEffectiveFromDate(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });

    it('does not get the cancellation', async () => {
      // Arrange
      const { req, res } = createMocks<GetEffectiveFromDateRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getEffectiveFromDate(req, res);

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

      const { req, res } = createMocks<GetEffectiveFromDateRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getEffectiveFromDate(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });

    it('redirects to deal summary page if the deal cancellation is not in draft', async () => {
      // Arrange
      jest.mocked(api.getDealCancellation).mockResolvedValue({ status: TFM_DEAL_CANCELLATION_STATUS.COMPLETED });

      const { req, res } = createMocks<GetEffectiveFromDateRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getEffectiveFromDate(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });

    it('renders the effective from date page without prepopulated data when it does not exist', async () => {
      // Arrange
      jest.mocked(api.getDealCancellation).mockResolvedValue({ bankRequestDate: new Date().valueOf(), status: TFM_DEAL_CANCELLATION_STATUS.DRAFT });

      const session = aRequestSession();

      const { req, res } = createMocks<GetEffectiveFromDateRequest>({
        params: { _id: dealId },
        session,
      });

      // Act
      await getEffectiveFromDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
      expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: session.user,
        ukefDealId,
        dealId,
        day: '',
        month: '',
        year: '',
        previousPage,
      });
    });

    it('renders the effective from page with prepopulated data when it exists', async () => {
      // Arrange
      const existingEffectiveFromDate = new Date('2024-03-21');
      jest.mocked(api.getDealCancellation).mockResolvedValue({
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: existingEffectiveFromDate.valueOf(),
        status: TFM_DEAL_CANCELLATION_STATUS.DRAFT,
      });

      const session = aRequestSession();

      const { req, res } = createMocks<GetEffectiveFromDateRequest>({
        params: { _id: dealId },
        session,
      });

      // Act
      await getEffectiveFromDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
      expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: session.user,
        ukefDealId,
        dealId,
        day: format(existingEffectiveFromDate, 'd'),
        month: format(existingEffectiveFromDate, 'M'),
        year: format(existingEffectiveFromDate, 'yyyy'),
        previousPage,
      });
    });

    it('renders the page with the back URL as the check details page when "change" is passed in as a query parameter', async () => {
      // Arrange
      const existingEffectiveFromDate = new Date('2024-03-21');
      jest
        .mocked(api.getDealCancellation)
        .mockResolvedValue({ effectiveFrom: existingEffectiveFromDate.valueOf(), status: TFM_DEAL_CANCELLATION_STATUS.DRAFT });

      const session = aRequestSession();

      const { req, res } = createMocks<GetEffectiveFromDateRequest>({
        params: { _id: dealId },
        query: { status: 'change' },
        session,
      });

      // Act
      await getEffectiveFromDate(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
      expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: session.user,
        ukefDealId,
        dealId,
        day: format(existingEffectiveFromDate, 'd'),
        month: format(existingEffectiveFromDate, 'M'),
        year: format(existingEffectiveFromDate, 'yyyy'),
        previousPage: `/case/${dealId}/cancellation/check-details`,
      });
    });
  });
});
