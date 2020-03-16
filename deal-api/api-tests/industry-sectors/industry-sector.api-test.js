const request = require('supertest');

const wipeDB = require('../wipeDB');
const anIndustrySector = require('./industry-sector-builder');

const app = require('../../src/createApp');

describe('an industry sector', () => {
  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added industry sector is returned when we list all industry sectors', async () => {
    const newIndustrySector = anIndustrySector({ code: '1066' });

    await request(app)
       .post('/api/industry-sectors')
       .send(newIndustrySector)
       .expect(200);

    return request(app)
      .get('/api/industry-sectors')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        // TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.body[0]).toMatchObject(newIndustrySector);
      });
  });

  it('an industry sector can be updated', async () => {
    const newSector = anIndustrySector({ code: '1066' });
    const updatedSector = anIndustrySector({
      code: '1066',
      name: 'Updated sector name',
    });

    await request(app)
      .post('/api/industry-sectors')
      .send(newSector);

    await request(app)
      .put('/api/industry-sectors/1066')
      .send(updatedSector);

    return request(app)
      .get('/api/industry-sectors/1066')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject(updatedSector);
      });
  });

  it('an industry section can be deleted', async () => {
    const newSector = anIndustrySector({ code: '1066' });

    await request(app)
      .post('/api/industry-sectors')
      .send(newSector);

    await request(app)
      .delete('/api/industry-sectors/1066')
      .send();

    return request(app)
      .get('/api/industry-sectors/1066')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body.code).toBeUndefined();
      });
  });
});
