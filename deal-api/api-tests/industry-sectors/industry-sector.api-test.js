const request = require('supertest');

const wipeDB = require('../wipeDB');
const anIndustrySector = require('./industry-sector-builder');

const app = require('../../src/createApp');

describe('an industry sector', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added industry sector is returned when we list all industry sectors', async () => {
    const newIndustrySector = anIndustrySector({code: "1066"})

    await request(app)
       .post('/api/industry-sectors')
       .send( newIndustrySector )
       .expect(200)

    return request(app)
      .get('/api/industry-sectors')
      .expect(200)
      .then(response => {
        //TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.text).toMatch('\"code\":\"1066\"')
      })

  });

});
