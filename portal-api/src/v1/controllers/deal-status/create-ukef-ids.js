const refDataApi = require('../../../reference-data/api');
const { updateDeal } = require('../deal.controller');
const facilitiesController = require('../facilities.controller');
const CONSTANTS = require('../../../constants');

const createUkefIds = async (entityId, deal, user) => {
  const dealType = CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS;

  let numGenDeal;

  try {
    numGenDeal = await refDataApi.numberGenerator.create(
      {
        dealType,
        entityType: 'deal',
        entityId,
        dealId: deal._id,
        user,
      },
    );
  } catch (err) {
    throw new Error(err);
  }

  let updatedDeal;
  try {
    updatedDeal = await updateDeal(
      entityId,
      {
        details: {
          ukefDealId: numGenDeal.ukefId,
        },
      },
      user,
    );
  } catch (error) {
    throw new Error(error);
  }

  const facilitiesNumGenPromises = [];
  // Kick off function call for each facility
  deal.facilities.forEach((facilityId) => facilitiesNumGenPromises.push(
    refDataApi.numberGenerator.create(
      {
        dealType,
        entityId: facilityId,
        entityType: 'facility',
        dealId: deal._id,
        user,
      },
    ),
  ));

  const facilitiesNumGenRes = await Promise.all(facilitiesNumGenPromises);

  const facilitiesUpdatePromises = [];

  // Assign the generated ukefIds to each facility and update
  deal.facilities.forEach((facilityId) => {
    const { ukefId } = facilitiesNumGenRes.pop();

    const modifiedFacility = {
      ukefFacilityId: ukefId,
    };

    facilitiesUpdatePromises.push(
      facilitiesController.update(
        deal._id,
        facilityId,
        modifiedFacility,
        user,
      ),
    );

    return facilityId;
  });

  await Promise.all(facilitiesUpdatePromises);

  return updatedDeal;
};

module.exports = createUkefIds;
