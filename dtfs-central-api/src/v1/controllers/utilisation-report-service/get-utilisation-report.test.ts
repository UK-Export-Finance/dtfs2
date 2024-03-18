import httpMocks from 'node-mocks-http';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../repositories/utilisation-reports-repo';
import { GetUtilisationReportResponse } from '../../../types/utilisation-reports';
import { GetUtilisationReportByIdRequest, getUtilisationReportById } from './get-utilisation-report.controller';

jest.mock('../../../repositories/utilisation-reports-repo');

jest.mock('../../../repositories/utilisation-reports-repo/utilisation-report-sql.repo');

console.error = jest.fn();

describe('getUtilisationReport', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const getHttpMocks = () =>
    httpMocks.createMocks<GetUtilisationReportByIdRequest>({
      params: { id: '2023' },
    });

  it('sends a 200 and maps entity to response', async () => {
    // Arrange
    const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();
    const findOneByMock = jest.fn().mockResolvedValue(mockUtilisationReport);
    jest.spyOn(UtilisationReportRepo, 'findOneBy').mockImplementation(findOneByMock);

    const { req, res } = getHttpMocks();

    // Act
    await getUtilisationReportById(req, res);

    // Assert
    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    const responseData = res._getData() as GetUtilisationReportResponse;
    expect(responseData.id).toEqual(mockUtilisationReport.id);
    expect(responseData.bankId).toEqual(mockUtilisationReport.bankId);
    expect(responseData.uploadedByUserId).toEqual(mockUtilisationReport.uploadedByUserId);
    expect(responseData.dateUploaded).toEqual(mockUtilisationReport.dateUploaded);
    expect(responseData.status).toEqual(mockUtilisationReport.status);
    expect(responseData.azureFileInfo?.filename).toEqual(mockUtilisationReport.azureFileInfo?.filename);
    expect(responseData.azureFileInfo?.folder).toEqual(mockUtilisationReport.azureFileInfo?.folder);
    expect(responseData.azureFileInfo?.fullPath).toEqual(mockUtilisationReport.azureFileInfo?.fullPath);
    expect(responseData.azureFileInfo?.url).toEqual(mockUtilisationReport.azureFileInfo?.url);
    expect(responseData.azureFileInfo?.mimetype).toEqual(mockUtilisationReport.azureFileInfo?.mimetype);
    expect(responseData.reportPeriod.start.month).toEqual(mockUtilisationReport.reportPeriod.start.month);
    expect(responseData.reportPeriod.start.year).toEqual(mockUtilisationReport.reportPeriod.start.year);
    expect(responseData.reportPeriod.end.month).toEqual(mockUtilisationReport.reportPeriod.end.month);
    expect(responseData.reportPeriod.end.year).toEqual(mockUtilisationReport.reportPeriod.end.year);
  });
});
