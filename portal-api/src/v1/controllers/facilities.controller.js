const api = require('../api');

exports.create = async (facilityBody, user) => {
  const createdFacility = await api.createFacility(facilityBody, user);

  const { status, data } = createdFacility;
  const { _id } = data;

  const facility = await api.findOneFacility(_id);

  return {
    status,
    data: facility,
  };
};

exports.findOne = async (facilityId) =>
  api.findOneFacility(facilityId);

exports.update = async (facilityId, facilityBody, user) =>
  api.updateFacility(facilityId, facilityBody, user);

exports.delete = async (facilityId, user) =>
  api.deleteFacility(facilityId, user);

exports.createMultiple = async (req, res) => {
  const { facilities, associatedDealId, user } = req.body;

  const { data: ids } = await api.createMultipleFacilities(facilities, associatedDealId, user);

  const allFacilities = await Promise.all(
    ids.map(async (id) => {
      const facility = await api.findOneFacility(id);
      return facility;
    }),
  );

  return res.status(200).send(allFacilities);
};

exports.createMultipleFacilities = async (facilities, associatedDealId, user) =>
  api.createMultipleFacilities(facilities, associatedDealId, user);
