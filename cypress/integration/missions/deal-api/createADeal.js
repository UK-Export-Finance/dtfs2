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

module.exports = async (deal, opts) => {
  console.log(`createADeal::`);
  return new Promise( (resolve, reject) => {

    loginViaAPI(opts, (loginError, token) => {
      if (loginError) {
        reject(loginError)
      } else {

        insertDeal(deal, token, (insertError, data) => {
          if (insertError) {
            reject(insertError);
          } else {
            resolve(data);
          }

        })
      }
    });

  });
}
