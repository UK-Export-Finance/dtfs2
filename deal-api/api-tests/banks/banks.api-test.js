const request = require('supertest');

const wipeDB = require('../wipeDB');
const aBank = require('./bank-builder');

const app = require('../../src/createApp');

describe('a bank', () => {
  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added bank is returned when we list all banks', async () => {
    const newBank = aBank({ id: '112233' });

    await request(app)
       .post('/api/banks')
       .set('Accept', 'application/json')
       .send(newBank)
       .expect(200);

    return request(app)
      .get('/api/banks')
      .expect(200)
      .then((response) => {
        expect(response.body[0]).toMatchObject(newBank);
      });
  });

  it('a bank can be updated', async () => {
    const newBank = aBank({ id: '112233' });
    const updatedBank = aBank({
      id: '112233',
      bankName: 'Updated bank name',
    });

    await request(app)
      .post('/api/banks')
      .send(newBank);

    await request(app)
      .put('/api/banks/112233')
      .send(updatedBank);

    return request(app)
      .get('/api/banks/112233')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject(updatedBank);
      });
  });

  it('a bank can be deleted', async () => {
    const newBank = aBank({ id: '112233' });

    await request(app)
      .post('/api/banks')
      .send(newBank);

    await request(app)
      .delete('/api/banks/112233')
      .send();

    return request(app)
      .get('/api/banks/112233')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBeUndefined();
      });
  });
});

