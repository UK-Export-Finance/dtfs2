const mapDeal = require('../mappings/map-deal');
const api = require('../api');

const findOneDeal = async (_id) => {
  console.log('findOneDeal3', _id);
  const deal = await api.findOneDeal(_id);
  console.log('findOneDeal3', { deal, mapped: mapDeal(deal) });
  return mapDeal(deal);
};

exports.findOneDeal = findOneDeal;
