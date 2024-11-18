import httpMocks from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { createRecordCorrectionRequest, CreateRecordCorrectionRequestRequest } from '.';
import { CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import api from '../../../../api';
import { GetFeeRecordDetailsResponseBody } from '../../../../api-response-types';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';

jest.mock('../../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request', () => {
  const userToken = 'user-token';
  const user = aTfmSessionUser();
  const requestSession = {
    userToken,
    user,
  };

  it('should render create record correction request page', async () => {
    // Arrange
    const reportId = '123';
    const feeRecordId = '456';
    const { req, res } = httpMocks.createMocks<CreateRecordCorrectionRequestRequest>({
      session: requestSession,
      params: { reportId, feeRecordId },
    });

    const feeRecordDetailsResponse: GetFeeRecordDetailsResponseBody = {
      id: 456,
      bank: {
        id: '789',
        name: 'Test Bank',
      },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      },
      facilityId: '0012345678',
      exporter: 'Sample Company Ltd',
    };
    jest.mocked(api.getFeeRecordDetails).mockResolvedValue(feeRecordDetailsResponse);

    // Act
    await createRecordCorrectionRequest(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('utilisation-reports/record-corrections/create-record-correction-request.njk');
    expect(res._getRenderData() as CreateRecordCorrectionRequestViewModel).toEqual<CreateRecordCorrectionRequestViewModel>({
      bank: { name: 'Test Bank' },
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportId,
      formattedReportPeriod: 'January 2024',
      feeRecord: {
        facilityId: '0012345678',
        exporter: 'Sample Company Ltd',
      },
    });
    expect(api.getFeeRecordDetails).toHaveBeenCalledTimes(1);
    expect(api.getFeeRecordDetails).toHaveBeenCalledWith(reportId, feeRecordId, userToken);
  });
});
