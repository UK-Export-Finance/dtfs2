const request = require('supertest');

const wipeDB = require('../wipeDB');
const aCountry = require('./country-builder');

const app = require('../../src/createApp');

describe('a country', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added country is returned when we list all countries', async () => {
    const newCountry = aCountry({code: "DUB"})

    await request(app)
       .post('/api/countries')
       .send( newCountry )
       .expect(200)

    return request(app)
      .get('/api/countries')
      .expect(200)
      .then(response => {
        //TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.text).toMatch('\"code\":\"DUB\"')
      })

  });

});
