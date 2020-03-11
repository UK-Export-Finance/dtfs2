const request = require('supertest');
const app = require('../src/createApp');

jest.setTimeout(10000);

describe('a new deal', () => {

  beforeEach( () => {
    // wipe database
  });

  it('a newly added deal can be looked up', (done) => {
    const newDeal = {
      "supplyContractName": "AAAA",
      "id": "1994",
      "details": {
        "bankSupplyContractID": "BBBB",
        "ukefDealId": "CCCC",
        "status": "DDDDD",
        "previousStatus": "EEEE",
        "maker": "FFFF",
        "checker": "GGGG",
        "submissionDate": "HHHH",
        "dateOfLastAction": "IIII",
        "submissionType": "JJJJ"
      }
    }

    request(app)
       .put('/api/deals')
       .send( newDeal )
       .set('Accept', 'application/json')
       .expect('Content-Type','text/html; charset=utf-8')
       //? .expect('Content-Type', /json/)
       .expect(200)
       .end((err, res) => {
         if (err) {
           done(err);
         }
         // expect(res.text).to.be.equal('hey');
         console.log(res);
         console.log('~~~~~~~~~~~~~~~~~~~~~~~')
         console.log(res.body);
         console.log('~~~~~~~~~~~~~~~~~~~~~~~')
         console.log(res.text);
         done();
       });

       //
       // .then(response => {
       //     // expect(response.body).toContain(newDeal)
       //     console.log(response);
       //     console.log('~~~~~~~~~~~~~~~~~~~~~~~')
       //     console.log(response.body);
       //     done();
       // })
    //
    // request(app)
    //   .get('/api/deals')
    //   .expect('Content-Type', /json/)
    //   .expect(200)
    //   .then(response => {
    //       // expect(response.body).toContain(newDeal)
    //       console.log(response);
    //       console.log('~~~~~~~~~~~~~~~~~~~~~~~')
    //       console.log(response.body);
    //       done();
    //   })

  });
});
