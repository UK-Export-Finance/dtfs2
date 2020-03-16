const request = require('supertest');

const wipeDB = require('../wipeDB');
const aMandatoryCriteria = require('./mandatory-criteria-builder');

const app = require('../../src/createApp');

describe('a mandatory criteria', () => {
  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added mandatory criteria is returned when we list all mandatory criteria', async () => {
    const newMandatoryCriteria = aMandatoryCriteria({ id: '2' });

    await request(app)
       .post('/api/mandatory-criteria')
       .send(newMandatoryCriteria)
       .expect(200);

    return request(app)
      .get('/api/mandatory-criteria')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        // TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.body[0]).toMatchObject(newMandatoryCriteria);
      });
  });

  it('a mandatory criteria can be updated', async () => {
    const newMandatoryCriteria = aMandatoryCriteria({ id: '2' });
    const updatedMandatoryCriteria = aMandatoryCriteria({
      id: '2',
      title: 'Updated mandatory criteria',
    });

    await request(app)
      .post('/api/mandatory-criteria')
      .send(newMandatoryCriteria);

    await request(app)
      .put('/api/mandatory-criteria/2')
      .send(updatedMandatoryCriteria);

    return request(app)
      .get('/api/mandatory-criteria/2')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject(updatedMandatoryCriteria);
      });
  });

  it('a mandatory criteria can be deleted', async () => {
    const newMandatoryCriteria = aMandatoryCriteria({ id: '2' });

    await request(app)
      .post('/api/mandatory-criteria')
      .send(newMandatoryCriteria);

    await request(app)
      .delete('/api/mandatory-criteria/2')
      .send();

    return request(app)
      .get('/api/mandatory-criteria/2')
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBeUndefined();
      });
  });
});
