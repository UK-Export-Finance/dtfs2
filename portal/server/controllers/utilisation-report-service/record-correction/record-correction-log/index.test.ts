import httpMocks, { MockResponse } from 'node-mocks-http';
import { Request, Response } from 'express';
import { aPortalSessionBank, aPortalSessionUser, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import api from '../../../../api';
import { getRecordCorrectionLog } from '.';
import { GetCompletedFeeRecordCorrectionsResponseBody } from '../../../../api-response-types';
import { mapCompletedCorrectionsToViewModel } from './helpers';
import { RecordCorrectionLogViewModel } from '../../../../types/view-models/record-correction/record-correction-log';

jest.mock('../../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/record-correction-log', () => {
  const bankId = '123';
  const userId = 'user-id';
  const mockUser = {
    ...aPortalSessionUser(),
    _id: userId,
    bank: {
      ...aPortalSessionBank(),
      id: bankId,
    },
  };

  const userToken = 'token';
  const aRequestSession = () => ({
    user: mockUser,
    userToken,
    loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
  });

  const getHttpMocks = () =>
    httpMocks.createMocks<Request>({
      session: aRequestSession(),
    });

  let req: Request;
  let res: MockResponse<Response>;

  beforeEach(() => {
    ({ req, res } = getHttpMocks());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRecordCorrectionLog', () => {
    it('should render the "record correction log" page', async () => {
      // Arrange
      const firstCompletedCorrection = {
        id: 1,
        dateSent: new Date('2024-02-01').toISOString(),
        exporter: 'Exporter A',
        formattedReasons: 'Facility ID is incorrect',
        formattedPreviousValues: '11111111',
        formattedCorrectedValues: '22222222',
        bankCommentary: 'Bank commentary A',
      };

      const secondCompletedCorrection = {
        id: 2,
        dateSent: new Date('2024-03-17').toISOString(),
        exporter: 'Exporter B',
        formattedReasons: 'Utilisation is incorrect',
        formattedPreviousValues: '123.45',
        formattedCorrectedValues: '987.65',
      };

      const completedCorrectionsResponseBody: GetCompletedFeeRecordCorrectionsResponseBody = [firstCompletedCorrection, secondCompletedCorrection];

      jest.mocked(api.getCompletedFeeRecordCorrections).mockResolvedValue(completedCorrectionsResponseBody);

      // Act
      await getRecordCorrectionLog(req, res);

      // Assert
      const expectedCompletedCorrections = mapCompletedCorrectionsToViewModel(completedCorrectionsResponseBody);

      const expectedResponse: RecordCorrectionLogViewModel = {
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.RECORD_CORRECTION_LOG,
        completedCorrections: expectedCompletedCorrections,
      };

      expect(res._getRenderView()).toEqual('utilisation-report-service/record-correction/correction-log.njk');

      expect(res._getRenderData() as RecordCorrectionLogViewModel).toEqual(expectedResponse);
    });

    it('should fetch the completed fee record corrections using the users bank id', async () => {
      // Arrange
      jest.mocked(api.getCompletedFeeRecordCorrections).mockResolvedValue([]);

      // Act
      await getRecordCorrectionLog(req, res);

      // Assert
      expect(api.getCompletedFeeRecordCorrections).toHaveBeenCalledTimes(1);
      expect(api.getCompletedFeeRecordCorrections).toHaveBeenCalledWith(userToken, bankId);
    });

    it('should render the "problem with service" page when fetching the completed fee record corrections fails', async () => {
      // Arrange
      jest.mocked(api.getCompletedFeeRecordCorrections).mockRejectedValue(new Error());

      // Act
      await getRecordCorrectionLog(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: mockUser });
    });
  });
});
