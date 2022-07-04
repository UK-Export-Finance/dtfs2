/* eslint-disable no-restricted-syntax */
/**
 * DATA MIGRATION
 * **************
 * Purpose of this script is to migrate GEF deals to TFM.
 * Since GEF deals are not subjected to execution on Workflow.
 */

const fs = require('fs');
const axios = require('axios');
const CONSTANTS = require('../constant');
const { getCollection, update, disconnect } = require('../helpers/database');
const { open, get } = require('../helpers/actionsheets');
const { excelDateToISODateString } = require('../helpers/date');

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
 * Updates TFM deal with provided updates object.
 * @param {String} ukefDealId UKEF Deal ID
 * @param {Object} updates Updates object in JSON
 * @returns {Promise} Resolve if successfull otherwise Reject
 */
const setTfmDeal = (ukefDealId, updates) => update(CONSTANTS.DATABASE.TABLES.TFM_DEAL, ukefDealId, updates);

/**
 * Submits deal to the TFM as a `Checker` from `UKEF test bank (Delegated)`
 * for following deals:
 * 1. Deal Type: `GEF`
 * 2. Property exists check: `dataMigration`
 * @returns {Promise} Response on success, Reject upon a failure.
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
    $and: [{ dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF }, { dataMigration: { $exists: true } }],
  };
  const checker = {
    username: 'BANK1_CHECKER1',
    roles: ['checker'],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
      emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
      companiesHouseNo: 'UKEF0001',
      partyUrn: '00318345',
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

/**
 * Updates `tfm-deals` collection with update object.
 * @param {String} ukefDealId UKEF Deal ID
 * @param {Object} update Object comprising of updates to be applied
 * @returns {Promise} Resolve is success, otherwise Reject accomplied with an error message.
 */
const updateTfmDeal = (ukefDealId, updates) => {
  try {
    return setTfmDeal(ukefDealId, updates)
      .then((r) => Promise.resolve(r))
      .catch((e) => Promise.reject(new Error(e)));
  } catch (e) {
    return Promise.reject(new Error(`🚩 Unable to update deal TFM ${ukefDealId} ${e}`));
  }
};

// ******************** ACTION SHEETS *************************

/**
 * Parses action sheets from defined directory.
 * Interested cell looksups are defined in `searches` in following format:
 * [property path, cell name, response field index]
 * @returns {Promise} Parsed data from the action sheets in `JSON` as promise resolve, otherwise reject.
 */
const actionSheets = async () => {
  console.info('\x1b[33m%s\x1b[0m', '➕ 2. Parsing action sheets', '\n');
  const path = './actionsheets';
  const results = [];
  const searches = [
    ['ukefDealId', 'Deal Number', 1],
    ['tfm.exporterCreditRating', 'Credit Rating Code', 3],
  ];

  try {
    const files = fs.readdirSync(path);

    await files.forEach((file) => {
      const uri = `${path}/${file}`;
      open(uri)
        .then((data) => {
          if (data) return Promise.resolve(data);
          return Promise.reject(new Error(`🚩 Empty action sheet ${uri}`));
        })
        .then((data) => {
          let lookups = {};
          searches.forEach((lookup) => {
            const propertyName = lookup[0];
            lookups = {
              ...lookups,
              [propertyName]: get(data, lookup),
            };
          });
          results.push(lookups);

          Promise.resolve(results);
        })
        .catch((e) => Promise.reject(new Error(e)));
    });

    return Promise.resolve(results);
  } catch (e) {
    return Promise.reject(new Error(`🚩 Unable to read the directory ${e}`));
  }
};

/**
 * Processes all the data provided in array of object.
 * If multiple action sheets were parsed then all promises
 * are resolved and final update counter is provided.
 * Otherwise rejected with an error.
 * @param {Array} data Action sheet parsed data provided in JSON format
 * @returns {Promise} Update counter if resolved otherwise reject error.
 */
const processActionSheets = (data) => {
  if (data && data.length > 0) {
    let counter = 0;

    const responses = data.map((deal) => {
      const { ukefDealId } = deal;
      const updates = {
        ...deal,
      };

      delete updates.ukefDealId;
      return updateTfmDeal(ukefDealId, updates)
        .then((r) => {
          if (r) {
            counter += 1;
            console.info('\x1b[33m%s\x1b[0m', `✅ Deal updated successfully ${ukefDealId}`);
            return Promise.resolve();
          }
          return Promise.reject(new Error(`🚩 Unable to update deal ${ukefDealId}`));
        })
        .catch((e) => Promise.reject(new Error(e)));
    });

    return Promise.all(responses)
      .then(() => Promise.resolve(counter))
      .catch((e) => Promise.reject(e));
  }

  return Promise.reject(new Error('🚩 Empty data set provided.'));
};

const migrateGefAmendments = async () => {
  const amendmentType = [
    'Decrease in Value',
    'Increase in Value',
    'Increase in value',
    'Extension',
    'Extension,Value Increase, UKEF ML % reduction',
    'Cover period increase',
    'GE Extension',
    'GE Extension, Increase in Value',
  ];
  const { MANUAL } = CONSTANTS.AMENDMENT.AMENDMENT_TYPE;
  const { PROCEED } = CONSTANTS.AMENDMENT.AMENDMENT_BANK_DECISION;
  const allGefAmendments = [];
  let amendments22To23 = await open('../gef-amendments/gef-amendments2.xlsx', 'Amendments Apr 22 to Apr 23');
  amendments22To23 = amendments22To23.filter((item) => item.Product === 'GEF' && amendmentType.includes(item['Type of amendment'].trim()));
  allGefAmendments.push(...amendments22To23);

  let amendments21To22 = await open('../gef-amendments/gef-amendments2.xlsx', 'Amendments Apr 21 to Apr 22');
  amendments21To22 = amendments21To22.filter((item) => item.Product === 'GEF' && amendmentType.includes(item['Type of amendment'].trim()));
  allGefAmendments.push(...amendments21To22);

  const json = [];
  for (const amendment of allGefAmendments) {
    const output = {};
    output.requestDate = excelDateToISODateString(amendment.requestDate);
    output.exporter = amendment.Exporter.trim();
    output.ukefDealId = `00${amendment['Deal ID']}`;
    output.ukefFacilityId = `00${amendment['Facility ID']}`;
    output.status = amendment.Stage;
    output.submittedByPim = true;
    output.submittedAt = amendment.Moved ? excelDateToISODateString(amendment.Moved) : '';
    output.requireUkefApproval = amendment['Notification or Request'] === MANUAL;

    if (amendment['Notification or Request'] === MANUAL) {
      output.leadUnderwriterId = amendment.Underwriter; // TODO: change this to an _id
      output.ukefDecision = {
        coverEndDate: '', // TODO: add UW Manager decision Approved with or without conditions
        value: '', // TODO: add UW Manager decision Approved with or without conditions
        comments: amendment['PIM Comment/Status'],
        conditions: '', // TODO: add any conditions, if applicable
        declined: null, // TODO: add any reasons why it was declined. This is probably not applicable
        managersDecisionEmail: true,
        submitted: true,
        submittedAt: amendment['When Finished'] ? excelDateToISODateString(amendment['When Finished']) : '',
        submittedBy: {
          _id: '123', // TODO: capture the UW Manager ID
          name: '', // TODO: capture the UW Manager name
          email: '', // TODO: capture the UW Manager email
          username: '', // TODO: capture the UW Manager username
        },
      };
      output.banksDecision = {
        decision: PROCEED,
        banksDecisionEmail: true,
        submittedAt: amendment.submittedAt ? excelDateToISODateString(amendment.submittedAt) : '',
        effectiveDate: amendment['Date received'] ? excelDateToISODateString(amendment['Date received']) : '',
        submitted: true,
        submittedBy: {
          _id: '123', // TODO: capture the UW Manager _id
          name: '', // TODO: capture the UW Manager name
          email: '', // TODO: capture the UW Manager email
          username: '' // TODO: capture the UW Manager username
        }
      };
    }

    json.push(output);
  }

  fs.writeFile('./gef-amendments.json', JSON.stringify(json, null, 2), (err) => {
    if (err) throw err;
    console.info('The CSV file has been saved!');
  });
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
    .then((r) => {
      if (r) console.info('\n\x1b[32m%s\x1b[0m', `✅ Successfully inserted ${r} TFM deals.\n`);
    })
    .then(() => actionSheets())
    .then((r) => processActionSheets(r))
    .then((r) => {
      if (r) console.info('\n\x1b[32m%s\x1b[0m', `✅ Successfully updated ${r} TFM deals from Action Sheets.\n`);
    })
    .then(() => disconnect())
    .then(() => process.exit(1))
    .catch((error) => {
      console.error('\n\x1b[31m%s\x1b[0m', '🚩 Migration failed.\n', { error });
      process.exit(1);
    });
};

migrate();
// migrateGefAmendments();
