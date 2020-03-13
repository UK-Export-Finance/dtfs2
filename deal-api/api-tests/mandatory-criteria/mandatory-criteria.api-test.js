const request = require('supertest');

const wipeDB = require('../wipeDB');
const aMandatoryCriteria = require('./mandatory-criteria-builder');

const app = require('../../src/createApp');

describe('a mandatory criteria', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added mandatory criteria is returned when we list all mandatory criteria', async () => {
    const newMandatoryCriteria = aMandatoryCriteria({code: "1066"})

    await request(app)
       .post('/api/mandatory-criteria')
       .send( newMandatoryCriteria )
       .expect(200)

    return request(app)
      .get('/api/mandatory-criteria')
      .expect(200)
      .then(response => {
        //TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.text).toMatch('\"code\":\"1066\"')
      })

  });

});
