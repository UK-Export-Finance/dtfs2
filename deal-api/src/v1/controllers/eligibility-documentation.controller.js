const fileshare = require('../../drivers/fileshare');
const { formatFilenameForSharepoint } = require('../../utils');

exports.update = async (req, res) => {
  const dealFiles = [];

  req.files.forEach(async (file) => {
    const { filename, fullPath } = await fileshare.uploadStream({
      folder: req.params.id,
      subfolder: file.fieldname,
      filename: formatFilenameForSharepoint(file.originalname),
      buffer: file.buffer,
    });

    dealFiles.push({
      filename,
      fullPath,
    });
  });

  res.status(200).send('UPDATE');
};
