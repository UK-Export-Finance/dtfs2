const moment = require('moment');
const driver = require('../driver');

const interval = 1000;
const timeout = 65000;

const isFileThere = async ({fileshare, folder, filename}) => {
  const listing = await driver.listDirectoryFiles({fileshare, folder});
  const matches = listing.filter( (entry)=>{
    return entry.name===filename
  });
  return matches.length > 0;
}

const check = async ({fileshare, folder, filename}, start, callback) => {
  if (moment() > start+timeout) {
    callback('timeout');
  } else {
    const fileThere = await isFileThere({fileshare, folder, filename});
    if (!fileThere) {
      callback(null, 'file gone');
    } else {
      setTimeout( () => {
        check({fileshare, folder, filename}, start, callback);
      }, interval)
    }
  }
}


const fileToBeGone = ({fileshare, folder, filename}) => {
  const start = moment();

  return new Promise( (resolve, reject) => {
    check(
      {fileshare, folder, filename},
      moment(),
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve();
        }
      });
  });
}

module.exports = fileToBeGone;
