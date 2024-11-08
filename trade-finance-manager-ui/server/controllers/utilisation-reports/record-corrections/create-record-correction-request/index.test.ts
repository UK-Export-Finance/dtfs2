import httpMocks from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { createRecordCorrectionRequest, CreateRecordCorrectionRequestRequest } from '.';
import { CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request', () => {
  const userToken = 'user-token';
  const requestSession = {
    userToken,
    user: aTfmSessionUser(),
  };

  it('should render create record correction request page', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks<CreateRecordCorrectionRequestRequest>({
      session: requestSession,
      params: { reportId: '123', feeRecordId: '456' },
    });

    // Act
    createRecordCorrectionRequest(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('utilisation-reports/record-corrections/create-record-correction-request.njk');
    expect((res._getRenderData() as CreateRecordCorrectionRequestViewModel).bank).toEqual({ name: 'Test Bank' });
    expect((res._getRenderData() as CreateRecordCorrectionRequestViewModel).formattedReportPeriod).toEqual('January 2024');
    expect((res._getRenderData() as CreateRecordCorrectionRequestViewModel).feeRecord).toEqual({
      facilityId: '0012345678',
      exporter: 'Sample Company Ltd',
    });
  });
});
