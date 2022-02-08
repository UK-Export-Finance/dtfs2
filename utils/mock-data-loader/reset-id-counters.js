const api = require('./api');
const MOCKS = require('./mocks');

const tokenFor = require('./temporary-token-handler');

const resetIdCounters = async () => {
  const token = await tokenFor({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['maker', 'editor', 'data-admin'],
    bank: MOCKS.BANKS.find((bank) => bank.id === '956'),
  });

  console.info('resetting id counters');
  await api.resetIdCounters(token).catch((error) => {
    console.error({ error });
  });
};

resetIdCounters();
