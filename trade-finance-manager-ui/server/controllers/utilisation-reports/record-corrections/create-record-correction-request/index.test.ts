import httpMocks from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { createRecordCorrectionRequest, CreateRecordCorrectionRequestRequest } from '.';
import { CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import api from '../../../../api';
import { GetFeeRecordDetailsResponseBody } from '../../../../api-response-types';

jest.mock('../../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request', () => {
  const userToken = 'user-token';
  const requestSession = {
    userToken,
    user: aTfmSessionUser(),
  };

  it('should render create record correction request page', async () => {
    // Arrange
    const { req, res } = httpMocks.createMocks<CreateRecordCorrectionRequestRequest>({
      session: requestSession,
      params: { reportId: '123', feeRecordId: '456' },
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
    expect((res._getRenderData() as CreateRecordCorrectionRequestViewModel).bank).toEqual({ id: '789', name: 'Test Bank' });
    expect((res._getRenderData() as CreateRecordCorrectionRequestViewModel).formattedReportPeriod).toEqual('January 2024');
    expect((res._getRenderData() as CreateRecordCorrectionRequestViewModel).feeRecord).toEqual({
      facilityId: '0012345678',
      exporter: 'Sample Company Ltd',
    });
  });
});
