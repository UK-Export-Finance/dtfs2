require('dotenv').config();

const graphqlKeyPermissions = (req) => {
  const token = req.headers.authorization;

  if (!process.env.UKEF_TFM_API_SYSTEM_KEY) {
    console.error('TFM API - UKEF_TFM_API_SYSTEM_KEY missing');
  }

  return {
    read: token === process.env.UKEF_TFM_API_SYSTEM_KEY || token === process.env.UKEF_TFM_API_REPORTS_KEY,
    write: token === process.env.UKEF_TFM_API_SYSTEM_KEY,
  };
};

module.exports = graphqlKeyPermissions;
