const fileshare = require('../../drivers/fileshare');
const { formatFilenameForSharepoint } = require('../../utils');

exports.update = async (req, res) => {
  const dealFiles = [];

  req.files.forEach(async (file) => {
    const sharepointFriendlyFile = {
      ...file,
      originalname: formatFilenameForSharepoint(file.originalname),
    };

    const { filename, fullPath } = await fileshare.uploadStream(req.params.id, sharepointFriendlyFile);

    dealFiles.push({
      filename,
      fullPath,
    });
  });

  res.status(200).send('UPDATE');
};
