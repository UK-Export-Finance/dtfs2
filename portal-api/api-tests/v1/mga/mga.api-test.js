const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const aBank = require('../banks/bank-builder');
const wipeDB = require('../../wipeDB');

describe('/v1/mga', () => {
  let noBank;
  let anEditor;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aNoMGABankUser;
  let barclaysBank;
  let hsbcBank;
  let noMGABank;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);

    noBank = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aNoMGABankUser = testUsers().withRole('maker').withBankName('UKEF test bank (Delegated)').one();
    aSuperuser = testUsers().superuser().one();

    barclaysBank = aBank({ id: aBarclaysMaker.bank.id, mga: ['mga_doc_1.docx', 'mga_doc_1b.docx'] });
    hsbcBank = aBank({ id: anHSBCMaker.bank.id, mga: ['mga_doc_2.docx'] });
    noMGABank = aBank({ id: aNoMGABankUser.bank.id });

    await wipeDB.wipe(['banks']);
    const banks = [barclaysBank, hsbcBank, noMGABank];

    await as(anEditor).postEach(banks).to('/v1/banks');
  });

  afterAll(async () => {
    await wipeDB.wipe(['banks']);
  });


  describe('GET /v1/mga', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/mga');
      expect(status).toEqual(401);
    });

    it('returns an empty list of docs for a user without a bank', async () => {
      const { status, body } = await as(noBank).get('/v1/mga');
      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });

    it('returns an empty list of docs for a superuser', async () => {
      const { status, body } = await as(aSuperuser).get('/v1/mga');
      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });

    it('returns an empty list for users of bank with no MGA docs', async () => {
      const { status, body } = await as(aNoMGABankUser).get('/v1/mga');
      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });

    it('returns list of MGA docs for specific bank', async () => {
      const barclaysReq = await as(aBarclaysMaker).get('/v1/mga');
      expect(barclaysReq.status).toEqual(200);
      expect(barclaysReq.body).toEqual(barclaysBank.mga);

      const hsbcReq = await as(anHSBCMaker).get('/v1/mga');
      expect(hsbcReq.status).toEqual(200);
      expect(hsbcReq.body).toEqual(hsbcBank.mga);
    });
  });

  describe('GET /v1/mga/filename', () => {
    it('returns the requested file', async () => {
      const filename = barclaysBank.mga[0];
      const { header, text } = await as(aBarclaysMaker).get(`/v1/mga/${filename}`);

      expect(header['content-disposition']).toEqual(`attachment; filename=${filename}`);
      expect(text).toEqual('mockFile');
    });

    it('returns 404 for non existant file', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/mga/not-found.txt');
      expect(status).toEqual(404);
    });
  });
});
