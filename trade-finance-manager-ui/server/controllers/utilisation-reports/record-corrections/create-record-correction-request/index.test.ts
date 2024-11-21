import httpMocks from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { getCreateRecordCorrectionRequest, GetCreateRecordCorrectionRequestRequest } from '.';
import { CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request', () => {
  const userToken = 'user-token';
  const user = aTfmSessionUser();
  const requestSession = {
    userToken,
    user,
  };

  describe('getCreateRecordCorrectionRequest', () => {
    it('should render create record correction request page', () => {
      // Arrange
      const reportId = '123';
      const { req, res } = httpMocks.createMocks<GetCreateRecordCorrectionRequestRequest>({
        session: requestSession,
        params: { reportId, feeRecordId: '456' },
      });

      // Act
      getCreateRecordCorrectionRequest(req, res);

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
        formValues: {},
        errors: { errorSummary: [] },
      });
    });
  });

  describe('postCreateRecordCorrectionRequest', () => {
    // TODO FN-3575: Add tests
  });
});
