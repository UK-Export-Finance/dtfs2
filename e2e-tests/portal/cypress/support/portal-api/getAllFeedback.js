const { getAllFeedback, logIn } = require('./api');

/**
 * gets deal from database from dealId
 * @param {String} dealId
 * @param {Object} opts - login details such as username, password, email
 */
module.exports = (opts) => {
  console.info('getting all feedback::');

  logIn(opts).then((token) => {
    getAllFeedback(token).then((feedback) => feedback);
  });
};
