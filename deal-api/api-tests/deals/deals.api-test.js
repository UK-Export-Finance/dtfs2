const request = require('supertest');

const wipeDB = require('../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../src/createApp');

describe('a deal', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added deal is returned when we list all deals', async () => {
    const newDeal = aDeal({id: '1994'});

    await request(app)
      .post('/api/deals')
      .set('Accept', 'application/json')
      .send(newDeal)
      .expect(200);

    return request(app)
      .get('/api/deals')
      .expect(200)
      .then(response => {
          expect(response.body[0]).toMatchObject(newDeal);
      });
  });

  it('a newly added deal can be looked up by id', async () => {
    const newDeal = aDeal({ id: '1995' });

    await request(app)
      .post('/api/deals')
      .send(newDeal)
      .expect(200);
    // .expect('some indicator of a new record being created??')

    return request(app)
      .get('/api/deals/1995')
      .set('Accept', 'application/json')
      .expect(200)
      .then(response => {
        expect(response.body).toMatchObject(newDeal);
      });
  });

  it('a deal can be updated', async () => {
    const newDeal = aDeal({ id: '1996', supplyContractName: 'Original Value' });
    const updatedDeal = aDeal({
      id: '1996',
      supplyContractName: 'Updated Value'
    });

    await request(app)
      .post('/api/deals')
      .send( newDeal );

    await request(app)
      .put('/api/deals/1996')
      .send( updatedDeal );

    return request(app)
      .get('/api/deals/1996')
      .set('Accept', 'application/json')
      .expect(200)
      .then(response => {
        expect(response.body).toMatchObject(updatedDeal);
      });
  });

  it('a deal can be deleted', async () => {
    const newDeal = aDeal({ id: '1996'});

    await request(app)
      .post('/api/deals')
      .send(newDeal);

    await request(app)
      .delete('/api/deals/1996')
      .send();
  
    return request(app)
      .get('/api/deals/1996')
      .set('Accept', 'application/json')
      .expect(200)
      .then(response => {
        expect(response.body).toMatchObject({});
      });
  });
});
