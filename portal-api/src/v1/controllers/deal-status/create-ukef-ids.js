const { numberGenerator } = require('../../../external-api/api');
const { updateDeal } = require('../deal.controller');
const facilitiesController = require('../facilities.controller');

const createUkefIds = async (entityId, deal, user) => {
  let numGenDeal;

  try {
    numGenDeal = await numberGenerator.get({
      entityType: 'deal',
      dealId: deal._id,
    });
  } catch (error) {
    throw new Error('Error creating numGenDeal');
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
    throw new Error('Error updating deal');
  }

  const facilitiesNumGenPromises = [];
  deal.facilities.forEach(async () => {
    facilitiesNumGenPromises.push(
      numberGenerator.get({
        entityType: 'facility',
        dealId: deal._id,
      }),
    );
  });

  const facilitiesNumGenRes = await Promise.all(facilitiesNumGenPromises);

  const facilitiesUpdatePromises = [];

  // Assign the generated ukefIds to each facility and update
  deal.facilities.forEach((facilityId) => {
    const { ukefId } = facilitiesNumGenRes.pop();

    const modifiedFacility = {
      ukefFacilityId: ukefId,
    };

    facilitiesUpdatePromises.push(facilitiesController.update(deal._id, facilityId, modifiedFacility, user));

    return facilityId;
  });

  await Promise.all(facilitiesUpdatePromises);

  return updatedDeal;
};

module.exports = createUkefIds;
