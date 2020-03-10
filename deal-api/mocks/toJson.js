const mocks = require('./index');

// const mocksAsJson = JSON.stringify(mocks, null, 2);
const aContract = JSON.stringify(mocks.CONTRACTS[0], null, 2);

console.log(aContract);
