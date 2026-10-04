const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const { PORTAL_UI_URL } = process.env;

module.exports = {
  PORTAL_UI_URL,
};
