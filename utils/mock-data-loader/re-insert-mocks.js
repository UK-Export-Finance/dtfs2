const api = require('./api');
const MOCKS = require('./mocks');

const MOCK_CONTRACTS = MOCKS.CONTRACTS;

for (contract of MOCK_CONTRACTS) {
  api.createDeal(contract);
}
