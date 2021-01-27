const api = require('../api');

const findOneFacility = async (_id) => {
  const facility = await api.findOneFacility(_id);

  return facility;
};

exports.findOneFacility = findOneFacility;
