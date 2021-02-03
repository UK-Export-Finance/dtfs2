const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');

const queryDeals = async (query, start = 0, pagesize = 0) => {
  const collection = await db.getCollection('deals');
  const dealResults = collection.find(query);
  const count = await dealResults.count();
  const deals = await dealResults
    .sort({ 'details.dateOfLastAction': -1 })
    .skip(start)
    .limit(pagesize)
    .toArray();


  return {
    count,
    deals,
  };
};
exports.queryDeals = queryDeals;

exports.queryDealsPost = async (req, res) => {
  const deals = await queryDeals(req.body.query, req.body.start, req.body.pagesize);
  res.status(200).send(deals);
};

const findOneDeal = async (_id, callback, type) => {
  const [dealsCollectionName, facilitiesCollectionName] = type === 'tfm'
    ? ['tfm-deals', 'tfm-facilities']
    : ['deals', 'facilities'];

  const dealsCollection = await db.getCollection(dealsCollectionName);
  const facilitiesCollection = await db.getCollection(facilitiesCollectionName);

  const dealItem = await dealsCollection.findOne({ _id });

  const deal = type === 'tfm' ? dealItem && dealItem.dealSnapshot : dealItem;

  if (dealItem) {
    const facilityIds = deal.facilities;

    if (facilityIds && facilityIds.length > 0) {
      const mappedDeal = deal;
      const mappedBonds = [];
      const mappedLoans = [];

      const facilities = await facilitiesCollection.find({
        _id: {
          $in: facilityIds,
        },
      }).toArray();

      facilityIds.forEach((id) => {
        const facilityObj = facilities.find((f) => f._id === id); // eslint-disable-line no-underscore-dangle

        if (facilityObj) {
          const { facilityType } = facilityObj;

          if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
            mappedBonds.push(facilityObj);
          }

          if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
            mappedLoans.push(facilityObj);
          }
        }
      });

      mappedDeal.bondTransactions = {
        items: mappedBonds,
      };

      mappedDeal.loanTransactions = {
        items: mappedLoans,
      };

      const returnDeal = type === 'tfm'
        ? {
          ...dealItem,
          snapshotDeal: mappedDeal,
        }
        : mappedDeal;


      if (callback) {
        callback(returnDeal);
      }

      return returnDeal;
    }
  }

  if (callback) {
    callback(dealItem);
  }

  return dealItem;
};
exports.findOneDeal = findOneDeal;

exports.findOneDealGet = async (req, res) => {
  const deal = await findOneDeal(req.params.id);

  if (deal) {
    return res.status(200).send({
      deal,
    });
  }

  return res.status(404).send();
};
