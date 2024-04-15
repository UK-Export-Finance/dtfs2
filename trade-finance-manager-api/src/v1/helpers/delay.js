/**
 * Returns a promise that resolves after a specified delay.
 * @param {number} ms - The number of milliseconds to delay.
 * Defaults to 1000ms (1 second).
 * @returns {Promise} - A promise that resolves after the specified delay.
 */
const delay = (ms = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

module.exports = {
  delay,
};
