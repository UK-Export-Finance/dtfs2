const express = require('express');
const { Resolver } = require('dns').promises;

const router = express.Router();

const fileshare = require('./drivers/fileshare');

const config = fileshare.getConfig('workflow');
let workflowFolder;
const resolver = new Resolver();


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

const lookup = async (hostname) => {
  const ns = await resolver.resolveNs(hostname).catch((err) => ({ err }));
  const ip = await resolver.resolve(hostname).catch((err) => ({ err }));
  return {
    ip,
    ns,
  };
};

router.get('/dns-test', async (req, res) => {
  res.status(200).json({
    dnsServers: resolver.getServers(),
    bbc: await lookup('bbc.co.uk'),
    rrstagingmedia: await lookup('rrstagingmedia.file.core.windows.net'),
    tfsandrew: await lookup('tfsandrew.file.core.windows.net'),
    tfsandrew_private: await lookup('tfsandrew.privatelink.file.core.windows.net'),
  });
});

module.exports = router;
