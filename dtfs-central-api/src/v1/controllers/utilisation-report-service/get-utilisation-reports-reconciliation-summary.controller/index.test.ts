import { Request } from 'express';
import httpMocks from 'node-mocks-http';
import {
  REQUEST_PLATFORM_TYPE,
  AzureFileInfoEntity,
  Bank,
  MOCK_AZURE_FILE_INFO,
  PortalUser,
  UploadedByUserDetails,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  FeeRecordEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { GetUtilisationReportsByBankIdAndYearRequest, getUtilisationReportsReconciliationSummary, getUtilisationReportSummariesByBankIdAndYear } from './index';
import { generateReconciliationSummaries } from './helpers';
import { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } from '../../../../../api-tests/mocks/utilisation-reports/utilisation-report-reconciliation-summary';
import { getBankById } from '../../../../repositories/banks-repo';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { UtilisationReportReconciliationSummaryItem } from '../../../../types/utilisation-reports';
import { getUserById } from '../../../../repositories/users-repo';

jest.mock('./helpers/reconciliation-summary-generator');
jest.mock('../../../../repositories/utilisation-reports-repo');
jest.mock('../../../../repositories/users-repo');
jest.mock('../../../../repositories/banks-repo');

console.error = jest.fn();

describe('getReconciliationSummary', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUtilisationReportsReconciliationSummary', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks<Request<{ submissionMonth: string }>>({
        params: { submissionMonth: '2023-11' },
      });

    it('returns a 500 response if any errors are thrown', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const error = new Error('Failed to connect to DB');
      jest.mocked(generateReconciliationSummaries).mockRejectedValue(error);

      // Act
      await getUtilisationReportsReconciliationSummary(req, res);

      // Assert
      const expectedErrorMessage = 'Failed to get utilisation reports reconciliation summary';

      expect(console.error).toHaveBeenCalledWith(expectedErrorMessage, error);

      expect(res.statusCode).toEqual(500);
      expect(res._getData()).toEqual(expectedErrorMessage);
    });

    it('returns the reconciliation summary', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      jest.mocked(generateReconciliationSummaries).mockResolvedValue([MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY]);

      // Act
      await getUtilisationReportsReconciliationSummary(req, res);

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(res._getData()).toEqual([MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY]);
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
      await getUtilisationReportSummariesByBankIdAndYear(req, res);

      // Assert
      expect(res.statusCode).toEqual(500);
    });

    it('returns a 500 response if no bank found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(getBankById).mockImplementation(jest.fn().mockRejectedValue(new Error()));

      // Act
      await getUtilisationReportSummariesByBankIdAndYear(req, res);

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
      await getUtilisationReportSummariesByBankIdAndYear(req, res);

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
      await getUtilisationReportSummariesByBankIdAndYear(req, res);

      // Assert
      expect(findSubmittedReportsForBankIdWithReportPeriodEndInYearMock).toHaveBeenCalledWith(bankId, Number(year));

      expect(res._getStatusCode()).toEqual(200);
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
            totalFacilitiesReported: 1,
            totalFeesReported: 1,
            reportedFeesLeftToReconcile: 1,
          },
        ],
      });
    });
  });
});
