import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  AzureFileInfoEntity,
  MOCK_AZURE_FILE_INFO,
  PortalUser,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UploadedByUserDetails,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  REQUEST_PLATFORM_TYPE,
} from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { GetUtilisationReportResponse } from '../../../../types/utilisation-reports';
import { getUserById } from '../../../../repositories/users-repo';
import { GetUtilisationReportByIdRequest, getUtilisationReportById } from '.';

jest.mock('../../../../repositories/utilisation-reports-repo');
jest.mock('../../../../repositories/users-repo');

console.error = jest.fn();

type UploadedReportFields = 'dateUploaded' | 'uploadedByUserId';

describe('getUtilisationReport', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const reportId = 2023;

  const getHttpMocks = () =>
    httpMocks.createMocks<GetUtilisationReportByIdRequest>({
      params: { id: reportId.toString() },
    });

  const reportUploadStatuses = Object.values(UTILISATION_REPORT_RECONCILIATION_STATUS).filter((status) => status !== 'REPORT_NOT_RECEIVED');

  describe.each(reportUploadStatuses)("when a report has been uploaded and is in the '%s' state", (status) => {
    const uploadedByUser: UploadedByUserDetails = {
      id: '5ce819935e539c343f141ece',
      firstname: 'Test',
      surname: 'User',
    };

    const azureFileInfo = AzureFileInfoEntity.create({
      ...MOCK_AZURE_FILE_INFO,
      requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: uploadedByUser.id },
    });

    const mockDate = new Date('2024-01');

    const createMockIncompleteUploadedReport = (...missingFields: UploadedReportFields[]): UtilisationReportEntity => {
      /**
       * `uploadDate` and `uploadUser` can be `null` when the required fields are
       * missing which will throw an error under `allUploadFieldsArePopulated` functions.
       *
       */
      const uploadDate = missingFields.includes('dateUploaded') ? null : mockDate;
      const uploadUser = missingFields.includes('uploadedByUserId') ? null : uploadedByUser.id;

      return UtilisationReportEntityMockBuilder.forStatus(status)
        .withId(reportId)
        .withAzureFileInfo(azureFileInfo)
        .withDateUploaded(uploadDate)
        .withUploadedByUserId(uploadUser)
        .build();
    };

    const missingFieldCombinations: { missingFields: UploadedReportFields[] }[] = [
      { missingFields: ['dateUploaded'] },
      { missingFields: ['uploadedByUserId'] },
      { missingFields: ['dateUploaded', 'uploadedByUserId'] },
    ];

    it.each(missingFieldCombinations)("sends a 500 when the '$missingFields' report fields are missing", async ({ missingFields }) => {
      // Arrange
      const mockUtilisationReport = createMockIncompleteUploadedReport(...missingFields);
      const findOneBySpy = jest.spyOn(UtilisationReportRepo, 'findOneBy').mockResolvedValue(mockUtilisationReport);

      const errorSpy = jest.spyOn(global, 'Error');

      const { req, res } = getHttpMocks();

      // Act
      await getUtilisationReportById(req, res);

      // Assert
      expect(findOneBySpy).toHaveBeenCalledWith({ id: reportId });
      expect(res._getStatusCode()).toBe(500);
      expect(errorSpy).toHaveBeenCalledWith('Failed to map data - report seems to have been uploaded but is missing some required fields');
    });

    it('sends a 200 and maps the entity', async () => {
      // Arrange
      const mockGetUserByIdResponse = {
        _id: new ObjectId(uploadedByUser.id),
        firstname: uploadedByUser.firstname,
        surname: uploadedByUser.surname,
      } as PortalUser;
      jest.mocked(getUserById).mockResolvedValue(mockGetUserByIdResponse);

      const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withId(reportId)
        .withUploadedByUserId(uploadedByUser.id)
        .withDateUploaded(mockDate)
        .withAzureFileInfo(azureFileInfo)
        .build();
      const findOneBySpy = jest.spyOn(UtilisationReportRepo, 'findOneBy').mockResolvedValue(mockUtilisationReport);

      const { req, res } = getHttpMocks();

      // Act
      await getUtilisationReportById(req, res);

      // Assert
      expect(findOneBySpy).toHaveBeenCalledWith({ id: reportId });
      expect(getUserById).toHaveBeenCalledWith(mockUtilisationReport.uploadedByUserId);

      expect(res._getStatusCode()).toBe(200);

      expect(res._getData()).toEqual<GetUtilisationReportResponse>({
        id: reportId,
        bankId: mockUtilisationReport.bankId,
        uploadedByUser,
        dateUploaded: mockDate,
        status: mockUtilisationReport.status,
        azureFileInfo: MOCK_AZURE_FILE_INFO,
        reportPeriod: mockUtilisationReport.reportPeriod,
      });
    });
  });

  describe('when a report has not been uploaded', () => {
    const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
      .withId(reportId)
      .withUploadedByUserId(null)
      .withDateUploaded(null)
      .withAzureFileInfo(undefined)
      .build();

    it('sends a 200 and maps the entity', async () => {
      // Arrange
      const findOneBySpy = jest.spyOn(UtilisationReportRepo, 'findOneBy').mockResolvedValue(mockUtilisationReport);

      const { req, res } = getHttpMocks();

      // Act
      await getUtilisationReportById(req, res);

      // Assert
      expect(findOneBySpy).toHaveBeenCalledWith({ id: reportId });
      expect(getUserById).not.toHaveBeenCalled();

      expect(res._getStatusCode()).toBe(200);

      expect(res._getData()).toEqual<GetUtilisationReportResponse>({
        id: reportId,
        bankId: mockUtilisationReport.bankId,
        uploadedByUser: null,
        dateUploaded: null,
        status: mockUtilisationReport.status,
        azureFileInfo: null,
        reportPeriod: mockUtilisationReport.reportPeriod,
      });
    });
  });
});
