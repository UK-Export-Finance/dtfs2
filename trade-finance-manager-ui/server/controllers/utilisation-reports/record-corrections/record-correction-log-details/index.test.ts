import httpMocks from 'node-mocks-http';
import { getFormattedReportPeriodWithLongMonth, recordCorrectionLogDetailsMock } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getRecordCorrectionLogDetails } from '.';
import api from '../../../../api';
import { mapToRecordCorrectionStatus } from '../../helpers/map-record-correction-status';
import { RecordCorrectionLogDetailsViewModel } from '../../../../types/view-models';
import { getReconciliationForReportHref } from '../../helpers';
import { RECONCILIATION_FOR_REPORT_TABS } from '../../../../constants/reconciliation-for-report-tabs';

jest.mock('../../../../api');

describe('controllers/utilisation-reports/record-corrections/record-correction-log-details', () => {
  const correctionId = '123';

  const userToken = 'user-token';
  const user = aTfmSessionUser();
  const requestSession = {
    userToken,
    user,
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRecordCorrectionLogDetails', () => {
    const { req, res } = httpMocks.createMocks({
      session: requestSession,
      params: { correctionId },
    });

    beforeEach(() => {
      jest.mocked(api.getRecordCorrectionLogDetailsById).mockResolvedValue(recordCorrectionLogDetailsMock);
    });

    it('should render "record correction log details" page', async () => {
      // Act
      await getRecordCorrectionLogDetails(req, res);

      // Assert
      const { status, displayStatus } = mapToRecordCorrectionStatus(recordCorrectionLogDetailsMock.correctionDetails.isCompleted);

      const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(recordCorrectionLogDetailsMock.reportPeriod);

      const expectedBackLinkHref = getReconciliationForReportHref(
        recordCorrectionLogDetailsMock.reportId.toString(),
        RECONCILIATION_FOR_REPORT_TABS.RECORD_CORRECTION_LOG,
      );

      const expectedViewModel: RecordCorrectionLogDetailsViewModel = {
        user,
        correctionDetails: recordCorrectionLogDetailsMock.correctionDetails,
        status,
        displayStatus,
        formattedReportPeriod,
        bankName: recordCorrectionLogDetailsMock.bankName,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        backLinkHref: expectedBackLinkHref,
      };

      expect(res._getRenderView()).toEqual('utilisation-reports/record-corrections/record-correction-log-details.njk');
      expect(res._getRenderData()).toEqual(expectedViewModel);
    });

    describe('when there is an error', () => {
      const error = new Error('error');

      beforeEach(() => {
        jest.mocked(api.getRecordCorrectionLogDetailsById).mockRejectedValue(error);
      });

      it('should render problem-with-service page', async () => {
        // Act
        await getRecordCorrectionLogDetails(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
        expect(res._getRenderData()).toEqual({ user: req.session.user });
      });
    });
  });
});
