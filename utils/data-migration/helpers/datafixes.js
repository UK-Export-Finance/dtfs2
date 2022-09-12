const CONSTANTS = require('../constant');
const { getCollection, portalDealUpdate, tfmDealUpdate } = require('./database');
const { workflow } = require('./io');
/**
 * Data fixes helper functions
 */
let allDeals = {};

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

/**
 * Comments (deal.comments)
 * Add deal level comments in Portal.
 */
const comment = async () => {
  const comments = await workflow(CONSTANTS.WORKFLOW.FILES.COMMENTS);

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.details && deal.maker) {
      const { maker } = deal;
      let portalComments = [];

      // Copy existing portal comments
      if (deal.comments) {
        portalComments = deal.comments;
      }

      // Process comments
      comments
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === deal.details.ukefDealId)
        .map(({ DEAL }) => {
          if (DEAL.COMMENT_TEXT) {
            portalComments.push({
              user: maker,
              text: DEAL.COMMENT_TEXT,
              timestamp: Number(deal.details.submissionDate),
            });
          }

          return null;
        });

      allDeals[index].comments = portalComments;
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
    await comment();
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
const datafixesTfm = async (deals) => {
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

module.exports = {
  datafixes,
  datafixesTfm,
};
