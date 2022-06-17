/**
* DATA MIGRATION
* **************
* Purpose of this script is to migrate GEF deals to TFM.
* Since GEF deals are not subjected to execution on Workflow.
*/

const fs = require('fs');
const axios = require('axios');
const CONSTANTS = require('../constant');
const {
  getCollection,
  disconnect,
} = require('../helpers/database');
const {
  open,
} = require('../helpers/actionsheets');

const version = '0.0.1';
const { TFM_API } = process.env;

// ******************** DEALS *************************

/**
* Return all the portal deals, without (default) or with filter specified.
* @param {Object} filter Mongo filter
* @returns {Object} Collection object
*/
const getDeals = (filter = null) => getCollection(CONSTANTS.DATABASE.TABLES.DEAL, filter);

/**
* Returns all TFM deals.
* @param {Object} filter Mongo filter
* @returns {Object} Collection object
*/

const submitTfmDeal = async () => {
  console.info('\x1b[33m%s\x1b[0m', '➕ 1. Creating deals', '\n');

  let counter = 0;
  /**
  * AND condition
  * 1. Deal type : GEF
  * 2. Property exists : dataMigration
  */
  const filter = {
    $and: [
      { dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF },
      { dataMigration: { $exists: true } }
    ]
  };
  const checker = {
    username: 'BANK1_CHECKER1',
    roles: ['checker'],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
      emails: [
        'maker1@ukexportfinance.gov.uk',
        'checker1@ukexportfinance.gov.uk'
      ],
      companiesHouseNo: 'UKEF0001',
      partyUrn: '00318345'
    },
    lastLogin: String(new Date().valueOf()),
    firstname: 'Abhi',
    surname: 'Markan',
    email: 'checker1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
    _id: '627b70305ac41e001d37294a',
  };

  return getDeals(filter)
    .then(async (deals) => {
      const insertions = deals.map(async (deal) => {
        await axios({
          method: 'put',
          url: `${TFM_API}/v1/deals/submit`,
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            dealId: deal._id,
            dealType: deal.dealType,
            checker,
          },
        })
          .then((inserted) => {
            if (inserted.status === 200) {
              counter += 1;
              console.info('\x1b[33m%s\x1b[0m', `✅ Inserted ${counter}/${deals.length}`);
              Promise.resolve(inserted);
            } else {
              Promise.reject(new Error('\x1b[31m%s\x1b[0m', `🚩 Error inserting deal ${inserted}`));
            }
          })
          .catch((error) => Promise.reject(new Error('\x1b[31m%s\x1b[0m', `🚩 Error inserting deal ${error}`)));
      });

      return Promise.all(insertions)
        .then(() => Promise.resolve(counter))
        .catch((e) => Promise.reject(e));
    })
    .catch((e) => Promise.reject(e));
};

const updateTfmDeal = () => {

};

// ******************** ACTION SHEETS *************************

const actionSheets = () => {
  console.info('\x1b[33m%s\x1b[0m', '➕ 2. Parsing action sheets', '\n');
  const path = './actionsheets';

  try {
    const files = fs.readdirSync(path);

    files.forEach((file) => {
      const uri = `${path}/${file}`;
      open(uri)
        .then((r) => {
          console.log(r);
        });
    });

    return Promise.resolve(true);
  } catch (e) {
    return Promise.reject(new Error(`🚩 Unable to read the directory ${e}`));
  }
};

// ******************** MAIN *************************

/**
* Entry point function.
* Initiates Deal and Facilities creation and save process.
* @returns {Boolean} Execution status
*/
const migrate = () => {
  console.info('\n\x1b[33m%s\x1b[0m', `🚀 Initiating GEF TFM migration v${version}.`, '\n\n');

  submitTfmDeal()
    .then((result) => {
      if (result) console.info('\n\x1b[32m%s\x1b[0m', `✅ Successfully inserted ${result} TFM deals.\n`);
    })
    .then(() => actionSheets())
    .then(() => updateTfmDeal())
    .then(() => disconnect())
    .then(() => process.exit(1))
    .catch((error) => {
      console.error('\n\x1b[31m%s\x1b[0m', '🚩 Migration failed.\n', { error });
      process.exit(1);
    });
};

// migrate();
actionSheets().then((r) => console.log(r));
