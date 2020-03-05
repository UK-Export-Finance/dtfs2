const dotenv = require('dotenv');

const api = require('./api');
const listFiles = require('./listFiles');
const processFile = require('./processFile');

dotenv.config();

const filepath = process.env.LOCAL_FILEPATH;

const go = async () => { //wrapper just so i can use async/await...
  const filesToProcess = await listFiles(filepath);

  for (file of filesToProcess) {
    try {
      const deal = await processFile(file);
      await api.createDeal(deal);
    } catch (err) {
      console.log(`${file} ::\n${err.stack}`);
    }

  }
}

go()
