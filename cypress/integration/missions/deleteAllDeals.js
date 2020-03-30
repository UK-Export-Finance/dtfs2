const http = require('http')
const axios =require('axios');
const api = require('../api');

const loginViaAPI = (opts, callback) => {
  const { username, password } = opts;

  const data = JSON.stringify({username,password});

  const options = {
    hostname: api().host,
    port: api().port,
    path: '/v1/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', data => {
      const json = JSON.parse(data);
      callback(null, json.token);
    })
  });

  req.on('error', error => {
    callback(error);
  });

  req.write(data);
  req.end();
}

const currentDeals = (token, callback) => {
console.log(`currentDeals :: token=${token}`)
  const options = {
    hostname: api().host,
    port: api().port,
    path: '/v1/deals',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    }
  }

  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', data => {
      console.log(`currentDeals::data::${data}`)
      const json = JSON.parse(data);
      callback(null, json.deals.map( deal => deal._id));
    });
    res.on('error', err => {
      callback(error);
    })
  })

  req.end();
};

const deleteDeal = (id, token, callback) => {
console.log(`deleteDeal :: id==${id}`)
  const options = {
    hostname: api().host,
    port: api().port,
    path: `/v1/deals/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    }
  };

  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', data => {
      callback();
    })
  });

  req.on('error', error => {
    callback(error);
  });

  req.end();
};

const deleteDeals = (deals, token, callback) => {

  const deleted = [];
  for (const dealToDelete of deals) {
    deleteDeal(dealToDelete, token, () => {
      deleted.push(dealToDelete);
      if (deleted.length  === deals.length) {
        callback();
      }
    })
  };
}

module.exports = async (opts) => {
  return new Promise( (resolve, reject) => {

    loginViaAPI(opts, (err, token) => {

      if (err) {
        reject(err)
      } else {
        currentDeals(token, (err, deals) => {
          if (err) {
            reject(err);
          } else {

            if (deals.length >0) {
              deleteDeals(deals, token, (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              })
            } else {
              resolve();
            }

          }
        });
      }
    });

  });
}
