const http = require('http')
const axios =require('axios');
const api = require('./api');

const loginViaAPI = require('./loginViaAPI');

const insertDeal = (deal, token, callback) => {
  const json = JSON.stringify(deal);

  const options = {
    hostname: api().host,
    port: api().port,
    path: `/v1/deals`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    }
  };

  const req = http.request(options, res => {
    res.on('data', data => {
      callback();
    })
  });

  req.on('error', error => {
    callback(error);
  });

  req.write(json);
  req.end();
};

const insertDeals = (deals, token, callback) => {
  const inserted = [];

  for (const dealToInsert of deals) {
    insertDeal(dealToInsert, token, () => {

      inserted.push(dealToInsert);
      console.log(`inserted ${inserted.length} of ${deals.length}`)

      if (inserted.length  === deals.length) {
        callback();
      }

    })
  };
}

module.exports = async (deals, opts) => {
  console.log(`createManyDeals::`);
  return new Promise( (resolve, reject) => {

    loginViaAPI(opts, (err, token) => {
      if (err) {
        reject(err)
      } else {

        insertDeals(deals, token, () => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }

        })
      }
    });

  });
}
