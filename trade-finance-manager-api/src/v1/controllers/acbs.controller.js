const api = require('../api');

const createACBS = async (deal) => {
  const acbsRes = await api.createACBS(deal);
  return acbsRes;
};
exports.createACBS = createACBS;
