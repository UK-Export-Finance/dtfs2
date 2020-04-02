const http = require('http')
const axios =require('axios');
const api = require('./api');

const loginViaAPI = require('./loginViaAPI');

const insertDeal = (deal, token, callback) => {
  const json = JSON.stringify(deal);

  console.log(`insertDeal json: \n\n ${json}`)

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
    res.setEncoding('utf8');
    res.on('data', function (data) {
      callback(null, JSON.parse(data));
    });
  });

  req.on('error', error => {
    callback(error);
  });

  req.write(json);
  req.end();
};


const insertDeals = (deals, token, callback) => {
  const persisted = [];
  for (const dealToInsert of deals) {

    insertDeal(dealToInsert, token, (err, persistedDeal) => {
      persisted.push(persistedDeal);

      if (persisted.length  === deals.length) {
        callback(persisted);
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

        insertDeals(deals, token, (persistedDeals) => {
          if (err) {
            reject(err);
          } else {
            resolve(persistedDeals);
          }

        })
      }
    });

  });
}
