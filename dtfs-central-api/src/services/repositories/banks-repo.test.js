const db = require('../../drivers/db-client');
const { getAllBanks } = require('./banks-repo');
const { DB_COLLECTIONS } = require('../../constants');

describe('banks-repo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllBanks', () => {
    it('calls the DB with the correct collection name', async () => {
      // Arrange
      const toArrayMock = jest.fn();
      const findMock = jest.fn(() => ({ toArray: toArrayMock }));
      const getCollectionMock = jest.fn(() => ({
        find: findMock,
      }));

      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      await getAllBanks();

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.BANKS);
      expect(findMock).toHaveBeenCalled();
      expect(toArrayMock).toHaveBeenCalled();
    });
  });
});
