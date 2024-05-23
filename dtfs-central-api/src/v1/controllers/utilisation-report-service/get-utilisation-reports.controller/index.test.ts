import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  AzureFileInfoEntity,
  Bank,
  FeeRecordEntityMockBuilder,
  MOCK_AZURE_FILE_INFO,
  PortalUser,
  ReportPeriod,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UploadedByUserDetails,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import {
  GetUtilisationReportsByBankIdAndOptionsRequest,
  GetUtilisationReportsByBankIdAndYearRequest,
  getUtilisationReportsByBankIdAndOptions,
  getUtilisationReportsByBankIdAndYear,
} from './index';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { GetUtilisationReportResponse, UtilisationReportReconciliationSummaryItem } from '../../../../types/utilisation-reports';
import { getUserById } from '../../../../repositories/users-repo';
import { getBankById } from '../../../../repositories/banks-repo';

jest.mock('../../../../repositories/utilisation-reports-repo');
jest.mock('../../../../repositories/users-repo');
jest.mock('../../../../repositories/utilisation-reports-repo/utilisation-report-sql.repo');
jest.mock('../../../../repositories/banks-repo');

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
        requestSource: { platform: 'PORTAL', userId: 'abc123' },
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

      expect(res._getStatusCode()).toBe(200);
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

  describe('getUtilisationReportsByBankIdAndYear', () => {
    const bankId = '123';
    const year = '2024';
    const getHttpMocks = () =>
      httpMocks.createMocks<GetUtilisationReportsByBankIdAndYearRequest>({
        params: { bankId, year },
      });

    // todo mock bank

    it('returns a 500 response if any errors are thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.spyOn(UtilisationReportRepo, 'findSubmittedReportsForBankIdWithReportPeriodEndInYear').mockImplementation(jest.fn().mockRejectedValue(new Error()));

      // Act
      await getUtilisationReportsByBankIdAndYear(req, res);

      // Assert
      expect(res.statusCode).toEqual(500);
    });

    it('returns a 500 response if no bank found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(getBankById).mockImplementation(jest.fn().mockRejectedValue(new Error()));

      // Act
      await getUtilisationReportsByBankIdAndYear(req, res);

      // Assert
      expect(res.statusCode).toEqual(500);
    });

    it('calls the repo method with the correct filter and sends a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const MONTHLY_REPORT_PERIOD_SCHEDULE = [
        { startMonth: 1, endMonth: 1 },
        { startMonth: 2, endMonth: 2 },
        { startMonth: 3, endMonth: 3 },
        { startMonth: 4, endMonth: 4 },
        { startMonth: 5, endMonth: 5 },
        { startMonth: 6, endMonth: 6 },
        { startMonth: 7, endMonth: 7 },
        { startMonth: 8, endMonth: 8 },
        { startMonth: 9, endMonth: 9 },
        { startMonth: 10, endMonth: 10 },
        { startMonth: 11, endMonth: 11 },
        { startMonth: 12, endMonth: 12 },
      ];

      const mockGetBankByIdResponse = {
        id: '123',
        name: 'Test bank',
        isVisibleInTfmUtilisationReports: true,
        utilisationReportPeriodSchedule: MONTHLY_REPORT_PERIOD_SCHEDULE,
      } as Bank;

      jest.mocked(getBankById).mockResolvedValue(mockGetBankByIdResponse);

      const mockUtilisationReports: UtilisationReportEntity[] = [];
      const findSubmittedReportsForBankIdWithReportPeriodEndInYearMock = jest.fn().mockResolvedValue(mockUtilisationReports);
      jest
        .spyOn(UtilisationReportRepo, 'findSubmittedReportsForBankIdWithReportPeriodEndInYear')
        .mockImplementation(findSubmittedReportsForBankIdWithReportPeriodEndInYearMock);

      // Act
      await getUtilisationReportsByBankIdAndYear(req, res);

      // Assert
      expect(findSubmittedReportsForBankIdWithReportPeriodEndInYearMock).toHaveBeenCalledWith(bankId, Number(year));

      expect(res.statusCode).toEqual(200);
      expect(res._getData()).toEqual({
        bankName: mockGetBankByIdResponse.name,
        year,
        reports: [],
      });
    });

    it('maps entities to response', async () => {
      // Arrange
      const azureFileInfo = AzureFileInfoEntity.create({
        ...MOCK_AZURE_FILE_INFO,
        requestSource: { platform: 'PORTAL', userId: 'abc123' },
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

      const MONTHLY_REPORT_PERIOD_SCHEDULE = [
        { startMonth: 1, endMonth: 1 },
        { startMonth: 2, endMonth: 2 },
        { startMonth: 3, endMonth: 3 },
        { startMonth: 4, endMonth: 4 },
        { startMonth: 5, endMonth: 5 },
        { startMonth: 6, endMonth: 6 },
        { startMonth: 7, endMonth: 7 },
        { startMonth: 8, endMonth: 8 },
        { startMonth: 9, endMonth: 9 },
        { startMonth: 10, endMonth: 10 },
        { startMonth: 11, endMonth: 11 },
        { startMonth: 12, endMonth: 12 },
      ];

      const mockGetBankByIdResponse = {
        id: '123',
        name: 'Test bank',
        isVisibleInTfmUtilisationReports: true,
        utilisationReportPeriodSchedule: MONTHLY_REPORT_PERIOD_SCHEDULE,
      } as Bank;

      jest.mocked(getBankById).mockResolvedValue(mockGetBankByIdResponse);

      const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
        .withAzureFileInfo(azureFileInfo)
        .withDateUploaded(mockDate)
        .withUploadedByUserId(mockUploadedByUser.id)
        .withBankId(mockGetBankByIdResponse.id)
        .build();
      const mockFeeRecord = FeeRecordEntityMockBuilder.forReport(mockUtilisationReport).build();
      mockUtilisationReport.feeRecords = [mockFeeRecord];
      const findSubmittedReportsForBankIdWithReportPeriodEndInYearMock = jest.fn().mockResolvedValue([mockUtilisationReport]);
      jest
        .spyOn(UtilisationReportRepo, 'findSubmittedReportsForBankIdWithReportPeriodEndInYear')
        .mockImplementation(findSubmittedReportsForBankIdWithReportPeriodEndInYearMock);

      const { req, res } = getHttpMocks();

      // Act
      await getUtilisationReportsByBankIdAndYear(req, res);

      // Assert
      expect(findSubmittedReportsForBankIdWithReportPeriodEndInYearMock).toHaveBeenCalledWith(bankId, Number(year));

      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual<{
        bankName: string;
        year: string;
        reports: UtilisationReportReconciliationSummaryItem[];
      }>({
        bankName: mockGetBankByIdResponse.name,
        year,
        reports: [
          {
            reportId: mockUtilisationReport.id,
            reportPeriod: mockUtilisationReport.reportPeriod,
            bank: {
              id: mockGetBankByIdResponse.id,
              name: mockGetBankByIdResponse.name,
            },
            status: mockUtilisationReport.status,
            dateUploaded: mockDate,
            totalFeesReported: 1,
            reportedFeesLeftToReconcile: 1,
          },
        ],
      });
    });
  });
});
