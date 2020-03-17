const request = require('supertest');

const wipeDB = require('../wipeDB');
const aTransaction = require('./transaction-builder');

const app = require('../../src/createApp');

describe('a transaction', () => {
  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added transaction is returned when we list all transactions', async () => {
    const newTransaction = aTransaction({ bankFacilityId: '1a2b3c' });

    await request(app)
       .post('/api/transactions')
       .send(newTransaction)
       .expect(200);

    return request(app)
      .get('/api/transactions')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body[0]).toMatchObject(newTransaction);
      });
  });

  it('a transaction can be updated', async () => {
    const newTransaction = aTransaction({ bankFacilityId: '1a2b3c' });
    const updatedTransaction = aTransaction({
      bankFacilityId: '1a2b3c',
      stage: 'Updated transaction stage',
    });

    await request(app)
      .post('/api/transactions')
      .send(newTransaction);

    await request(app)
      .put('/api/transactions/1a2b3c')
      .send(updatedTransaction);

    return request(app)
      .get('/api/transactions/1a2b3c')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject(updatedTransaction);
      });
  });

  it('a transaction can be deleted', async () => {
    const newTransaction = aTransaction({ bankFacilityId: '1a2b3c' });

    await request(app)
      .post('/api/transactions')
      .send(newTransaction);

    await request(app)
      .delete('/api/transactions/1a2b3c')
      .send();

    return request(app)
      .get('/api/transactions/1a2b3c')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body.bankFacilityId).toBeUndefined();
      });
  });
});
