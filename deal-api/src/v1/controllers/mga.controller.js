
const stream = require('stream');
const { readFile } = require('../../drivers/fileshare');
const { findOneBank } = require('./banks.controller');

exports.findAllByUserOrganisation = async (req, res) => {
  const { bank } = req.user;

  if (!bank) {
    return res.status(200).json([]);
  }

  return findOneBank(bank.id, async (bankDetails) => {
    const mga = bankDetails && bankDetails.mga ? bankDetails.mga : [];
    res.status(200).json(mga);
  });
};

exports.downloadMga = async (req, res) => {
  const { filename } = req.params;
  const { bank } = req.user;

  const documentLocation = {
    folder: 'mga',
    subfolder: bank.id,
    filename,
  };

  const bufferedFile = await readFile(documentLocation);

  if (bufferedFile.error) {
    return res.status(bufferedFile.error.errorCode).send();
  }

  const readStream = new stream.PassThrough();
  readStream.end(bufferedFile);

  res.set('Content-disposition', `attachment; filename=${filename}`);

  return readStream.pipe(res);
};
