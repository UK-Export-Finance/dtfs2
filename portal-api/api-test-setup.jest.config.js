
const db = require('./src/drivers/db-client');

const mockFiles = [
  './src/v1/controllers/log-controller',
  './src/scheduler',
  './src/reference-data/api',
];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

console.log(`MOCKED FILES: \n${mockFiles.join('\n')}`);

afterAll(async () => {
  await db.close();
});
