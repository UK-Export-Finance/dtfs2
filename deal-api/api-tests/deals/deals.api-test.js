const request = require('supertest');

const wipeDB = require('../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../src/createApp');

describe('a deal', () => {

  beforeEach( async() => {
    await wipeDB();
  });

  it('a newly added deal is returned when we list all deals', async () => {
    const newDeal = aDeal({id: "1994"})

    await request(app)
       .post('/api/deals')
       .send( newDeal )
       .expect(200)

    return request(app)
      .get('/api/deals')
      .expect(200)
      .then(response => {
        //TODO rough match; we're getting a string, we just check it contains an id that matches what we inserted
        // would be nice to move to ContentType=application/json and we could do nicer "check the first result in the list == our deal"
        expect(response.text).toMatch('\"id\":\"1994\"')
      })

  });

  it('a newly added deal can be looked up by id', async () => {
    const newDeal = aDeal({id: "1995"})

    await request(app)
       .post('/api/deals')
       .send( newDeal )
       .expect(200)
       // .expect('some indicator of a new record being created??')

    return request(app)
      .get('/api/deals/1995')
      .expect(200)
      .then(response => {
        expect(response.text).toMatch('\"id\":\"1995\"')
//TODO        expect(response.body.id).toEqual(newDeal.id)
      })

  });

  it('a deal can be updated', async () => {
    const newDeal = aDeal({id: "1996", supplyContractName: 'Original Value'});
    const updatedDeal = aDeal({id: "1996", supplyContractName: 'Updated Value'});

    await request(app)
       .post('/api/deals')
       .send( newDeal );

    await request(app)
       .post('/api/deal/1996')
       .send( updatedDeal );

    return request(app)
      .get('/api/deals/1996')
      .expect(200)
      .then(response => {
        expect(response.text).toMatch('\"supplyContractName\":\"Updated Value\"')
//TODO        expect(response.body.supplyContractName).toEqual(updatedDeal.supplyContractName)
      });

  });
});
