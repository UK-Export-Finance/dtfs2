const { AZURE_WORKFLOW_FILESHARE_CONFIG, AZURE_PORTAL_FILESHARE_CONFIG } = require('../config');

const generateTypeBXML = require('./generateTypeBXML');
const upload = require('./upload');
const fileToBeGone = require('./fileToBeGone');

const sendTypeB =  async (req, res, next) => {
  const fileshare = AZURE_WORKFLOW_FILESHARE_CONFIG.FILESHARE_NAME;
  const folder = AZURE_WORKFLOW_FILESHARE_CONFIG.IMPORT_FOLDER;

  const typeBXML = generateTypeBXML(req.body);
  console.log(`typeB created ::\n${typeBXML}`);

  const filename = await upload({ fileshare, folder, typeBXML });
  console.log(`typeB uploaded as: ${filename}`)

  await fileToBeGone({fileshare, folder, filename})
    .then( () => {
      console.log(`${filename} has been consumed; releasing.`);
      res.status(200).send();
    })
    .catch( (err) => {
      console.log(`error while waiting for file to be consumed:\n ${err}`);
      res.status(400).send(err);
    });
};

module.exports = sendTypeB;
