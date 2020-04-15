const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const fileshare = require('../../drivers/fileshare');

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, async (deal) => {
    if (!deal) {
      return res.status(404).send();
    }

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(401).send();
    }

    const documentLocation = {
      folder: 'ukef',
      subfolder: 'type-a',
      filename: `${req.params.id}.xml`,
      stringEncoding: 'utf-8',
    };

    const document = await fileshare.readFile(documentLocation);

    return res.status(200).send(document);
  });
};

const generateTypeA = async (deal) => `<xml><Deal id="${deal._id}/>"`; // eslint-disable-line no-underscore-dangle

exports.createTypeA = async (deal) => {
  const typeA = await generateTypeA(deal);

  const upload = {
    folder: 'ukef',
    subfolder: 'type-a',
    filename: `${deal._id}.xml`, // eslint-disable-line no-underscore-dangle
    buffer: Buffer.from(typeA, 'utf-8'),
  };

  return fileshare.uploadStream(upload);
};
