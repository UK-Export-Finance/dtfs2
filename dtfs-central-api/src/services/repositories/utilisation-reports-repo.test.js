const { saveUtilisationReportDetails } = require('./utilisation-reports-repo');
const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/dbCollections');

describe('utilisation-reports-repo', () => {
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
