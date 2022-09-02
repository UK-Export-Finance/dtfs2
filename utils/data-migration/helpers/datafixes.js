const CONSTANTS = require('../constant');
const { getCollection, portalDealUpdate, disconnect } = require('./database');
const { workflow } = require('./io');
/**
 * Data fixes helper functions
 */
let allDeals = {};

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
  let portalComments = [];
  const comments = await workflow(CONSTANTS.WORKFLOW.FILES.COMMENTS);

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.maker) {
      const { maker } = deal;

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

const update = async (ukefDealId, deal) => portalDealUpdate(ukefDealId, deal)
  .then((r) => Promise.resolve(r))
  .catch(() => Promise.reject(new Error('Error updating portal deal')));

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

    // Data fixes
    await banking();
    await comment();
    eligibilityCriteria();

    // Update portal
    const updates = allDeals.map(async (deal) => {
      await update(deal.details.ukefDealId, deal)
        .then((r) => {
          if (r) {
            updated += 1;
            console.info('\x1b[33m%s\x1b[0m', `${updated}/${allDeals.length} deal data-fixed.`, '\n');
            return Promise.resolve(true);
          }

          return Promise.reject();
        });
    });

    return Promise.all(updates)
      .then(() => {
        if (updated === allDeals.length) {
          console.info('\x1b[33m%s\x1b[0m', `✅ All ${allDeals.length} deals have been data-fixed.`, '\n');
        }

        return Promise.resolve(allDeals);
      })
      .catch((e) => Promise.reject(e));
  }

  return Promise.reject(new Error('Empty data set for data fixes'));
};

module.exports = {
  datafixes,
};
