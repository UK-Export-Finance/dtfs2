import db from '../drivers/db-client';
import { getAllBanks, getBankNameById } from './banks-repo';
import { DB_COLLECTIONS } from '../constants';
import { MOCK_BANKS } from '../../api-tests/mocks/banks';

describe('banks-repo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllBanks', () => {
    it('calls the DB with the correct collection name', async () => {
      // Arrange
      const toArrayMock = jest.fn();
      const findMock = jest.fn(() => ({ toArray: toArrayMock }));
      const getCollectionMock = jest.fn().mockResolvedValue({
        find: findMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

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
    const getCollectionMock = jest.fn();

    beforeEach(() => {
      getCollectionMock.mockResolvedValue({
        findOne: findOneMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
    });

    it('calls the mongo collection with the correct name', async () => {
      // Arrange
      const bankId = '';

      // Act
      await getBankNameById(bankId);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.BANKS);
    });

    it('calls the findOne function with the correct id', async () => {
      // Arrange
      const bankId = 'test';

      // Act
      await getBankNameById(bankId);

      // Assert
      expect(findOneMock).toHaveBeenLastCalledWith({ id: { $eq: bankId } });
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
