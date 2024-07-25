const fs = require('fs');
const generator = require('generate-password');
const {
  Parser,
  transforms: { unwind },
} = require('json2csv');
const { USERS } = require('../../mock-data-loader/tfm-mocks');

const TFM_USERS = Object.values(USERS);

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
fs.writeFile('./tfm/users_with_passwords.json', JSON.stringify(TFM_USERS, null, 2), (error) => {
  if (error) throw error;
  console.info('The JSON file has been saved!');
});

const fields = ['firstName', 'lastName', 'email', 'password', 'teams'];
const transforms = [unwind({ paths: ['teams'] })];

const json2csvParser = new Parser({ fields, transforms });
const csv = json2csvParser.parse(TFM_USERS);

fs.writeFile('./tfm/users_with_passwords.csv', csv, (error) => {
  if (error) throw error;
  console.info('The CSV file has been saved!');
});
