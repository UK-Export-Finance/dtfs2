const listFiles = require('./listFiles');
const processFile = require('./processFile');
const dotenv = require('dotenv');
dotenv.config();

const filepath = process.env.LOCAL_FILEPATH;

const go = async () => {
  const filesToProcess = await listFiles(filepath);

  for (file of filesToProcess) {
    processFile(file);
  }
}

go()
  .then(console.log);
