/*
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

exports.createTypeA = async (deal, fromStatus) => {
  const {
    typeAxmlStr, filename, errorCount,
  } = await generateTypeA(deal, fromStatus);

  // TODO - Decide what to do with invalid typeA xml
  if (errorCount) {
    //   return typeAxmlStr;
  }

  const upload = {
    fileshare: 'workflow',
    createMissingFolder: false,
    folder: deal._id, // eslint-disable-line no-underscore-dangle
    filename: `${filename}.xml`,
    buffer: Buffer.from(typeAxmlStr, 'utf-8'),
  };

  return fileshare.uploadFile(upload);
};
*/
