const expectMongoId = (obj) => ({
  _id: expect.any(String),
  ...obj,
});

const expectMongoIds = (list) => list.map(expectMongoId);

export { expectMongoId, expectMongoIds };
