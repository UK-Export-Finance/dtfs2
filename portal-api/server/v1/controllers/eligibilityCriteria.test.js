const { mongoDbClient: db } = require('../../drivers/db-client');
const { DEAL } = require('../../constants');
const { getLatestEligibilityCriteria } = require('./eligibilityCriteria.controller');

let mockCollection = {};
let mockDatabase = {};

beforeAll(() => {
  mockCollection = {
    find: jest.fn().mockReturnThis([
      { id: 1, version: 1, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS },
      { id: 3, version: 3, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS },
      { id: 2, version: 2, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS },
    ]),
    sort: jest.fn().mockReturnThis([
      { id: 3, version: 3, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS },
      { id: 2, version: 2, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS },
      { id: 1, version: 1, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS },
    ]),
    limit: jest.fn().mockReturnThis({ id: 3, version: 3, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS }),
    toArray: jest.fn().mockResolvedValue([{ id: 3, version: 3, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS }]),
  };

  mockDatabase = {
    getCollection: jest.fn().mockResolvedValue(mockCollection),
  };

  db.getCollection = mockDatabase.getCollection;
});

it('should return the latest eligibility criteria object for BSS_EWCS deal type when there is only one object in the collection', async () => {
  const result = await getLatestEligibilityCriteria();

  expect(mockDatabase.getCollection).toHaveBeenCalledWith('eligibilityCriteria');
  expect(mockCollection.find).toHaveBeenCalledWith({
    $and: [{ product: { $eq: DEAL.DEAL_TYPE.BSS_EWCS } }, { isInDraft: { $eq: false } }],
  });
  expect(mockCollection.sort).toHaveBeenCalledWith({ version: -1 });
  expect(mockCollection.limit).toHaveBeenCalledWith(1);
  expect(mockCollection.toArray).toHaveBeenCalledWith();
  expect(result).toEqual({ id: 3, version: 3, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS });
});

it('should return the latest non-draft eligibility criteria object for BSS_EWCS deal type when the latest EC is in draft mode', async () => {
  // Mock EC v3 to Draft mode
  mockCollection.sort = jest.fn().mockReturnThis([
    { id: 3, version: 3, isInDraft: true, product: DEAL.DEAL_TYPE.BSS_EWCS },
    { id: 2, version: 2, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS },
    { id: 1, version: 1, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS },
  ]);
  mockCollection.toArray = jest.fn().mockResolvedValue([{ id: 2, version: 2, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS }]);

  const result = await getLatestEligibilityCriteria();

  expect(mockDatabase.getCollection).toHaveBeenCalledWith('eligibilityCriteria');
  expect(mockCollection.find).toHaveBeenCalledWith({
    $and: [{ product: { $eq: DEAL.DEAL_TYPE.BSS_EWCS } }, { isInDraft: { $eq: false } }],
  });
  expect(mockCollection.sort).toHaveBeenCalledWith({ version: -1 });
  expect(mockCollection.limit).toHaveBeenCalledWith(1);
  expect(mockCollection.toArray).toHaveBeenCalledWith();
  expect(result).toEqual({ id: 2, version: 2, isInDraft: false, product: DEAL.DEAL_TYPE.BSS_EWCS });
});
