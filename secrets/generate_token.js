// Code to generate a random access token

const crypto = require('crypto');
const fs = require('fs');

// 256 bits of randomness
const buf = crypto.randomBytes(256 / 8);

// Convert to base-64
token = buf.toString('hex')

// Write the token file
fs.writeFileSync('token.txt', token);
