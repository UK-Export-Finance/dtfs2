import httpMocks from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { createRecordCorrectionRequest, CreateRecordCorrectionRequestRequest } from '.';
import { CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getLinkToPremiumPaymentsTab } from '../../helpers';

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request', () => {
  const userToken = 'user-token';
  const user = aTfmSessionUser();
  const requestSession = {
    userToken,
    user,
  };

  it('should render create record correction request page', () => {
    // Arrange
    const reportId = '123';
    const { req, res } = httpMocks.createMocks<CreateRecordCorrectionRequestRequest>({
      session: requestSession,
      params: { reportId, feeRecordId: '456' },
    });

    // Act
    createRecordCorrectionRequest(req, res);

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
      backLinkHref: getLinkToPremiumPaymentsTab(reportId, [456]),
    });
  });
});
