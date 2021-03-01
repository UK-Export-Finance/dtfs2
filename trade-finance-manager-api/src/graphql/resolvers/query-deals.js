const CONSTANTS = require('../../constants');
const dealsReducer = require('../reducers/deals');
const { findOneDeal } = require('../../v1/controllers/deal.controller');
const { queryDeals } = require('../../v1/api');
const { findOneFacility } = require('../../v1/controllers/facility.controller');

require('dotenv').config();

const getProduct = async (deal) => {
  let countBonds = 0;
  let countLoans = 0;
  for (let i = 0; i < deal.facilities.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const facility = await findOneFacility(deal.facilities[i]);

    if (facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
      countBonds += 1;
    }
    if (facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
      countLoans += 1;
    }
  }
  if (countBonds > 0 && countLoans > 0) {
    return CONSTANTS.DEALS.DEAL_PRODUCT_CODE.BOND_AND_LOAN;
  } if (countBonds > 0) {
    return CONSTANTS.DEALS.DEAL_PRODUCT_CODE.BOND;
  } if (countLoans > 0) {
    return CONSTANTS.DEALS.DEAL_PRODUCT_CODE.LOAN;
  }
  return '';
};

const getDeals = async (args) => {
  const dict = {};
  const fn = async (d) => {
    if (d.facilities.length > 0) {
      await getProduct(d).then((p) => {
        // eslint-disable-next-line no-underscore-dangle
        dict[d._id] = p;
      });
    }
  };
  console.log(args);
  const deal = await findOneDeal(1000161);
  console.log(`deal:${deal}`);
  const q = await queryDeals(args);
  await Promise.all(q.deals.map(fn));

  const reducedDeals = dealsReducer(q, dict);
  return reducedDeals;
};


module.exports = getDeals;
