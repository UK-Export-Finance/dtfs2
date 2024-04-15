/**
 * Returns a promise that resolves after a specified delay in milliseconds.
 * @param {number} ms - The delay in milliseconds. Default value is 1000.
 * @returns {Promise} - A promise that resolves after the specified delay.
 */
const delay = (ms = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

module.exports = delay;
