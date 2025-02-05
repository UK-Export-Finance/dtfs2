import httpMocks from 'node-mocks-http';
import { getFormattedReportPeriodWithLongMonth, recordCorrectionLogDetailsMock } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getRecordCorrectionLogDetails } from '.';
import api from '../../../../api';
import { mapToRecordCorrectionStatus } from '../../helpers/map-record-correction-status';

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

    it('should render check the information page', async () => {
      // Act
      await getRecordCorrectionLogDetails(req, res);

      // Assert
      const { status, displayStatus } = mapToRecordCorrectionStatus(recordCorrectionLogDetailsMock.fields.isCompleted);

      const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(recordCorrectionLogDetailsMock.reportPeriod);

      const expectedViewModel = {
        user,
        mappedCorrectionLog: recordCorrectionLogDetailsMock.fields,
        status,
        displayStatus,
        formattedReportPeriod,
        bankName: recordCorrectionLogDetailsMock.bankName,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
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
