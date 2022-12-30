/**
 * Returns facility issued status
 * @param {Integer} stage Workflow facility stage
 * @returns {Boolean} Facility issued status
 */
const issued = (stage) => {
  switch (stage) {
    case 2:
      return false;
    case 3:
      return true;
    default:
      return false;
  }
};

module.exports = {
  issued,
};
