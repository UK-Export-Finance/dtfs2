const dealReducer = require('../reducers/deal');
const { findOneDeal } = require('../../v1/controllers/deal.controller');

require('dotenv').config();

const queryDeal = async ({ _id }) => {
  const deal = await findOneDeal(_id);

  return dealReducer(deal);
};

module.exports = queryDeal;
