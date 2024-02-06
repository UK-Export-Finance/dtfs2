// Returns the latest eligibility criteria object for BSS_EWCS deal type when there is only one object in the collection
const db = require('../../drivers/db-client');
const { DEAL } = require('../../constants');
const { findLatest } = require('./eligibilityCriteria.controller');

it('should return the latest eligibility criteria object for BSS_EWCS deal type when there is only one object in the collection', async () => {
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValueOnce([{ id: 1, version: 1, isInDraft: false }]),
  };
  const mockDb = {
    getCollection: jest.fn().mockResolvedValueOnce(mockCollection),
  };

  db.getCollection = mockDb.getCollection;

  const result = await findLatest();

  expect(mockDb.getCollection).toHaveBeenCalledWith('eligibilityCriteria');
  expect(mockCollection.find).toHaveBeenCalledWith({ $and: [{ product: { $eq: DEAL.DEAL_TYPE.BSS_EWCS } }, { isInDraft: { $eq: false } }] });
  expect(mockCollection.sort).toHaveBeenCalledWith({ version: -1 });
  expect(mockCollection.limit).toHaveBeenCalledWith(1);
  expect(mockCollection.toArray).toHaveBeenCalled();
  expect(result).toEqual({ id: 1, version: 1, isInDraft: false });
});

// Returns the latest eligibility criteria object for BSS_EWCS deal type when there are multiple objects in the collection
it('should return the latest eligibility criteria object for BSS_EWCS deal type when there are multiple objects in the collection', async () => {
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValueOnce([
      { id: 1, version: 1, isInDraft: false },
      { id: 2, version: 2, isInDraft: true },
    ]),
  };
  const mockDb = {
    getCollection: jest.fn().mockResolvedValueOnce(mockCollection),
  };

  db.getCollection = mockDb.getCollection;

  const result = await findLatest();

  expect(mockDb.getCollection).toHaveBeenCalledWith('eligibilityCriteria');
  expect(mockCollection.find).toHaveBeenCalledWith({ $and: [{ product: { $eq: DEAL.DEAL_TYPE.BSS_EWCS } }, { isInDraft: { $eq: false } }] });
  expect(mockCollection.sort).toHaveBeenCalledWith({ version: -1 });
  expect(mockCollection.limit).toHaveBeenCalledWith(1);
  expect(mockCollection.toArray).toHaveBeenCalled();
  expect(result).toEqual({ id: 1, version: 1, isInDraft: false });
});
