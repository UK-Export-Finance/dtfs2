import httpMocks from 'node-mocks-http';
import { mapReasonsToDisplayValues, getFormattedReportPeriodWithLongMonth, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getLinkToPremiumPaymentsTab } from '../../helpers/get-link-to-premium-payments-tab';
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

    beforeEach(() => {
      jest.mocked(api.getFeeRecordCorrectionRequestReview).mockResolvedValue(mockApiResponse);
    });

    it('should render check the information page', async () => {
      // Act
      await getRecordCorrectionRequestInformation(req, res);

      // Assert
      const expectedReasons = mapReasonsToDisplayValues(correctionRequestDetails.reasons).join(', ');
      const expectedContactEmailAddresses = correctionRequestDetails.contactEmailAddresses.join(', ');

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
        contactEmailAddresses: expectedContactEmailAddresses,
        cancelLink: getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]),
      });
    });
  });

  describe('postRecordCorrectionRequestInformation', () => {
    const emails = ['test1@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'];

    it('should redirect to request sent page on success', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, feeRecordId },
      });

      jest.mocked(api.createFeeRecordCorrection).mockResolvedValue({ emails });

      // Act
      await postRecordCorrectionRequestInformation(req, res);

      // Assert
      expect(api.createFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.createFeeRecordCorrection).toHaveBeenCalledWith(reportId, feeRecordId, user, userToken);
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/request-sent`);
    });

    it(`should populate the session with the record correction request emails`, async () => {
      // Act
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, feeRecordId },
      });

      jest.mocked(api.createFeeRecordCorrection).mockResolvedValue({ emails });

      // Act
      await postRecordCorrectionRequestInformation(req, res);

      // Assert
      expect(req.session.recordCorrectionRequestEmails).toEqual(emails);
    });

    it('should render problem with service page on error', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, feeRecordId },
      });

      jest.mocked(api.createFeeRecordCorrection).mockRejectedValue(new Error('API Error'));

      // Act
      await postRecordCorrectionRequestInformation(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user });
    });
  });
});
