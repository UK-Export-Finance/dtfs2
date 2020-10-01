const { map } = require('cypress/types/bluebird');
const fs = require('fs');

module.exports = {
  listDirectoryFiles: ({ folder }) => fs.readdirSync(folder).map((foldername) => ({ name: foldername })),
  readFile: ({ folder, filename }) => fs.readFileSync(`${folder}/${filename}`),
  dealDir: './data/deals',
};
