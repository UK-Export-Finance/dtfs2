/**
 * I/O helper functions
 */
const fs = require('fs');
const path = require('path');
const { open, get } = require('./actionsheets');

/**
 * Sleep helper function
 * @param {Integer} ms Milliseconds (1000ms = 1s)
 * @returns Sleeps for `ms` provided
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Write a file to local storage
 * @param {String} path File path
 * @param {String} data Data to write
 * @returns {Boolean} Boolean upon file write
 */
const write = async (path, data) => {
  if (path && data) {
    fs.writeFileSync(path, data, 'utf8', (e) => (!e));
    return true;
  }
  return false;
};

/**
 * Returns JSON file name from type
 * @param {Integer} type File type
 * @returns {String} File name
 */
const getFilename = (type) => {
  switch (type) {
    case 1:
      return '1.json';
    case 2:
      return '2.json';
    case 3:
      return '3.json';
    case 4:
      return '4.json';
    case 5:
      return '5.json';
    case 6:
      return '6.json';
    case 7:
      return '7.json';
    case 8:
      return '8.json';
    case 9:
      return '9.json';
    case 10:
      return '10.json';
    case 11:
      return '11.json';
    default:
      return '1.json';
  }
};

/**
 * Reads workflow JSON data
 * @param {Integer} type Workflow file type
 * @returns {Object} Workflow data in JSON
 */
const workflow = async (type) => {
  if (!type) {
    return Promise.reject(new Error('Please specify file type'));
  }

  const path = './json';
  const file = getFilename(type);

  try {
    const uri = `${path}/${file}`;
    const data = fs.readFileSync(uri, 'utf8');

    if (data) {
      let json = JSON.parse(data);
      json = json.Workflow;

      return Promise.resolve(json);
    }

    return Promise.reject(new Error(`Empty workflow data set ${uri}`));
  } catch (e) {
    return Promise.reject(new Error(`Unable to read the workflow file ${e}`));
  }
};

/**
 * Reads Action sheet
 * @param {Array} search Search criterion
 * @returns {Array} Formatted data from action sheets
 */
const actionsheet = async (search) => {
  try {
    const path = '../tfm/actionsheets';
    const results = [];
    const files = fs.readdirSync(path);

    await files.forEach((file, index) => {
      const uri = `${path}/${file}`;
      const percentage = Math.round((index / files.length) * 100);
      console.info('\x1b[33m%s\x1b[0m', `${percentage}% : Parsing action sheet ${file}.`, '\n');

      open(uri)
        .then((data) => {
          if (data) return Promise.resolve(data);
          return Promise.reject(new Error(`🚩 Empty action sheet ${uri}`));
        })
        .then((data) => {
          let lookups = {};
          search.forEach((lookup) => {
            const propertyName = lookup[0];

            lookups = {
              ...lookups,
              [propertyName]: get(data, lookup),
            };
          });
          results.push(lookups);

          Promise.resolve(results);
        })
        .catch((e) => Promise.reject(new Error(e)));
    });

    return Promise.resolve(results);
  } catch (e) {
    return Promise.reject(new Error(`🚩 Unable to read the action sheets directory ${e}`));
  }
};

/**
 * Write data array into a CSV file
 * @param {Array} rows Array of processed deals
 * @param {Text} Filename Name of tile
 * @returns {Null} Null is returned
 */
const writeCSV = async (data, filename) => {
  let csv = '';
  const filepath = path.join(__dirname, '..', '..', 'reporting', 'tfm', 'report', 'csv', `${filename}_${new Date().valueOf()}.csv`);

  data.forEach((row) => {
    csv = csv.concat(row.join(','), '\n');
  });

  if (await write(filepath, csv)) {
    console.info('\x1b[33m%s\x1b[0m', `✅ CSV successfully written at ${filepath}.`, '\n');
    return Promise.resolve(true);
  }

  return Promise.reject();
};

module.exports = {
  sleep,
  workflow,
  actionsheet,
  writeCSV,
};
