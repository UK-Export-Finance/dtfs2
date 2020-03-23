//https://medium.com/swlh/everything-you-need-to-know-about-the-passport-jwt-passport-js-strategy-8b69f39014b0

// openssl genrsa -out private.pem 2048
// openssl rsa -in private.pem -outform PEM -pubout -out public.pem

const jwt = require('jsonwebtoken');
const fs = require('fs');

const PUB_KEY = fs.readFileSync(__dirname + '/public.pem', 'utf8');
const PRIV_KEY = fs.readFileSync(__dirname + '/private.pem', 'utf8');

// ============================================================
// -------------------  SIGN ----------------------------------
// ============================================================

const payloadObj = {
    sub: '1234567890',
    name: 'John Doe',
    admin: true,
    iat: 1516239022
};

const signedJWT = jwt.sign(payloadObj, PRIV_KEY, { algorithm: 'RS256'});

console.log(signedJWT);


// ============================================================
// -------------------  VERIFY --------------------------------
// ============================================================

jwt.verify(signedJWT, PUB_KEY, { algorithms: ['RS256'] }, (err, payload) => {

  if (err) {
    if (err.name === 'TokenExpiredError') {
        console.log('Whoops, your token has expired!');
    }

    if (err.name === 'JsonWebTokenError') {
        console.log('That JWT is malformed!');
    }
  } else {
    if (err === null) {
        console.log('Your JWT was successfully validated!');
    }

    // Both should be the same
    console.log(payload);
    console.log(payloadObj);
  }
});
