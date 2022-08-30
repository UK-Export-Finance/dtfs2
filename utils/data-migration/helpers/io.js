/**
 * I/O helper functions
 */

/**
 * Sleep helper function
 * @param {Integer} ms Milliseconds (1000ms = 1s)
 * @returns Sleeps for `ms` provided
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  sleep,
};
