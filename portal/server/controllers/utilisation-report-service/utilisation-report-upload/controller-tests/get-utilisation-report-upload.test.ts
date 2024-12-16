import httpMocks from 'node-mocks-http';
import { aPortalSessionUser, isFeeRecordCorrectionFeatureFlagEnabled, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { getUtilisationReportUpload } from '..';
import api from '../../../../api';
import { aBank, aNonEmptyPendingCorrectionsResponseBody, aReportPeriod } from '../../../../../test-helpers/test-data';
import { mapToPendingCorrectionsViewModel } from '../pending-corrections-helper';
import { UtilisationReportPendingCorrectionsResponseBody } from '../../../../api-response-types';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { getDueReportPeriodsByBankId, getReportDueDate } from '../utilisation-report-status';

jest.mock('../utilisation-report-upload-errors');
jest.mock('../utilisation-report-status');
jest.mock('../../../../utils/csv-utils');
jest.mock('../utilisation-report-filename-validator');
jest.mock('../../../../api');

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isFeeRecordCorrectionFeatureFlagEnabled: jest.fn(),
}));

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUtilisationReportUpload', () => {
    const bankId = '1234';
    const user = { ...aPortalSessionUser(), bank: { ...aBank(), id: bankId } };
    const userToken = 'user-token';

    const getHttpMocks = () =>
      httpMocks.createMocks({
        session: { userToken, user, loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA },
      });

    describe('when the fee record correction feature flag is enabled', () => {
      beforeEach(() => {
        jest.mocked(isFeeRecordCorrectionFeatureFlagEnabled).mockReturnValue(true);
      });

      it("should fetch pending corrections for the user's bank", async () => {
        // Arrange
        const { res, req } = getHttpMocks();

        // Act
        await getUtilisationReportUpload(req, res);

        // Assert
        expect(api.getUtilisationReportPendingCorrectionsByBankId).toHaveBeenCalledTimes(1);
        expect(api.getUtilisationReportPendingCorrectionsByBankId).toHaveBeenCalledWith(userToken, bankId);
      });

      it('should render the pending corrections page if the bank has pending corrections', async () => {
        // Arrange
        const { res, req } = getHttpMocks();

        const pendingCorrectionsResponseBody = aNonEmptyPendingCorrectionsResponseBody();
        jest.mocked(api.getUtilisationReportPendingCorrectionsByBankId).mockResolvedValue(pendingCorrectionsResponseBody);

        // Act
        await getUtilisationReportUpload(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-report-service/record-corrections/pending-corrections.njk');
        expect(res._getRenderData()).toEqual(mapToPendingCorrectionsViewModel(pendingCorrectionsResponseBody, user));
      });

      it('should render the utilisation report upload page if the bank has no pending corrections', async () => {
        // Arrange
        const { res, req } = getHttpMocks();

        const pendingCorrectionsResponseBody: UtilisationReportPendingCorrectionsResponseBody = {};
        jest.mocked(api.getUtilisationReportPendingCorrectionsByBankId).mockResolvedValue(pendingCorrectionsResponseBody);

        const mockDueReportPeriods = [{ ...aReportPeriod(), formattedReportPeriod: 'January 2036' }];
        jest.mocked(getDueReportPeriodsByBankId).mockResolvedValue(mockDueReportPeriods);

        const mockReportDueDate = '25 December 2025';
        jest.mocked(getReportDueDate).mockResolvedValue(mockReportDueDate);

        // Act
        await getUtilisationReportUpload(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk');
        expect(res._getRenderData()).toEqual({
          user,
          primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
          dueReportPeriods: mockDueReportPeriods,
          nextDueReportDueDate: mockReportDueDate,
        });
      });
    });

    describe('when the fee record correction feature flag is disabled', () => {
      beforeEach(() => {
        jest.mocked(isFeeRecordCorrectionFeatureFlagEnabled).mockReturnValue(false);
      });

      it('should not fetch pending corrections', async () => {
        // Arrange
        const { res, req } = getHttpMocks();

        // Act
        await getUtilisationReportUpload(req, res);

        // Assert
        expect(api.getUtilisationReportPendingCorrectionsByBankId).toHaveBeenCalledTimes(0);
      });

      it('should render the utilisation report upload page', async () => {
        // Arrange
        const { res, req } = getHttpMocks();

        const mockDueReportPeriods = [{ ...aReportPeriod(), formattedReportPeriod: 'January 2036' }];
        jest.mocked(getDueReportPeriodsByBankId).mockResolvedValue(mockDueReportPeriods);

        const mockReportDueDate = '25 December 2025';
        jest.mocked(getReportDueDate).mockResolvedValue(mockReportDueDate);

        // Act
        await getUtilisationReportUpload(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk');
        expect(res._getRenderData()).toEqual({
          user,
          primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
          dueReportPeriods: mockDueReportPeriods,
          nextDueReportDueDate: mockReportDueDate,
        });
      });
    });
  });
});
