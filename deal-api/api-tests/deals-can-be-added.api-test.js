const request = require('supertest');

const app = require('../src/createApp');
const wipeDB = require('./wipeDB');

describe('a new deal', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added deal can be looked up', async () => {
    const newDeal = {
      "supplyContractName": "AAAA",
      "id": "1994",
      "details": {
        "bankSupplyContractID": "BBBB",
      }
    }

//TODO [dw] we should probably be trading in application/json rather than raw utf8 strings
//  would make the tests read much more nicely, and would probably be easier to interact with from portal..
//  some tidying and extra assertions will make sense, and we'll be able to do better than ugly string-matching to prove a good result
    await request(app)
       .post('/api/deals')
       .send( newDeal )
       .set('Accept', 'application/json')
       //? .expect('Content-Type','text/html; charset=utf-8')
       //? .expect('Content-Type', /json/)
       .expect(200)
       // .expect('some indicator of a new record being created??')

    return request(app)
      .get('/api/deals')
      //? .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.text).toMatch('\"id\":\"1994\"')
      })

  });
});
