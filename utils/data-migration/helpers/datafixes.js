const CONSTANTS = require('../constant');
const { getCollection, portalDealUpdate, tfmDealUpdate } = require('./database');
const { workflow } = require('./io');
/**
 * Data fixes helper functions
 */
let allDeals = {};
let allFacilities = {};

// ******************** DATABASE *************************

/**
 * Return all the TFM facilities, without (default) or with filter specified.
 * @param {Object} filter Mongo filter
 * @returns {Object} Collection object
 */
const getTfmFacilities = () => getCollection(CONSTANTS.DATABASE.TABLES.TFM_FACILITIES);

// ******************** FORMATTING *************************

/**
 * Format's raw string into a formatted string.
 * Following operations are performed on a raw string:
 * 1. Replace `\n` with `<br/>`
 * @param {String} string Raw string
 * @returns {String} Formatted string
 */
const formatString = (string) => {
  let raw = string;
  if (raw) {
    // Carriage Returns
    raw = raw.replace(/(\\r\\n|\\r|\\n)/g, '');
    // Tab Feeds
    raw = raw.replace(/\\t/g, '');
    // Double quotes
    raw = raw.replace(/\\"/g, '"');
    // Escaped forward slash
    raw = raw.replace(/\\\//g, '/');
  }
  return raw;
};

// ******************** DEALS *************************

/**
 * Eligibility Criteria (deal.eligibility)
 * `version` set to `1` or `4`
 */
const eligibilityCriteria = () => {
  Object.values(allDeals).forEach((deal, index) => {
    if (deal.eligibility) {
      const { eligibility } = deal;
      const criterions = eligibility.criteria.length;
      const version = criterions === 25 ? 1 : 4;

      allDeals[index].eligibility = {
        ...eligibility,
        version,
      };
    }
  });
};

/**
 * Bank (deal.bank)
 * Add missing `partyUrn` (deal.bank.partyUrn)
 * A mandatory field required for any ACBS execution
 */
const banking = async () => {
  const banks = await getCollection(CONSTANTS.DATABASE.TABLES.BANK);

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.bank) {
      const { bank } = deal;
      const partyUrn = banks.filter((b) => b.id === bank.id).map((b) => b.partyUrn).toString();
      allDeals[index].bank = {
        ...bank,
        partyUrn,
      };
    }
  });
};

// ******************** TFM DEALS *************************

/**
 * Add Party URN to the TFM deal parties (tfm.parties)
 * Following parties URN will be added (if available)
 * 1. Agent (tfm.parties.agent.partyUrn)
 * 2. Buyer (tfm.parties.buyer.partyUrn)
 * 3. exporter (tfm.parties.exporter.partyUrn)
 * 4. indemnifier (tfm.parties.indemnifier.partyUrn)
 * @param {Object} deal TFM deal object
 */
const partyUrn = async () => {
  const urns = await workflow(CONSTANTS.WORKFLOW.FILES.DEAL_PARTIES);

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.dealSnapshot.details && deal.tfm.parties) {
      // Process Party URNs
      urns
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === deal.dealSnapshot.details.ukefDealId)
        .map(({ DEAL }) => {
          if (DEAL.PARTY && DEAL.PARTY.URN) {
            const { ROLE_TYPE, URN } = DEAL.PARTY;

            switch (ROLE_TYPE) {
              case 'BUYER':
                allDeals[index].tfm.parties.buyer.partyUrn = URN;
                break;
              case 'EXPORTER':
                allDeals[index].tfm.parties.exporter.partyUrn = URN;
                break;
              case 'INDEMNIFIER':
                allDeals[index].tfm.parties.indemnifier.partyUrn = URN;
                break;
              default:
                break;
            }
          }

          return null;
        });
    }
  });
};

/**
 * Add agent's commission rate to deal TFM (deal.tfm.agent.commissionRate)
 */
const agentCommissionRate = async () => {
  const commission = await workflow(CONSTANTS.WORKFLOW.FILES.DEAL);

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.dealSnapshot.details && deal.tfm.parties) {
    // Add agent commission rate
      commission
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === deal.dealSnapshot.details.ukefDealId)
        .map(({ DEAL }) => {
          if (DEAL['AGENT COMMISSION PERCENT']) {
            allDeals[index].tfm.parties.agent.commissionRate = DEAL['AGENT COMMISSION PERCENT'];
          }
          return null;
        });
    }
  });
};

/**
 * Add Comments to the deal in TFM (tfm.activities)
 */
const comment = async () => {
  const comments = await workflow(CONSTANTS.WORKFLOW.FILES.COMMENTS);

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.tfm.activities) {
      const { activities } = deal.tfm;
      let tfmComments = [];

      // Copy existing TFM activities
      if (activities) {
        tfmComments = activities;
      }

      // Process comments
      comments
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === deal.dealSnapshot.details.ukefDealId)
        .map(({ DEAL }) => {
          if (DEAL.COMMENT_TEXT && DEAL.ASSOC_TYPE_ID === 1) {
            const { _id } = deal.dealSnapshot.maker;
            const author = DEAL.COMMENT_TEXT.split(' ');

            tfmComments.push({
              type: 'COMMENT',
              timestamp: Number(Number(deal.dealSnapshot.details.submissionDate) / 1000),
              text: formatString(DEAL.COMMENT_TEXT),
              author: {
                _id,
                firstName: author[0],
                lastName: author[1] || '',
              },
              label: 'Comment added'
            });
          }

          return null;
        });

      allDeals[index].tfm.activities = tfmComments;
    }
  });
};

// ******************** Deal Update *************************

/**
 * Update portal deal
 * @param {String} id Object ID
 * @param {Object} deal Updated deal object
 * @returns {Promise} `Resolve` upon success otherwise `Reject`
 */
const portalUpdate = async (id, deal) => portalDealUpdate(id, deal)
  .then((r) => Promise.resolve(r))
  .catch((e) => Promise.reject(new Error('Error updating portal deal: ', { e })));

/**
 * Data fix main function, invokes various data fixes.
 * @param {Object} deals All fetched deals object
 * @returns {Object} Data fixed deals
 */
const datafixes = async (deals) => {
  console.info('\x1b[33m%s\x1b[0m', `➕ 2. Applying ${CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS} deals data fixes`, '\n');

  if (deals && deals.length > 0) {
    /**
     * Save deals to global variable for independent data fixes
     * functions.
     */
    allDeals = deals;
    let updated = 0;

    // Deal - Data fixes
    await banking();
    eligibilityCriteria();

    // Facility - Data fixes

    // Update portal
    const updates = allDeals.map(async (deal) => {
      await portalUpdate(deal._id, deal)
        .then((r) => {
          if (r) {
            updated += 1;
            console.info('\x1b[33m%s\x1b[0m', `${updated}/${allDeals.length} data-fixed.`, '\n');

            return Promise.resolve(true);
          }

          return Promise.reject();
        })
        .catch((e) => Promise.reject(e));
    });

    return Promise.all(updates)
      .then(() => {
        if (updated === allDeals.length) {
          console.info('\x1b[33m%s\x1b[0m', `✅ All ${allDeals.length} deals have been data-fixed.`, '\n');

          return Promise.resolve(allDeals);
        }

        console.error('\n\x1b[31m%s\x1b[0m', `🚩 ${updated}/${allDeals.length} have been data-fixed.\n`);
        return Promise.reject();
      })
      .catch((e) => Promise.reject(e));
  }

  return Promise.reject(new Error('Empty data set for data fixes'));
};

/**
 * Data fix TFM deals
 * @param {Array} deals TFM deals object in an array
 * @returns {Array} deals Data fixed TFM deals object in an array
 */
const datafixesTfmDeal = async (deals) => {
  console.info('\x1b[33m%s\x1b[0m', `➕ 4. Data-fixing ${CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS} TFM deals.`, '\n');

  try {
    if (deals && deals.length > 0) {
    /**
     * Save deals to global variable for independent data fixes
     * functions.
     */
      allDeals = deals;
      let updated = 0;

      // TFM Deal - Data fixes
      await partyUrn();
      await agentCommissionRate();
      await comment();

      const updates = allDeals.map(async (deal) => {
        await tfmDealUpdate(deal)
          .then((r) => {
            if (r) {
              updated += 1;
              console.info('\x1b[33m%s\x1b[0m', `${updated}/${allDeals.length} TFM data-fixed.`, '\n');

              return Promise.resolve(true);
            }

            return Promise.reject();
          })
          .catch((e) => Promise.reject(e));
      });

      return Promise.all(updates)
        .then(() => {
          if (updated === allDeals.length) {
            console.info('\x1b[33m%s\x1b[0m', `✅ All ${allDeals.length} deals have been data-fixed.`, '\n');

            return Promise.resolve(allDeals);
          }
          console.error('\n\x1b[31m%s\x1b[0m', `🚩 ${updated}/${allDeals.length} have been TFM data-fixed.\n`);
          return Promise.reject();
        })
        .catch((e) => Promise.reject(e));
    }

    return Promise.reject(new Error('Empty data set for data fixes'));
  } catch (e) {
    console.error('Error data-fixing TFM deal: ', { e });
    return Promise.reject(e);
  }
};

/**
 * Data fix TFM facilities
 * @param {Array} facilities Array of TFM facilities objects
 * @returns {Array} TFM facilities data fixed, returned in as array of objects.
 */
const datafixesTfmFacilities = async () => {
  try {
    allFacilities = await getTfmFacilities();

    return Promise.resolve(allFacilities);
  } catch (e) {
    console.error('Error data-fixing TFM facilities: ', { e });
    return Promise.reject(e);
  }
};

module.exports = {
  datafixes,
  datafixesTfmDeal,
  datafixesTfmFacilities,
};
