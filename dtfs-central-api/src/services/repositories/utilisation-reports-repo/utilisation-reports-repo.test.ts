import { Filter, ObjectId } from 'mongodb';
import {
  updateUtilisationReportDetailsWithUploadDetails,
  getManyUtilisationReportDetailsByBankId,
  getOneUtilisationReportDetailsByBankId,
  getUtilisationReportDetailsById,
  getOpenReportsBeforeReportPeriodForBankId,
  saveNotReceivedUtilisationReport,
  GetUtilisationReportDetailsOptions,
} from './utilisation-reports-repo';
import db from '../../../drivers/db-client';
import { DB_COLLECTIONS } from '../../../constants/db-collections';
import { MOCK_NOT_RECEIVED_UTILISATION_REPORT, MOCK_UTILISATION_REPORT } from '../../../../api-tests/mocks/utilisation-reports/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';
import { PortalSessionUser } from '../../../types/portal/portal-session-user';
import { MonthAndYear } from '../../../types/date';
import { UtilisationReport } from '../../../types/db-models/utilisation-reports';
import { ReportPeriod } from '../../../types/utilisation-reports';

describe('utilisation-reports-repo', () => {
  describe('updateUtilisationReportDetailsWithUploadDetails', () => {
    it('maps the data and correctly saves to the database', async () => {
      // Arrange
      const updateOneSpy = jest.fn().mockResolvedValue({
        acknowledged: true,
      });
      const getCollectionMock = jest.fn().mockResolvedValue({
        updateOne: updateOneSpy,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      const existingReport = MOCK_NOT_RECEIVED_UTILISATION_REPORT;

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
      await updateUtilisationReportDetailsWithUploadDetails(existingReport, mockAzureFileInfo, mockUploadedUser);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_REPORTS);
      expect(updateOneSpy).toHaveBeenCalledWith(
        {
          _id: { $eq: existingReport._id },
        },
        {
          $set: {
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

  describe('getOneUtilisationReportDetailsByBankId', () => {
    describe('when options are passed in', () => {
      const bankId = '123';
      const bankIdFilter = {
        'bank.id': { $eq: bankId },
      };

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

      const findOneSpy = jest.fn();
      const getCollectionMock = jest.fn().mockResolvedValue({
        findOne: findOneSpy,
      });

      beforeEach(() => {
        jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
      });

      const optsWithExpectedFilters: {
        condition: string;
        opts: GetUtilisationReportDetailsOptions | undefined;
        expectedFilter: Filter<UtilisationReport>;
      }[] = [
        {
          condition: 'opts is undefined',
          opts: undefined,
          expectedFilter: { ...bankIdFilter },
        },
        {
          condition: 'a report period is passed in',
          opts: { reportPeriod: validReportPeriod },
          expectedFilter: { ...bankIdFilter, reportPeriod: { $eq: validReportPeriod } },
        },
        {
          condition: "an 'excludeNonUploaded' flag is passed in",
          opts: { excludeNotUploaded: 'true' },
          expectedFilter: { ...bankIdFilter, status: { $not: { $in: ['REPORT_NOT_RECEIVED'] } }, azureFileInfo: { $not: { $eq: null } } },
        },
        {
          condition: 'all options are defined',
          opts: { reportPeriod: validReportPeriod, excludeNotUploaded: 'true' },
          expectedFilter: {
            ...bankIdFilter,
            reportPeriod: { $eq: validReportPeriod },
            status: { $not: { $in: ['REPORT_NOT_RECEIVED'] } },
            azureFileInfo: { $not: { $eq: null } },
          },
        },
      ];

      it.each(optsWithExpectedFilters)("calls the 'findOne' function with the correct filter when $condition", async ({ opts, expectedFilter }) => {
        // Act
        await getOneUtilisationReportDetailsByBankId(bankId, opts);

        // Assert
        expect(findOneSpy).toHaveBeenCalledWith(expectedFilter);
      });
    });
  });

  describe('getManyUtilisationReportDetailsByBankId', () => {
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
      const response = await getManyUtilisationReportDetailsByBankId(bankId);

      // Assert
      const expectedResponse = [report4, report2, report3, report1];
      expect(response).toEqual(expectedResponse);
    });

    describe('when options are passed in', () => {
      const bankId = '123';
      const bankIdFilter = {
        'bank.id': { $eq: bankId },
      };

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

      const findSpy = jest.fn().mockReturnValue({
        toArray: jest.fn(),
      });
      const getCollectionMock = jest.fn().mockResolvedValue({
        find: findSpy,
      });

      beforeEach(() => {
        jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
      });

      const optsWithExpectedFilters: {
        condition: string;
        opts: GetUtilisationReportDetailsOptions | undefined;
        expectedFilter: Filter<UtilisationReport>;
      }[] = [
        {
          condition: 'opts is undefined',
          opts: undefined,
          expectedFilter: { ...bankIdFilter },
        },
        {
          condition: 'a report period is passed in',
          opts: { reportPeriod: validReportPeriod },
          expectedFilter: { ...bankIdFilter, reportPeriod: { $eq: validReportPeriod } },
        },
        {
          condition: "an 'excludeNonUploaded' flag is passed in",
          opts: { excludeNotUploaded: 'true' },
          expectedFilter: { ...bankIdFilter, status: { $not: { $in: ['REPORT_NOT_RECEIVED'] } }, azureFileInfo: { $not: { $eq: null } } },
        },
        {
          condition: 'all options are defined',
          opts: { reportPeriod: validReportPeriod, excludeNotUploaded: 'true' },
          expectedFilter: {
            ...bankIdFilter,
            reportPeriod: { $eq: validReportPeriod },
            status: { $not: { $in: ['REPORT_NOT_RECEIVED'] } },
            azureFileInfo: { $not: { $eq: null } },
          },
        },
      ];

      it.each(optsWithExpectedFilters)("calls the 'find' function with the correct filter when $condition", async ({ opts, expectedFilter }) => {
        // Act
        await getManyUtilisationReportDetailsByBankId(bankId, opts);

        // Assert
        expect(findSpy).toHaveBeenCalledWith(expectedFilter);
      });
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
      expect(findOneSpy).toHaveBeenCalledWith({ _id: { $eq: new ObjectId(reportId) } });
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
              { 'reportPeriod.start.year': { $lt: reportPeriodStart.year } },
              {
                $and: [{ 'reportPeriod.start.year': { $eq: reportPeriodStart.year } }, { 'reportPeriod.start.month': { $lt: reportPeriodStart.month } }],
              },
            ],
          },
        ],
      });
      expect(response).toEqual(MOCK_UTILISATION_REPORT);
    });
  });
});
