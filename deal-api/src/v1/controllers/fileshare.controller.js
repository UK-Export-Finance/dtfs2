const { FILESHARE_URL } = require('../../drivers/fileshare');

exports.getFileshareUrl = (_, res) => {
  res.status(200).send({ FILESHARE_URL });
};
