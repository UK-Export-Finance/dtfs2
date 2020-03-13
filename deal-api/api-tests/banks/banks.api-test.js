const request = require('supertest');

const wipeDB = require('../wipeDB');
const aBank = require('./bank-builder');

const app = require('../../src/createApp');

describe('a bank', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added bank is returned when we list all banks', async () => {
    const newBank = aBank({id: "112233"})

    await request(app)
       .post('/api/banks')
       .send( newBank )
       .expect(200)

    return request(app)
      .get('/api/banks')
      .expect(200)
      .then(response => {
        //TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.text).toMatch('\"id\":\"112233\"')
      })

  });

});
