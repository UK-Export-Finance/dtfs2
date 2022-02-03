const MOCK_USERS = require('./users');
const {
  exporterOne,
  exporterTwo,
  exporterThree,
  exporterFour,
} = require('./mockExporter');

const { BANK1_MAKER1 } = MOCK_USERS;

const MOCK_DEAL_ONE = {
  bank: { id: BANK1_MAKER1.bank.id },
  bankInternalRefName: 'Mock1',
  userId: BANK1_MAKER1._id,
  exporter: exporterOne,
};

const MOCK_DEAL_TWO = {
  bank: { id: BANK1_MAKER1.bank.id },
  bankInternalRefName: 'Mock2',
  userId: BANK1_MAKER1._id,
  exporter: exporterTwo,
};

const MOCK_DEAL_THREE = {
  bank: { id: BANK1_MAKER1.bank.id },
  bankInternalRefName: 'Mock3',
  userId: BANK1_MAKER1._id,
  exporter: exporterThree,
};

const MOCK_DEAL_FOUR = {
  bank: { id: BANK1_MAKER1.bank.id },
  bankInternalRefName: 'Mock4',
  userId: BANK1_MAKER1._id,
  exporter: exporterFour,
};

module.exports = {
  MOCK_DEAL_ONE, MOCK_DEAL_TWO, MOCK_DEAL_THREE, MOCK_DEAL_FOUR,
};
