const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');

const findOneDeal = async (_id, callback) => {
  const dealsCollection = await db.getCollection('tfm-deals');
  const facilitiesCollection = await db.getCollection('tfm-facilities');

  const dealItem = await dealsCollection.findOne({ _id });

  const deal = dealItem && dealItem.dealSnapshot;

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
        const { facilitySnapshot } = facilities.find((f) => f._id === id); // eslint-disable-line no-underscore-dangle

        if (facilitySnapshot) {
          const { facilityType } = facilitySnapshot;

          if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
            mappedBonds.push(facilitySnapshot);
          }

          if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
            mappedLoans.push(facilitySnapshot);
          }
        }
      });

      mappedDeal.bondTransactions = {
        items: mappedBonds,
      };

      mappedDeal.loanTransactions = {
        items: mappedLoans,
      };

      const returnDeal = {
        ...dealItem,
        dealSnapshot: mappedDeal,
      };

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
