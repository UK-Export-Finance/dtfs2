const { number } = require('../../../external-api/api');
const { updateDeal } = require('../deal.controller');
const facilitiesController = require('../facilities.controller');

const createUkefIds = async (entityId, deal, user) => {
  try {
    const facilitiesNumber = [];
    const facilitiesUpdatePromises = [];

    const { data: dealNumber } = await number.get({
      entityType: 'deal',
      dealId: deal._id,
    });

    const updatedDeal = await updateDeal(
      entityId,
      {
        details: {
          ukefDealId: dealNumber.maskedId,
        },
      },
      user,
    );

    deal.facilities.forEach(async () => {
      const { data: facilityNumber } = await number.get({
        entityType: 'facility',
        dealId: deal._id,
      });

      facilitiesNumber.push(facilityNumber);
    });

    const facilitiesNumberResponse = await Promise.all(facilitiesNumber);

    deal.facilities.forEach((facilityId) => {
      const { maskedId } = facilitiesNumberResponse.pop();

      const modifiedFacility = {
        ukefFacilityId: maskedId,
      };

      facilitiesUpdatePromises.push(facilitiesController.update(deal._id, facilityId, modifiedFacility, user));

      return facilityId;
    });

    await Promise.all(facilitiesUpdatePromises);

    return updatedDeal;
  } catch (error) {
    console.error('❌ Unable to get UKEF IDs from the number generator %o', error);

    throw new Error('Unable to get UKEF IDs from the number generator', { cause: error });
  }
};

module.exports = createUkefIds;
