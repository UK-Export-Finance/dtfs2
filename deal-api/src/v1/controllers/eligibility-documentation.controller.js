const fileshare = require('../../drivers/fileshare');

exports.update = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 4));

  const dealFiles = [];

  req.files.forEach(async (file) => {
    const uploadResult = await fileshare.uploadStream(req.params.id, file);

    dealFiles.push({
      filename: `${req.params.id}/${uploadResult.name}`,
    });
  });

  res.status(200).send('UPDATE');
};
