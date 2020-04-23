jest.unmock('@azure/storage-file-share');

const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');
const fileshare = require('../../../src/drivers/fileshare');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);

const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

const getToken = require('../../getToken')(app);

describe('/v1/deals/:id/integration/', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
      status: 'Draft',
      dateOfLastAction: '1985/11/04 21:00:00:000',
    },
    comments: [{
      username: 'bananaman',
      timestamp: '1984/12/25 00:00:00:001',
      text: 'Merry Christmas from the 80s',
    }, {
      username: 'supergran',
      timestamp: '1982/12/25 00:00:00:001',
      text: 'Also Merry Christmas from the 80s',
    }],
  });

  let aUserWithoutRoles;
  let maker1;
  let maker2;
  let checker;

  beforeEach(async () => {
    await wipeDB.wipe(['deals', 'users']);

    aUserWithoutRoles = await getToken({
      username: '1',
      password: '2',
      roles: [],
    });

    maker1 = await getToken({
      username: 'maker1username',
      password: '4',
      roles: ['maker'],
      bank: {
        id: '1',
        name: 'Bank of Never Never Land',
      },
    });

    maker2 = await getToken({
      username: '5',
      password: '6',
      roles: ['maker'],
      bank: {
        id: '2',
        name: 'Pot o Gold',
      },
    });

    superuser = await getToken({
      username: '7',
      password: '8',
      roles: ['maker', 'checker'],
      bank: {
        id: '*',
      },
    });

    checker = await getToken({
      username: '9',
      password: '10',
      roles: ['checker'],
      bank: {
        id: '2',
        name: 'Pot o Gold',
      },
    });
  });

  describe('GET /v1/deals/:id/integration/type-a', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/123456789012/integration/type-a');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=checker', async () => {
      const { status } = await get('/v1/deals/123456789012/integration/type-a', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=checker', async () => {
      const postResult = await post(newDeal, maker2).to('/v1/deals');
      const newId = postResult.body._id;

      const someData = '<xml><Deal/>';

      await fileshare.uploadStream({
        folder: 'ukef',
        subfolder: 'type-a',
        filename: `${newId}.xml`,
        buffer: Buffer.from(someData, 'utf-8'),
      });

      const { status } = await get(`/v1/deals/${newId}/integration/type-a`, checker);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await post(newDeal, maker1).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/integration/type-a`, checker);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await get('/v1/deals/123456789012/integration/type-a', checker);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, maker2).to('/v1/deals');
      const newId = postResult.body._id;

      const someData = '<xml><Deal/>';

      await fileshare.uploadStream({
        folder: 'ukef',
        subfolder: 'type-a',
        filename: `${newId}.xml`,
        buffer: Buffer.from(someData, 'utf-8'),
      });

      const { status } = await get(`/v1/deals/${newId}/integration/type-a`, superuser);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await post(newDeal, maker2).to('/v1/deals');
      const newId = postResult.body._id;

      const someData = '<xml><Deal/>';

      await fileshare.uploadStream({
        folder: 'ukef',
        subfolder: 'type-a',
        filename: `${newId}.xml`,
        buffer: Buffer.from(someData, 'utf-8'),
      });

      const { status, text } = await get(`/v1/deals/${newId}/integration/type-a`, checker);

      expect(status).toEqual(200);
      expect(text).toEqual(someData);
    });
  });
});
