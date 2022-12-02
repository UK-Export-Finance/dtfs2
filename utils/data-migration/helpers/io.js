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

module.exports = {
  sleep,
  write,
};
