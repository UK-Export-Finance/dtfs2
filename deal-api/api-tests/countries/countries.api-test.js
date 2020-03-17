const request = require('supertest');

const wipeDB = require('../wipeDB');
const aCountry = require('./country-builder');

const app = require('../../src/createApp');

describe('a country', () => {
  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added country is returned when we list all countries', async () => {
    const newCountry = aCountry({ code: 'DUB' });

    await request(app)
       .post('/api/countries')
       .send(newCountry)
       .expect(200);

    return request(app)
      .get('/api/countries')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        // TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.body[0]).toMatchObject(newCountry);
      });
  });

  it('a country can be updated', async () => {
    const newCountry = aCountry({ code: 'DUB' });
    const updatedCountry = aCountry({
      code: 'DUB',
      name: 'Updated country name',
    });

    await request(app)
      .post('/api/countries')
      .send(newCountry);

    await request(app)
      .put('/api/countries/DUB')
      .send(updatedCountry);

    return request(app)
      .get('/api/countries/DUB')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject(updatedCountry);
      });
  });

  it('a country can be deleted', async () => {
    const newCountry = aCountry({ code: 'DUB' });

    await request(app)
      .post('/api/countries')
      .send(newCountry);

    await request(app)
      .delete('/api/countries/DUB')
      .send();

    return request(app)
      .get('/api/countries/DUB')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body.code).toBeUndefined();
      });
  });
});
