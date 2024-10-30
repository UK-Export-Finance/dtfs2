import { ObjectId } from 'mongodb';
import {
  REQUEST_PLATFORM_TYPE,
  AzureFileInfoEntity,
  MOCK_AZURE_FILE_INFO,
  PortalUser,
  ReportPeriod,
  UtilisationReportEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
} from '@ukef/dtfs2-common';
import { mapUtilisationReportEntityToGetUtilisationReportResponse } from './mapUtilisationReport';
import { getUserById } from '../repositories/users-repo';
import { GetUtilisationReportResponse } from '../types/utilisation-reports';

jest.mock('../repositories/users-repo');

describe('mapUtilisationReportEntityToGetUtilisationReportResponse', () => {
  const mockPortalUser = {
    _id: new ObjectId(),
    firstname: 'Test',
    surname: 'User',
  } as PortalUser;

  const bankId = '123';

  const reportPeriod: ReportPeriod = {
    start: { month: 1, year: 2024 },
    end: { month: 1, year: 2024 },
  };

  it("maps the report and sets the 'dateUploaded', 'uploadedByUser' and 'azureFileInfo' to null when the report is not uploaded", async () => {
    // Arrange
    const reportId = 312;
    const nonUploadedReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
      .withId(reportId)
      .withBankId(bankId)
      .withReportPeriod(reportPeriod)
      .build();

    // Act
    const mappedReport = await mapUtilisationReportEntityToGetUtilisationReportResponse(nonUploadedReport);

    // Assert
    expect(mappedReport).toEqual<GetUtilisationReportResponse>({
      id: reportId,
      bankId,
      reportPeriod,
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      dateUploaded: null,
      uploadedByUser: null,
      azureFileInfo: null,
    });
  });

  it('gets a user from the mongo database and maps the report when the report is uploaded', async () => {
    // Arrange
    const reportId = 312;
    const uploadedByUserId = mockPortalUser._id.toString();
    const azureFileInfo = AzureFileInfoEntity.create({
      ...MOCK_AZURE_FILE_INFO,
      requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: uploadedByUserId },
    });
    const mockDate = new Date('2024-01');

    const uploadedReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
      .withId(reportId)
      .withBankId(bankId)
      .withReportPeriod(reportPeriod)
      .withUploadedByUserId(uploadedByUserId)
      .withAzureFileInfo(azureFileInfo)
      .withDateUploaded(mockDate)
      .build();

    jest.mocked(getUserById).mockResolvedValue(mockPortalUser);

    // Act
    const mappedReport = await mapUtilisationReportEntityToGetUtilisationReportResponse(uploadedReport);

    // Assert
    expect(getUserById).toHaveBeenCalledWith(uploadedByUserId);
    expect(mappedReport).toEqual<GetUtilisationReportResponse>({
      id: reportId,
      bankId,
      reportPeriod,
      status: 'PENDING_RECONCILIATION',
      dateUploaded: mockDate,
      uploadedByUser: {
        id: uploadedByUserId,
        firstname: mockPortalUser.firstname,
        surname: mockPortalUser.surname,
      },
      azureFileInfo: MOCK_AZURE_FILE_INFO,
    });
  });
});
