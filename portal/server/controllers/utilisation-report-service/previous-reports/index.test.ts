import httpMocks from 'node-mocks-http';
import { PORTAL_LOGIN_STATUS, aPortalSessionUser } from '@ukef/dtfs2-common';
import api from '../../../api';
import { getPreviousReports } from '.';
import { PRIMARY_NAV_KEY } from '../../../constants';
import { PreviousUtilisationReportsResponseBody } from '../../../api-response-types';
import * as mapper from './helpers/previous-reports-view-model-mapper';
import { PreviousReportsViewModel } from '../../../types/view-models/previous-reports';

describe('previous-reports controller', () => {
  describe('getPreviousReports', () => {
    const BANK_ID = '123';
    const mockUser = {
      bank: {
        id: BANK_ID,
      },
    };

    const USER_TOKEN = 'token';
    const getHttpMocks = (targetYear?: string) =>
      httpMocks.createMocks({
        session: {
          user: mockUser,
          userToken: USER_TOKEN,
          loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
        },
        query: {
          targetYear,
        },
      });

    const apiGetPreviousReportsSpy = jest.spyOn(api, 'getPreviousUtilisationReportsByBank');

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('renders the previous reports page', async () => {
      // Arrange
      const { req, res } = getHttpMocks('2024');
      const responseBody: PreviousUtilisationReportsResponseBody = [];
      const viewModel: PreviousReportsViewModel = {
        user: aPortalSessionUser(),
        primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
        navItems: [],
        reports: [],
        year: undefined,
      };
      apiGetPreviousReportsSpy.mockResolvedValue(responseBody);
      const mapToPreviousReportsViewModelSpy = jest.spyOn(mapper, 'mapToPreviousReportsViewModel').mockReturnValue(viewModel);

      // Act
      await getPreviousReports(req, res);

      // Assert
      expect(apiGetPreviousReportsSpy).toHaveBeenCalledTimes(1);
      expect(apiGetPreviousReportsSpy).toHaveBeenCalledWith(USER_TOKEN, BANK_ID);
      expect(mapToPreviousReportsViewModelSpy).toHaveBeenCalledWith('2024', mockUser, responseBody);
      expect(res._getRenderView()).toBe('utilisation-report-service/previous-reports/previous-reports.njk');
      expect(res._getRenderData()).toEqual(viewModel);
    });

    it('renders the problem with service page when fetching reports fails', async () => {
      // Arrange
      const { req, res } = getHttpMocks('2024');
      apiGetPreviousReportsSpy.mockRejectedValue(new Error());

      // Act
      await getPreviousReports(req, res);

      // Assert
      expect(apiGetPreviousReportsSpy).toHaveBeenCalledTimes(1);
      expect(apiGetPreviousReportsSpy).toHaveBeenCalledWith(USER_TOKEN, BANK_ID);
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: mockUser });
    });
  });
});
