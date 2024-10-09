import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  AzureFileInfoEntity,
  MOCK_AZURE_FILE_INFO,
  PortalUser,
  ReportPeriod,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UploadedByUserDetails,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  REQUEST_PLATFORM_TYPE,
} from '@ukef/dtfs2-common';
import { GetUtilisationReportsByBankIdAndOptionsRequest, getUtilisationReportsByBankIdAndOptions } from './index';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { GetUtilisationReportResponse } from '../../../../types/utilisation-reports';
import { getUserById } from '../../../../repositories/users-repo';

jest.mock('../../../../repositories/utilisation-reports-repo');
jest.mock('../../../../repositories/users-repo');

console.error = jest.fn();

describe('getUtilisationReports', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUtilisationReportsByBankIdAndOptions', () => {
    const bankId = '123';
    const getHttpMocks = (queryOpts?: Partial<GetUtilisationReportsByBankIdAndOptionsRequest['query']>) =>
      httpMocks.createMocks<GetUtilisationReportsByBankIdAndOptionsRequest>({
        params: { bankId },
        query: {
          reportPeriod: queryOpts?.reportPeriod ?? undefined,
          excludeNotReceived: queryOpts?.excludeNotReceived ?? false,
        },
      });

    const getReportPeriodJsonObject = (reportPeriod: ReportPeriod) => ({
      start: {
        month: reportPeriod.start.month.toString(),
        year: reportPeriod.start.year.toString(),
      },
      end: {
        month: reportPeriod.end.month.toString(),
        year: reportPeriod.end.year.toString(),
      },
    });

    it('returns a 500 response if any errors are thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(jest.fn().mockRejectedValue(new Error()));

      // Act
      await getUtilisationReportsByBankIdAndOptions(req, res);

      // Assert
      expect(res.statusCode).toEqual(500);
    });

    it('calls the repo method with the correct filter when no queries are defined', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const mockUtilisationReports: UtilisationReportEntity[] = [];
      const findAllByBankIdMock = jest.fn().mockResolvedValue(mockUtilisationReports);
      jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

      // Act
      await getUtilisationReportsByBankIdAndOptions(req, res);

      // Assert
      expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
        reportPeriod: undefined,
        excludeNotReceived: false,
      });

      expect(res.statusCode).toEqual(200);
      expect(res._getData()).toEqual(mockUtilisationReports);
    });

    it('calls the repo method with the correct values and sends a 200 when a report period query is defined', async () => {
      // Arrange
      const validReportPeriod: ReportPeriod = {
        start: {
          month: 1,
          year: 2024,
        },
        end: {
          month: 2,
          year: 2025,
        },
      };

      const mockUtilisationReports: UtilisationReportEntity[] = [];
      const findAllByBankIdMock = jest.fn().mockResolvedValue(mockUtilisationReports);
      jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

      const { req, res } = getHttpMocks({ reportPeriod: getReportPeriodJsonObject(validReportPeriod) });

      // Act
      await getUtilisationReportsByBankIdAndOptions(req, res);

      // Assert
      expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
        reportPeriod: validReportPeriod,
        excludeNotReceived: false,
      });

      expect(res.statusCode).toEqual(200);
      expect(res._getData()).toEqual(mockUtilisationReports);
    });

    it("calls the repo method with the correct values and sends a 200 when the 'excludeNotReceived' query is defined", async () => {
      // Arrange
      const excludeNotReceived = 'true';

      const mockUtilisationReports: UtilisationReportEntity[] = [];
      const findAllByBankIdMock = jest.fn().mockResolvedValue(mockUtilisationReports);
      jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

      const { req, res } = getHttpMocks({ excludeNotReceived });

      // Act
      await getUtilisationReportsByBankIdAndOptions(req, res);

      // Assert
      expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
        excludeNotReceived: true,
        reportPeriod: undefined,
      });

      expect(res.statusCode).toEqual(200);
      expect(res._getData()).toEqual(mockUtilisationReports);
    });

    it('calls the repo method with the correct values and sends a 200 when all possible queries are defined', async () => {
      // Arrange
      const validReportPeriod: ReportPeriod = {
        start: {
          month: 1,
          year: 2024,
        },
        end: {
          month: 2,
          year: 2025,
        },
      };

      const excludeNotReceived = 'true';

      const mockUtilisationReports: UtilisationReportEntity[] = [];
      const findAllByBankIdMock = jest.fn().mockResolvedValue(mockUtilisationReports);
      jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

      const { req, res } = getHttpMocks({
        reportPeriod: getReportPeriodJsonObject(validReportPeriod),
        excludeNotReceived,
      });

      // Act
      await getUtilisationReportsByBankIdAndOptions(req, res);

      // Assert
      expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
        reportPeriod: validReportPeriod,
        excludeNotReceived: true,
      });

      expect(res.statusCode).toEqual(200);
      expect(res._getData()).toEqual(mockUtilisationReports);
    });

    it('maps entities to response', async () => {
      // Arrange
      const validReportPeriod: ReportPeriod = {
        start: {
          month: 1,
          year: 2024,
        },
        end: {
          month: 2,
          year: 2025,
        },
      };

      const excludeNotReceived = 'true';

      const azureFileInfo = AzureFileInfoEntity.create({
        ...MOCK_AZURE_FILE_INFO,
        requestSource: { platform: REQUEST_PLATFORM_TYPE.PORTAL, userId: 'abc123' },
      });

      const mockDate = new Date('2024-01');

      const mockUploadedByUser: UploadedByUserDetails = {
        id: '5ce819935e539c343f141ece',
        firstname: 'Test',
        surname: 'User',
      };

      const mockGetUserByIdResponse = {
        _id: new ObjectId(mockUploadedByUser.id),
        firstname: mockUploadedByUser.firstname,
        surname: mockUploadedByUser.surname,
      } as PortalUser;

      jest.mocked(getUserById).mockResolvedValue(mockGetUserByIdResponse);

      const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
        .withAzureFileInfo(azureFileInfo)
        .withDateUploaded(mockDate)
        .withUploadedByUserId(mockUploadedByUser.id)
        .build();
      const findAllByBankIdMock = jest.fn().mockResolvedValue([mockUtilisationReport]);
      jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

      const { req, res } = getHttpMocks({
        reportPeriod: getReportPeriodJsonObject(validReportPeriod),
        excludeNotReceived,
      });

      // Act
      await getUtilisationReportsByBankIdAndOptions(req, res);

      // Assert
      expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
        reportPeriod: validReportPeriod,
        excludeNotReceived: true,
      });

      expect(res._getStatusCode()).toEqual(200);
      expect(res._getData()).toHaveLength(1);
      expect(res._getData()).toEqual<GetUtilisationReportResponse[]>([
        {
          id: mockUtilisationReport.id,
          bankId: mockUtilisationReport.bankId,
          status: mockUtilisationReport.status,
          azureFileInfo: MOCK_AZURE_FILE_INFO,
          reportPeriod: mockUtilisationReport.reportPeriod,
          dateUploaded: mockDate,
          uploadedByUser: mockUploadedByUser,
        },
      ]);
    });
  });
});
