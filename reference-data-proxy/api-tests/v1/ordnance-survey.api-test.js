const app = require('../../src/createApp');

const { get } = require('../api')(app);

describe('/ordnance-survey', () => {
  describe('GET /ordnance-survey', () => {
    it('returns a list of addresses', async () => {
      const { status, body } = await get('/ordnance-survey/WR90DJ');

      expect(status).toEqual(200);
      expect(body.results).toBeDefined();
    });

    it('returns 404 when a postcode doesn\'t exist', async () => {
      const { status } = await get('/industry-sectors/WR90DJ1');

      expect(status).toEqual(404);
    });
  });
});
