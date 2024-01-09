import { ObjectId } from 'mongodb';
import { saveUtilisationReportDetails, getUtilisationReportDetailsByBankId, getUtilisationReportDetailsById } from './utilisation-reports-repo';
import db from '../../../drivers/db-client';
import { DB_COLLECTIONS } from '../../../constants/db-collections';
import { MOCK_UTILISATION_REPORT } from '../../../../api-tests/mocks/utilisation-reports/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';
import { PortalSessionUser } from '../../../types/portal/portal-session-user';

describe('utilisation-reports-repo', () => {
  describe('saveUtilisationReportDetails', () => {
    it('maps the data and correctly saves to the database', async () => {
      // Arrange
      const insertOneSpy = jest.fn().mockResolvedValue({
        acknowledged: true,
        insertedId: MOCK_UTILISATION_REPORT._id,
      });
      const getCollectionMock = jest.fn().mockResolvedValue({
        insertOne: insertOneSpy,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      const mockMonth = 1;
      const mockYear = 2021;
      const mockAzureFileInfo = {
        folder: 'test_bank',
        filename: '2021_January_test_bank_utilisation_report.csv',
        fullPath: 'test_bank/2021_January_test_bank_utilisation_report.csv',
        url: 'test.url.csv',
        mimetype: 'text/csv',
      };
      const mockUploadedUser = {
        _id: '123',
        firstname: 'test',
        surname: 'user',
        bank: {
          id: '123',
          name: 'test bank',
        },
      } as PortalSessionUser;

      // Act
      await saveUtilisationReportDetails(mockMonth, mockYear, mockAzureFileInfo, mockUploadedUser);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_REPORTS);
      expect(insertOneSpy).toHaveBeenCalledWith({
        bank: {
          id: '123',
          name: 'test bank',
        },
        month: 1,
        year: 2021,
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
          id: '123',
          firstname: 'test',
          surname: 'user',
        },
      });
    });
  });

  describe('getUtilisationReportDetailsByBankId', () => {
    it('sorts the data by year then month', async () => {
      // Arrange
      const bankId = MOCK_UTILISATION_REPORT.bank.id;
      const report1 = { ...MOCK_UTILISATION_REPORT, month: 2, year: 2022 };
      const report2 = { ...MOCK_UTILISATION_REPORT, month: 3, year: 2021 };
      const report3 = { ...MOCK_UTILISATION_REPORT, month: 1, year: 2022 };
      const report4 = { ...MOCK_UTILISATION_REPORT, month: 2, year: 2021 };

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
});
