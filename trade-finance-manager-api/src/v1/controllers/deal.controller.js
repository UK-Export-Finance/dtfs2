const mapDeal = require('../mappings/map-deal');
const api = require('../api');

const findOneDeal = async (_id) => {
  const deal = await api.findOneDeal(_id);
  return mapDeal(deal);
};

exports.findOneDeal = findOneDeal;
