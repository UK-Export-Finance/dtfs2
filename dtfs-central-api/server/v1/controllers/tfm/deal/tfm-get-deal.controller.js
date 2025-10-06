const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const { DEALS } = require('../../../../constants');
const { TfmFacilitiesRepo } = require('../../../../repositories/tfm-facilities-repo');

const findOneDeal = async (_id, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid Deal Id');
  }

  try {
    const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);

    const deal = await dealsCollection.findOne({ _id: { $eq: ObjectId(_id) } });
    let returnDeal = deal;
    let facilityIds = [];

    if (deal) {
      if (deal?.dealSnapshot?.dealType === DEALS.DEAL_TYPE.GEF) {
        returnDeal = {
          ...deal,
          dealSnapshot: deal.dealSnapshot,
        };
      } else {
        if (deal?.dealSnapshot?.facilities?.length) {
          facilityIds = deal.dealSnapshot.facilities.map((facility) => ObjectId(facility._id));
        }

        if (facilityIds?.length > 0) {
          const mappedDeal = deal.dealSnapshot;
          const mappedBonds = [];
          const mappedLoans = [];
          const facilities = await TfmFacilitiesRepo.findByIds(facilityIds);

          facilityIds.forEach((id) => {
            const { facilitySnapshot } = facilities.find((f) => f._id.toHexString() === id.toHexString());

            if (facilitySnapshot) {
              const { type } = facilitySnapshot;

              if (type === FACILITY_TYPE.BOND) {
                mappedBonds.push(facilitySnapshot);
              }

              if (type === FACILITY_TYPE.LOAN) {
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

          returnDeal = {
            ...deal,
            dealSnapshot: mappedDeal,
          };
        }
      }
    }

    if (callback) {
      callback(returnDeal);
    }

    return returnDeal;
  } catch (error) {
    console.error('Error finding deal: %o', error);
    throw new Error('Error finding deal');
  }
};
exports.findOneDeal = findOneDeal;

exports.findOneDealGet = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const deal = await findOneDeal(req.params.id);

    if (deal) {
      return res.status(200).send({
        deal,
      });
    }

    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }

  return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
};
