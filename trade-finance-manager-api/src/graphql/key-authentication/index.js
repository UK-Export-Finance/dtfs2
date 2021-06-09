const graphqlKeyPermissions = (req) => {
  const token = req.headers.authorization;

  return {
    read: token === process.env.UKEF_TFM_API_SYSTEM_KEY || token === process.env.UKEF_TFM_API_REPORTS_KEY,
    write: token === process.env.UKEF_TFM_API_SYSTEM_KEY,
  };
};

module.exports = graphqlKeyPermissions;
