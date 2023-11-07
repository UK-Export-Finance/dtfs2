const dotenv = require('dotenv');

dotenv.config();

const { PORTAL_UI_URL } = process.env;

module.exports = {
  PORTAL_UI_URL,
};
