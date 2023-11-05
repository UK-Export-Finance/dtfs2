const { saveUtilisationReportDetails, getUtilisationReportDetails } = require('./utilisation-reports-repo');
const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/dbCollections');

describe('utilisation-reports-repo', () => {
  describe('saveUtilisationReportDetails', () => {
    it('maps the data and correctly saves to the database', async () => {
      const insertOneSpy = jest.fn().mockResolvedValue();
      const getCollectionMock = jest.fn(() => ({
        insertOne: insertOneSpy,
      }));
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
      const mockBank = {
        id: '123',
        name: 'test bank',
      };
      const mockMonth = 1;
      const mockYear = 2021;
      const mockCsvFilePath = 'test path';
      const mockUploadedUser = {
        _id: '123',
        firstname: 'test',
        surname: 'user',
      };

      await saveUtilisationReportDetails(mockBank, mockMonth, mockYear, mockCsvFilePath, mockUploadedUser);
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_REPORTS);
      expect(insertOneSpy).toHaveBeenCalledWith({
        bank: {
          id: '123',
          name: 'test bank',
        },
        month: 1,
        year: 2021,
        dateUploaded: expect.any(Date),
        path: 'test path',
        uploadedBy: {
          id: '123',
          name: 'test user',
        },
      });
    });
  });

  describe('getUtilisationReportDetails', () => {
    const bankId = '123';
    const mockUtilisationReports = [{
      bank: {
        id: '123',
        name: 'test bank',
      },
      month: 1,
      year: 2022,
      dateUploaded: expect.any(Date),
      path: 'test path',
      uploadedBy: {
        id: '123',
        name: 'test user',
      },
    }, {
      bank: {
        id: '123',
        name: 'test bank',
      },
      month: 3,
      year: 2021,
      dateUploaded: expect.any(Date),
      path: 'test path',
      uploadedBy: {
        id: '123',
        name: 'test user',
      },
    }, {
      bank: {
        id: '123',
        name: 'test bank',
      },
      month: 2,
      year: 2021,
      dateUploaded: expect.any(Date),
      path: 'test path',
      uploadedBy: {
        id: '123',
        name: 'test user',
      },
    }, {
      bank: {
        id: '123',
        name: 'test bank',
      },
      month: 1,
      year: 2021,
      dateUploaded: expect.any(Date),
      path: 'test path',
      uploadedBy: {
        id: '123',
        name: 'test user',
      },
    }, {
      bank: {
        id: '124',
        name: 'test bank',
      },
      month: 4,
      year: 2021,
      dateUploaded: expect.any(Date),
      path: 'test path',
      uploadedBy: {
        id: '123',
        name: 'test user',
      },
    }];

    it('filters and sorts the data correctly', async () => {
      const toArraySpy = jest.fn(() => (mockUtilisationReports));
      const findSpy = jest.fn(() => ({
        toArray: toArraySpy,
      }));
      const getCollectionMock = jest.fn(() => ({
        find: findSpy,
      }));
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      const utilisationReports = await getUtilisationReportDetails(bankId);
      expect(utilisationReports[0]).toEqual(mockUtilisationReports[3]);
      expect(utilisationReports[utilisationReports.length - 1]).toEqual(mockUtilisationReports[0]);
    });
  });
});
