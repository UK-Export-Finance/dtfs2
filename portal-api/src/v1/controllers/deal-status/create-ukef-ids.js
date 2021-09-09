const refDataApi = require('../../../reference-data/api');
const { updateDeal } = require('../deal.controller');
const facilitiesController = require('../facilities.controller');

const createUkefIds = async (dealId, deal, user) => {
  const ukefDealId = await refDataApi.numberGenerator.create('deal');

  const totalFacilities = deal.facilities.length;
  let updatedFacilitiesCount = 0;

  return new Promise(async (resolve) => { // eslint-disable-line no-async-promise-executor
    const updatedDeal = await updateDeal(
      dealId,
      {
        details: {
          ukefDealId,
        },
      },
      user,
    );

    deal.facilities.forEach(async (facilityId) => {
      const ukefFacilityID = await refDataApi.numberGenerator.create('facility');

      const modifiedFacility = {
        ukefFacilityID,
      };

      await facilitiesController.update(facilityId, modifiedFacility, user);

      updatedFacilitiesCount += 1;

      if (updatedFacilitiesCount === totalFacilities) {
        return resolve(updatedDeal);
      }

      return facilityId;
    });
  });
};

module.exports = createUkefIds;
