const request = require('supertest');

const wipeDB = require('../wipeDB');
const aBondCurrency = require('./bond-currency-builder');

const app = require('../../src/createApp');

describe('a bond currency', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added bond currency is returned when we list all bond currencies', async () => {
    const newBondCurrency = aBondCurrency({id: "USD"})

    await request(app)
       .post('/api/bond-currencies')
       .send( newBondCurrency )
       .expect(200)

    return request(app)
      .get('/api/bond-currencies')
      .expect(200)
      .then(response => {
        //TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.text).toMatch('\"id\":\"USD\"')
      })

  });

});
