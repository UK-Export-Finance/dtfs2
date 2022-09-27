/**
 * I/O helper functions
 */
const fs = require('fs');

/**
 * Sleep helper function
 * @param {Integer} ms Milliseconds (1000ms = 1s)
 * @returns Sleeps for `ms` provided
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    default:
      return '1.json';
  }
};

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

module.exports = {
  sleep,
  workflow,
};
