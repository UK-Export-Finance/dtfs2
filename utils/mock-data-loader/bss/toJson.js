const mocks = require('./index');

const deal = JSON.stringify(mocks.DEALS.dealsNotToSubmit[0], null, 2);

console.info(deal);
