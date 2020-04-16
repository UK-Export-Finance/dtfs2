const app = require('../../../src/createApp');
const {
  get,
} = require('../../api')(app);

const getToken = require('../../getToken')(app);

let user1;


describe('GET /v1/fileshare/url', () => {
  beforeEach(async () => {
    user1 = await getToken({
      username: '3',
      password: '4',
      roles: ['maker'],
      bank: {
        id: '1',
        name: 'Mammon',
      },
    });
  });

  it('sends the URL for fileshare', async () => {
    const { status, body } = await get('/v1/fileshare/url', user1);

    expect(status).toEqual(200);
    expect(body.FILESHARE_URL).toEqual('mockurl/share/');
  });
});
