const api = require('../api');

exports.create = async (facilityBody, user) =>
  api.createFacility(facilityBody, user);

exports.findOne = async (facilityId) =>
  api.findOneFacility(facilityId);

exports.update = async (facilityId, facilityBody, user) =>
  api.updateFacility(facilityId, facilityBody, user);

exports.delete = async (facilityId, user) =>
  api.deleteFacility(facilityId, user);
