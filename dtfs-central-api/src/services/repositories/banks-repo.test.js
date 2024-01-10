const db = require('../../drivers/db-client');
const { getAllBanks, getBankNameById } = require('./banks-repo');
const { DB_COLLECTIONS } = require('../../constants');
const { MOCK_BANKS } = require('../../../api-tests/mocks/banks');

describe('banks-repo', () => {
  const getCollectionSpy = jest.spyOn(db, 'getCollection');
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
      getCollectionSpy.mockImplementation(getCollectionMock);

      // Act
      await getAllBanks();

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.BANKS);
      expect(findMock).toHaveBeenCalled();
      expect(toArrayMock).toHaveBeenCalled();
    });
  });

  describe('getBankNameById', () => {
    const findOneMock = jest.fn();

    beforeEach(() => {
      getCollectionSpy.mockResolvedValue({
        findOne: findOneMock,
      });
    });

    it('calls the mongo collection with the correct name', async () => {
      // Arrange
      const bankId = '';

      // Act
      await getBankNameById(bankId);

      // Assert
      expect(getCollectionSpy).toHaveBeenCalledWith(DB_COLLECTIONS.BANKS);
    });

    it('calls the findOne function with the correct id', async () => {
      // Arrange
      const bankId = 'test';

      // Act
      await getBankNameById(bankId);

      // Assert
      expect(findOneMock).toHaveBeenLastCalledWith({ id: bankId });
    });

    it('returns the bank name for the bank with the matching id', async () => {
      // Arrange
      const bankId = MOCK_BANKS.HSBC.id;
      findOneMock.mockResolvedValue(MOCK_BANKS.HSBC);

      // Act
      const bankName = await getBankNameById(bankId);

      // Assert
      expect(bankName).toEqual(MOCK_BANKS.HSBC.name);
    });

    it('returns undefined if a bank with the supplied id does not exist', async () => {
      // Arrange
      const bankId = '';
      findOneMock.mockResolvedValue(null);

      // Act
      const bankName = await getBankNameById(bankId);

      // Assert
      expect(bankName).toBeUndefined();
    });
  });
});
