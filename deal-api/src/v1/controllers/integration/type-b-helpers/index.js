const generateStatus = require('./generate-status');
const updateComments = require('./update-comments');
const { updateBonds, updateLoans } = require('./update-facilities');

module.exports = {
  generateStatus,
  updateComments,
  updateBonds,
  updateLoans,
};
