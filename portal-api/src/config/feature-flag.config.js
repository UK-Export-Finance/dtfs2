const dotenv = require('dotenv');

dotenv.config();
const FEATURE_FLAGS = {
  MAGIC_LINK: process.env.DTFS_FF_MAGIC_LINK === 'true' ? true : false,
};

module.exports = {
  FEATURE_FLAGS,
};
