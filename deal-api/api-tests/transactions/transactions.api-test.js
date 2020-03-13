const request = require('supertest');

const wipeDB = require('../wipeDB');
const aTransaction = require('./transaction-builder');

const app = require('../../src/createApp');

describe('a transaction', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added transaction is returned when we list all transactions', async () => {
    const newTransaction = aTransaction({bankFacilityId: "1a2b3c"})

    await request(app)
       .post('/api/transactions')
       .send( newTransaction )
       .expect(200)

    return request(app)
      .get('/api/transactions')
      .expect(200)
      .then(response => {
        //TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.text).toMatch('\"bankFacilityId\":\"1a2b3c\"')
      })

  });

});
