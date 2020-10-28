
const db = require('./src/drivers/db-client');

jest.mock('./src/v1/controllers/log-controller');

afterAll(async () => {
  await db.close();
});
