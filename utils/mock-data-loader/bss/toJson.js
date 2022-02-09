const mocks = require('./index');

const deal = JSON.stringify(mocks.DEALS[0], null, 2);

console.info(deal);
