const api = require('./api');
const MOCKS = require('./mocks');

for (contract of MOCKS.CONTRACTS) {
  api.createDeal(contract);
}

for (bank of MOCKS.BANKS) {
  api.createBank(bank);
}
