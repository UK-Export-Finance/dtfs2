const expectMongoId = (obj) => {
  return {
    _id:  expect.any(String),
    ... obj
  }
}

const expectMongoIds = list => list.map(expectMongoId);

module.exports = {
  expectMongoId,
  expectMongoIds
}
