const express = require('express');

const router = express.Router();

const fileshare = require('./drivers/fileshare');

const config = fileshare.getConfig('workflow');
let workflowFolder;

const doUpload = async () => {
  workflowFolder = `v2-upload-test/${Date.now()}`; // eslint-disable-line no-underscore-dangle

  const testFile = {
    fileshare: 'workflow',
    folder: workflowFolder,
    filename: 'test.txt',
    buffer: Buffer.from('', 'utf-8'),
  };

  const upload = await fileshare.uploadFile(testFile);
  return upload;
};

router.get('/upload-test', (req, res) => {
  const upload = doUpload();

  Promise.all([upload]).then((values) => {
    res.status(200).json({
      workflowFolder,
      config,
      upload: values[0],
    });
  });
});

module.exports = router;
