jest.unmock('../../../src/v1/controllers/log-controller');
const logController = require('../../../src/v1/controllers/log-controller');

describe('/v1/log', () => {
  afterAll(async () => {
    await logController.clearErrorLogs();
  });

  it('should update & clear the error log', async () => {
    const logMsg = {
      dealId: 1,
      error: 'Test log message 1',
    };

    const log = await logController.logError(logMsg);
    expect(log.ops[0]).toMatchObject(logMsg);

    const { result } = await logController.clearErrorLogs();
    expect(result.n).toEqual(1);
  });
});
