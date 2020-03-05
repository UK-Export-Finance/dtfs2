const listFiles = require('./listFiles');
const processFile = require('./processFile');
const dotenv = require('dotenv');
dotenv.config();

const filepath = process.env.LOCAL_FILEPATH;

const go = async () => { //wrapper just so i can use async/await...
  const filesToProcess = await listFiles(filepath);

  for (file of filesToProcess) {
    try {
      await processFile(file);
    } catch (err) {
      console.log(`${file} ::\n${err.stack}`);
    }

  }
}

go()
