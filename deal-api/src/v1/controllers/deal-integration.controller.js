const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const fileshare = require('../../drivers/fileshare');
const { generateTypeA } = require('./integration/k2-messages');

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

exports.createTypeA = async (deal) => {
  const typeA = await generateTypeA(deal);

  if (typeA.errorCount) {
    return typeA;
  }
  const upload = {
    folder: 'ukef',
    subfolder: 'type-a',
    filename: `${deal._id}.xml`, // eslint-disable-line no-underscore-dangle
    buffer: Buffer.from(typeA, 'utf-8'),
  };

  return fileshare.uploadStream(upload);
};
