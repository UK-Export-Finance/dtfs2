const db = require('./src/drivers/db-client').default;

afterAll(async () => {
  await db.close();
});
