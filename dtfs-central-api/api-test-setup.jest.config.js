const db = require('./src/drivers/db-client');

afterAll(async () => {
  await db.close();
});
