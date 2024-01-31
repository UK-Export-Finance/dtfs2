import { ObjectId } from 'mongodb';
import {
  saveUtilisationReportDetails,
  getUtilisationReportDetailsByBankId,
  getUtilisationReportDetailsById,
  getOpenReportsBeforeReportPeriodForBankId,
  saveNotReceivedUtilisationReport,
  getUtilisationReportDetailsByBankIdAndReportPeriod,
} from './utilisation-reports-repo';
import db from '../../../drivers/db-client';
import { DB_COLLECTIONS } from '../../../constants/db-collections';
import { MOCK_UTILISATION_REPORT } from '../../../../api-tests/mocks/utilisation-reports/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';
import { PortalSessionUser } from '../../../types/portal/portal-session-user';
import { MonthAndYear } from '../../../types/date';
import { UtilisationReport } from '../../../types/db-models/utilisation-reports';
import { ReportPeriod } from '../../../types/utilisation-reports';

describe('utilisation-reports-repo', () => {
  describe('saveUtilisationReportDetails', () => {
    it('maps the data and correctly saves to the database', async () => {
      // Arrange
      const updateOneSpy = jest.fn().mockResolvedValue({
        acknowledged: true,
        upsertedId: MOCK_UTILISATION_REPORT._id,
      });
      const getCollectionMock = jest.fn().mockResolvedValue({
        updateOne: updateOneSpy,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      const mockReportPeriod: ReportPeriod = {
        start: {
          month: 1,
          year: 2021,
        },
        end: {
          month: 1,
          year: 2021,
        },
      };
      const mockAzureFileInfo = {
        folder: 'test_bank',
        filename: '2021_January_test_bank_utilisation_report.csv',
        fullPath: 'test_bank/2021_January_test_bank_utilisation_report.csv',
        url: 'test.url.csv',
        mimetype: 'text/csv',
      };
      const mockUploadedUser = {
        _id: new ObjectId('5ce819935e539c343f141ece'),
        firstname: 'test',
        surname: 'user',
        bank: {
          id: '123',
          name: 'test bank',
        },
      } as PortalSessionUser;

      // Act
      await saveUtilisationReportDetails(mockReportPeriod, mockAzureFileInfo, mockUploadedUser);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_REPORTS);
      expect(updateOneSpy).toHaveBeenCalledWith(
        {
          'reportPeriod.start.month': 1,
          'reportPeriod.start.year': 2021,
          'reportPeriod.end.month': 1,
          'reportPeriod.end.year': 2021,
        },
        {
          bank: {
            id: '123',
            name: 'test bank',
          },
          reportPeriod: {
            start: {
              month: 1,
              year: 2021,
            },
            end: {
              month: 1,
              year: 2021,
            },
          },
          dateUploaded: expect.any(Date) as Date,
          azureFileInfo: {
            folder: 'test_bank',
            filename: '2021_January_test_bank_utilisation_report.csv',
            fullPath: 'test_bank/2021_January_test_bank_utilisation_report.csv',
            url: 'test.url.csv',
            mimetype: 'text/csv',
          },
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
          uploadedBy: {
            id: mockUploadedUser._id.toString(),
            firstname: mockUploadedUser.firstname,
            surname: mockUploadedUser.surname,
          },
        },
      );
    });
  });

  describe('saveNewUtilisationReportAsSystemUser', () => {
    it('maps the data and correctly saves to the database', async () => {
      // Arrange
      const insertOneSpy = jest.fn();
      const getCollectionMock = jest.fn().mockResolvedValue({
        insertOne: insertOneSpy,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      const mockReportPeriod: ReportPeriod = {
        start: {
          month: 1,
          year: 2021,
        },
        end: {
          month: 1,
          year: 2021,
        },
      };
      const mockSessionBank = {
        id: '123',
        name: 'Test bank',
      };

      // Act
      await saveNotReceivedUtilisationReport(mockReportPeriod, mockSessionBank);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_REPORTS);
      expect(insertOneSpy).toHaveBeenCalledWith({
        bank: mockSessionBank,
        reportPeriod: {
          start: {
            month: 1,
            year: 2021,
          },
          end: {
            month: 1,
            year: 2021,
          },
        },
        azureFileInfo: null,
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      });
    });
  });

  describe('getUtilisationReportDetailsByBankId', () => {
    const getMockReport = ({ bankId, year, month }: { bankId: string; month: number; year: number }): UtilisationReport => ({
      ...MOCK_UTILISATION_REPORT,
      bank: {
        ...MOCK_UTILISATION_REPORT.bank,
        id: bankId,
      },
      reportPeriod: {
        start: { month, year },
        end: { month, year },
      },
    });

    it('sorts the data by year then month', async () => {
      // Arrange
      const bankId = MOCK_UTILISATION_REPORT.bank.id;
      const report1 = getMockReport({ bankId, month: 2, year: 2022 });
      const report2 = getMockReport({ bankId, month: 3, year: 2021 });
      const report3 = getMockReport({ bankId, month: 1, year: 2022 });
      const report4 = getMockReport({ bankId, month: 2, year: 2021 });

      const mockUtilisationReports = [report1, report2, report3, report4];

      const findSpy = jest.fn().mockReturnValue({
        toArray: async () => Promise.resolve(mockUtilisationReports),
      });
      const getCollectionMock = jest.fn().mockResolvedValue({
        find: findSpy,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      const response = await getUtilisationReportDetailsByBankId(bankId);

      // Assert
      const expectedResponse = [report4, report2, report3, report1];
      expect(response).toEqual(expectedResponse);
    });
  });

  describe('getUtilisationReportDetailsById', () => {
    it('makes a request to the DB with the expected _id', async () => {
      // Arrange
      const reportId = '5099803df3f4948bd2f98391';

      const findOneSpy = jest.fn().mockResolvedValue(MOCK_UTILISATION_REPORT);
      const getCollectionMock = jest.fn().mockResolvedValue({
        findOne: findOneSpy,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      const response = await getUtilisationReportDetailsById(reportId);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith({ _id: new ObjectId(reportId) });
      expect(response).toEqual(MOCK_UTILISATION_REPORT);
    });
  });

  describe('getOpenReportsBeforeReportPeriodForBankId', () => {
    it('makes a request to the DB with the expected values', async () => {
      // Arrange
      const reportPeriodStart: MonthAndYear = { month: 12, year: 2023 };
      const bankId = '1004';

      const findMock = jest.fn().mockReturnValue({
        toArray: async () => Promise.resolve(MOCK_UTILISATION_REPORT),
      });
      const getCollectionMock = jest.fn().mockResolvedValue({
        find: findMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      const response = await getOpenReportsBeforeReportPeriodForBankId(reportPeriodStart, bankId);

      // Assert
      expect(findMock).toHaveBeenCalledWith({
        $and: [
          { 'bank.id': { $eq: bankId } },
          { status: { $ne: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED } },
          {
            $or: [
              { year: { $lt: reportPeriodStart.year } },
              {
                $and: [{ year: { $eq: reportPeriodStart.year } }, { month: { $lt: reportPeriodStart.month } }],
              },
            ],
          },
        ],
      });
      expect(response).toEqual(MOCK_UTILISATION_REPORT);
    });
  });

  describe('getUtilisationReportDetailsByBankIdAndReportPeriod', () => {
    it('makes the request to the DB with expected values', async () => {
      // Arrange
      const reportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 2, year: 2025 },
      };
      const bankId = '123';

      const findOneMock = jest.fn().mockReturnValue(MOCK_UTILISATION_REPORT);
      const getCollectionMock = jest.fn().mockResolvedValue({
        findOne: findOneMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      const response = await getUtilisationReportDetailsByBankIdAndReportPeriod(bankId, reportPeriod);

      // Assert
      expect(findOneMock).toHaveBeenCalledWith({
        'bank.id': bankId,
        'reportPeriod.start.month': reportPeriod.start.month,
        'reportPeriod.start.year': reportPeriod.start.year,
        'reportPeriod.end.month': reportPeriod.end.month,
        'reportPeriod.end.year': reportPeriod.end.year,
      });
      expect(response).toEqual(MOCK_UTILISATION_REPORT);
    });
  });
});
