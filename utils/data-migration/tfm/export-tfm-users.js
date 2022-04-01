const fs = require('fs');
const generator = require('generate-password');
const { Parser, transforms: { unwind } } = require('json2csv');
const TFM_USERS = require('./tfm-users');

// iterate over users array and override the password property
TFM_USERS.forEach((u) => {
  const user = u;
  const password = generator.generate({
    length: 20,
    numbers: true,
    symbols: false,
    lowercase: true,
    uppercase: true,
  });
  user.password = `AbC!2_${password}`;
  user.email = user.email.toLowerCase();
  user.username = user.username.toLowerCase();
});

// write json object to json file
fs.writeFile('./tfm/users_with_passwords.json', JSON.stringify(TFM_USERS, null, 2), (err) => {
  if (err) throw err;
  console.info('The JSON file has been saved!');
});

const fields = ['firstName', 'lastName', 'email', 'password', 'teams'];
const transforms = [unwind({ paths: ['teams'] })];

const json2csvParser = new Parser({ fields, transforms });
const csv = json2csvParser.parse(TFM_USERS);

fs.writeFile('./tfm/users_with_passwords.csv', csv, (err) => {
  if (err) throw err;
  console.info('The CSV file has been saved!');
});
