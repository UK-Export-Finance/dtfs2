const mockUsers = require('./mockUsers');
const {
  exporterOne,
  exporterTwo,
  exporterThree,
  exporterFour,
} = require('./mockExporter');

// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find((user) =>
  user.roles.includes('maker') && user.roles.length === 1);

const MOCK_DEAL_ONE = {
  bankId: MAKER_LOGIN.bank.id,
  bankInternalRefName: 'Mock1',
  userId: MAKER_LOGIN._id,
  exporter: exporterOne,
};

const MOCK_DEAL_TWO = {
  bankId: MAKER_LOGIN.bank.id,
  bankInternalRefName: 'Mock2',
  userId: MAKER_LOGIN._id,
  exporter: exporterTwo,
};

const MOCK_DEAL_THREE = {
  bankId: MAKER_LOGIN.bank.id,
  bankInternalRefName: 'Mock3',
  userId: MAKER_LOGIN._id,
  exporter: exporterThree,
};

const MOCK_DEAL_FOUR = {
  bankId: MAKER_LOGIN.bank.id,
  bankInternalRefName: 'Mock4',
  userId: MAKER_LOGIN._id,
  exporter: exporterFour,
};

module.exports = {
  MOCK_DEAL_ONE, MOCK_DEAL_TWO, MOCK_DEAL_THREE, MOCK_DEAL_FOUR,
};
