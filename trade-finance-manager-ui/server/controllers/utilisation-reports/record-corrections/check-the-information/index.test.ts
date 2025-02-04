import httpMocks, { MockResponse } from 'node-mocks-http';
import { mapReasonsToDisplayValues, getFormattedReportPeriodWithLongMonth, RECORD_CORRECTION_REASON, ERROR_KEY } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getRecordCorrectionRequestInformation, postRecordCorrectionRequestInformation } from '.';
import api from '../../../../api';

jest.mock('../../../../api');

describe('controllers/utilisation-reports/record-corrections/check-the-information', () => {
  const reportId = '123';
  const feeRecordId = '456';

  const userToken = 'user-token';
  const user = aTfmSessionUser();
  const requestSession = {
    userToken,
    user,
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRecordCorrectionRequestInformation', () => {
    const { req, res } = httpMocks.createMocks({
      session: requestSession,
      params: { reportId, feeRecordId },
    });

    const bank = { name: 'Test bank', id: '129' };
    const reportPeriod = { start: { month: 7, year: 2024 }, end: { month: 7, year: 2024 } };
    const correctionRequestDetails = {
      facilityId: '0012345678',
      exporter: 'Test company',
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
      additionalInfo: 'The facility ID does not match the facility ID held on file',
      contactEmailAddresses: ['one@email.com', 'two@email.com'],
    };

    const mockApiResponse = {
      bank,
      reportPeriod,
      correctionRequestDetails,
    };

    describe('if a record correction is NOT submitted', () => {
      beforeEach(() => {
        jest.mocked(api.getFeeRecordCorrectionRequestReview).mockResolvedValue(mockApiResponse);
      });

      it('should render check the information page', async () => {
        // Act
        await getRecordCorrectionRequestInformation(req, res);

        // Assert
        const expectedReasons = mapReasonsToDisplayValues(correctionRequestDetails.reasons).join(', ');

        expect(res._getRenderView()).toEqual('utilisation-reports/record-corrections/check-the-information.njk');
        expect(res._getRenderData()).toEqual({
          user,
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
          bank: { name: bank.name },
          reportId,
          feeRecordId,
          facilityId: correctionRequestDetails.facilityId,
          exporter: correctionRequestDetails.exporter,
          formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
          reasonForRecordCorrection: expectedReasons,
          additionalInfo: correctionRequestDetails.additionalInfo,
          contactEmailAddresses: correctionRequestDetails.contactEmailAddresses,
        });
      });
    });

    describe('if a record correction is already submitted', () => {
      beforeEach(() => {
        jest.mocked(api.getFeeRecordCorrectionRequestReview).mockResolvedValue({ errorKey: ERROR_KEY.INVALID_STATUS });
      });

      it('should render page not found page', async () => {
        // Act
        await getRecordCorrectionRequestInformation(req, res);

        expect(res._getRenderView()).toEqual('utilisation-reports/page-not-found.njk');
        expect(res._getRenderData()).toEqual({
          reason: 'The record correction request has been sent to the bank. You cannot make any changes to the request',
          reportId,
          user,
        });
      });
    });
  });

  describe('postRecordCorrectionRequestInformation', () => {
    const emails = ['test1@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'];

    let req: Request;
    let res: MockResponse<Response>;

    beforeEach(() => {
      ({ req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, feeRecordId },
      }));
    });

    it('should redirect to request sent page on success', async () => {
      // Arrange
      jest.mocked(api.createFeeRecordCorrection).mockResolvedValue({ emails });

      // Act
      await postRecordCorrectionRequestInformation(req, res);

      // Assert
      expect(api.createFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.createFeeRecordCorrection).toHaveBeenCalledWith(reportId, feeRecordId, user, userToken);
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/request-sent`);
    });

    it(`should populate the session with the record correction request emails`, async () => {
      // Arrange
      jest.mocked(api.createFeeRecordCorrection).mockResolvedValue({ emails });

      // Act
      await postRecordCorrectionRequestInformation(req, res);

      // Assert
      expect(req.session.recordCorrectionRequestEmails).toEqual(emails);
    });

    it('should render problem with service page on error', async () => {
      // Arrange
      jest.mocked(api.createFeeRecordCorrection).mockRejectedValue(new Error('API Error'));

      // Act
      await postRecordCorrectionRequestInformation(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user });
    });
  });
});
