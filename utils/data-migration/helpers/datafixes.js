const CONSTANTS = require('../constant');
const {
  getCollection,
  portalDealUpdate,
  tfmDealUpdate,
  tfmFacilityUpdate,
} = require('./database');
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

// ******************** EXTRA *************************

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
    // Replace unknown character
    raw = raw.replace(//g, '');
  }
  return raw;
};

/**
 * Returns UKEF deal ID across various products
 * @param {Object} deal Deal Object
 * @returns {Integer} UKEF Deal ID
 */
const dealId = (deal) => {
  if (deal && deal.dealSnapshot) {
    return deal.dealSnapshot.dealType === CONSTANTS.DEAL.DEAL_TYPE.GEF
      ? deal.dealSnapshot.ukefDealId
      : deal.dealSnapshot.details.ukefDealId;
  }
  return null;
};

/**
 * Returns UKEF Deal ID from Object ID
 * @param {String} _id Deal Object ID
 * @returns {Integer} UKEF Deal ID
 */
const getUkefDealIdFromObjectId = (_id) => allDeals
  .filter((d) => d._id.toString() === _id.toString())
  .map((d) => d.ukefDealId ?? d.details.ukefDealId)
  .reduce((d) => d);

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
 * Add UKEF decision to a MIN
 *
 * deal.tfm.underwriterManagersDecision
 * deal.dealSnapshot.ukefDecision
 * deal.dealSnapshot.ukefDecisionAccepted
 */
const ukefDecision = async () => {
  const comments = await workflow(CONSTANTS.WORKFLOW.FILES.COMMENTS);
  const acceptableSubmissions = [
    CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
  ];

  Object.values(allDeals).forEach((deal, index) => {
    // MIN only deals
    if (!acceptableSubmissions.includes(deal.dealSnapshot.submissionType)) {
      return null;
    }

    let text = '';
    let decision;
    const acceptableTaskNames = [
      'Deal Final Approval',
      'AR - Final Approval',
      'Tier 1 Approval'
    ];

    // Concatenate approval comments
    comments
      .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal)
      && DEAL.COMMENT_TEXT
      && acceptableTaskNames.includes(DEAL.TASK_NAME))
      .forEach(({ DEAL }) => {
        text = text.concat(text, ' ', formatString(DEAL.COMMENT_TEXT));
      });

    comments
      .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal)
      && DEAL.COMMENT_TEXT
      && acceptableTaskNames.includes(DEAL.TASK_NAME))
      .forEach(({ DEAL }) => {
        const withConditions = DEAL.COMMENT_TEXT.toString().indexOf('Approved with Conditions') !== -1;
        const withoutConditions = DEAL.COMMENT_TEXT.toString().indexOf('Approved without any other conditions') !== -1
          || DEAL.COMMENT_TEXT.toString().indexOf('approved without special conditions') !== -1
          || DEAL.COMMENT_TEXT.toString().indexOf('Approved : ') !== -1;

        decision = withConditions && !withoutConditions
          ? CONSTANTS.DEAL.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS
          : CONSTANTS.DEAL.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS;

        if (!allDeals[index].dealSnapshot.ukefDecision) {
          allDeals[index].dealSnapshot.ukefDecision = [
            {
              text,
              decision,
              timestamp: deal.dealSnapshot.updatedAt,
            }
          ];
        }

        if (!allDeals[index].tfm.underwriterManagersDecision) {
          allDeals[index].tfm.underwriterManagersDecision = {
            decision,
            comments: text
          };
        }

        allDeals[index].dealSnapshot.ukefDecisionAccepted = true;
      });

    return true;
  });
};

/**
 * Add Party URN to the TFM deal parties (deal.tfm.parties)
 * or to TFM facilities (facility.tfm.bondIssuerPartyUrn)
 * and (facility.tfm.bondBeneficiaryPartyUrn)
 * Following parties URN will be added (if available)
 * 1. Agent (tfm.parties.agent.partyUrn)
 * 2. Buyer (tfm.parties.buyer.partyUrn)
 * 3. exporter (tfm.parties.exporter.partyUrn)
 * 4. indemnifier (tfm.parties.indemnifier.partyUrn)
 * @param {Object} deal TFM deal object
 */
const partyUrn = async (facility = false) => {
  const urns = await workflow(CONSTANTS.WORKFLOW.FILES.DEAL_PARTIES);

  if (facility) {
    Object.values(allFacilities).forEach(async (f, i) => {
      if (f.facilitySnapshot && f.tfm) {
        // Get deal id from facility id
        const ukefDealId = await getUkefDealIdFromObjectId(f.facilitySnapshot.dealId);

        // Process Party URNs
        urns
          .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === ukefDealId)
          .map(({ DEAL }) => {
            if (DEAL.PARTY && DEAL.PARTY.URN) {
              const { ROLE_TYPE, URN } = DEAL.PARTY;

              switch (ROLE_TYPE) {
                case 'BSS ISSUER':
                  allFacilities[i].tfm.bondIssuerPartyUrn = URN;
                  break;
                case 'BSS BENEFICIARY':
                  allFacilities[i].tfm.bondBeneficiaryPartyUrn = URN;
                  break;
                default:
                  break;
              }
            }
            return null;
          });
      }
    });
  }

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.dealSnapshot && deal.tfm.parties) {
      // Process Party URNs
      urns
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal))
        .map(({ DEAL }) => {
          if (DEAL.PARTY && DEAL.PARTY.URN) {
            const { ROLE_TYPE, URN } = DEAL.PARTY;

            switch (ROLE_TYPE) {
              case 'AGENT':
                allDeals[index].tfm.parties.agent.partyUrn = URN;
                break;
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
 * Add exporter credit rating to a deal (deal.tfm.exporterCreditRating)
 */
const creditRating = async () => {
  const creditRatings = await workflow(CONSTANTS.WORKFLOW.FILES.FACILITY);

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.tfm) {
      // Add exporter credit rating to the deal
      creditRatings
        .filter(({ UKEF_DEAL_ID }) => UKEF_DEAL_ID === dealId(deal))
        .map(({ FACILITY }) => {
          allDeals[index].tfm.exporterCreditRating = FACILITY['CREDIT RATING'];
          return null;
        });
    }
  });
};

/**
 * Adds `acbs` property to the TFM facilities
 * facility.tfm.acbs
 */
const ACBS = async (facility = false) => {
  if (!facility) {
    const acceptableSubmissions = [
      CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
    ];
    Object.values(allDeals).forEach((d, i) => {
      if (!d.tfm.acbs && acceptableSubmissions.includes(d.dealSnapshot.submissionType)) {
        // Construct `facilities` array
        const facilities = d.dealSnapshot.facilities.map((f) => ({
          facilityId: f._id,
          facilityStage: f.hasBeenIssued ? '07' : '06',
          facilityMaster: {},
          facilityInvestor: {},
          facilityCovenant: {},
          facilityProviderGuarantee: {},
          codeValueTransaction: {},
        }));

        // Construct `acbs` object
        const acbs = {
          portalDealId: d._id,
          ukefDealId: dealId(d),
          deal: {
            parties: {},
            deal: {},
            investor: {},
            guarantee: {},
            facilities,
          }
        };

        // Add `acbs` object to `deal.tfm`
        const { tfm } = allDeals[i];
        allDeals[i].tfm = {
          ...tfm,
          acbs,
        };
      }
    });
  } else {
    Object.values(allFacilities).forEach((f, i) => {
      if (!f.tfm.acbs && Boolean(f.facilitySnapshot.hasBeenIssued)) {
      // Construct `acbs` object
        const acbs = {
          facilityStage: '07',
          facilityMaster: {},
          facilityInvestor: {},
          facilityCovenant: {},
          parties: {},
          facilityCovenantChargeable: {},
          facilityBondBeneficiaryGuarantee: {},
          codeValueTransaction: {},
          facilityLoan: {},
          facilityFee: {},
          dataMigration: true,
        };

        // Add `acbs` object to `facility.tfm`
        const { tfm } = allFacilities[i];
        allFacilities[i].tfm = {
          ...tfm,
          acbs,
        };
      }
    });
  }
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
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal))
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
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal))
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

// ******************** TFM FACILITIES *************************

/**
 * Add Premium Schedule (deal.tfm.premiumSchedule) for pre-calculated
 * Workflow/K2 deals. This also includes PS
 * pre-calculated for Amendments.
 */
const premiumSchedule = async () => {
  const premiumSchedules = await workflow(CONSTANTS.WORKFLOW.FILES.INCOME_EXPOSURE);

  Object.values(allFacilities).forEach((facility, index) => {
    if (facility.tfm) {
      const premiums = [];
      let period = 1;

      // Add pre-calculated PS to the facility
      premiumSchedules
        .filter(({ DEAL }) => DEAL.FACILITY['UKEF FACILITY ID'] === facility.facilitySnapshot.ukefFacilityId
        && DEAL.FACILITY.PREM_SCH)
        .map(({ DEAL }) => {
          premiums.push({
            id: period,
            facilityURN: Number(DEAL.FACILITY['UKEF FACILITY ID']).toString(),
            calculationDate: DEAL.FACILITY.PREM_SCH['CALCULATION DATE'],
            income: DEAL.FACILITY.PREM_SCH.INCOME,
            incomePerDay: DEAL.FACILITY.PREM_SCH['INCOME PER DAY'],
            exposure: DEAL.FACILITY.PREM_SCH.EXPOSURE,
            period,
            daysInPeriod: DEAL.FACILITY.PREM_SCH['DAYS IN PERIOD'],
            effectiveFrom: DEAL.FACILITY.PREM_SCH['EFFECTIVE FROM DATE'],
            effectiveTo: DEAL.FACILITY.PREM_SCH['EFFECTIVE TO DATE'],
            created: DEAL.FACILITY.PREM_SCH['CALCULATION DATE'],
            updated: `${DEAL.FACILITY.PREM_SCH['CALCULATION DATE']}T00:00:00`,
            isAtive: `${DEAL.FACILITY.PREM_SCH['CURRENT INDICATOR']}T00:00:00`,
          });
          period += 1;

          return null;
        });

      allFacilities[index].tfm.premiumSchedule = premiums;
    }
  });
};

/**
* Facility data fix
* facility.facilitySnapshot.dayCountBasis
*/
const dayBasis = async () => {
  const facilities = await workflow(CONSTANTS.WORKFLOW.FILES.FACILITY);

  Object.values(allFacilities).forEach((facility, index) => {
    if (facility.tfm && facility.tfm.dayCountBasis) {
      facilities
        .filter(({ FACILITY }) => FACILITY['UKEF FACILITY ID'] === facility.facilitySnapshot.ukefFacilityId)
        .map(({ FACILITY }) => {
          if (FACILITY['DAY BASIS']) {
            allFacilities[index].tfm.facilitySnapshot.dayCountBasis = FACILITY['DAY BASIS'];
          }
          return null;
        });
    }
  });
};

/**
* Facility data fix
* facility.facilitySnapshot.feeType
*/
const feeType = async () => {
  const facilities = await workflow(CONSTANTS.WORKFLOW.FILES.FACILITY);

  Object.values(allFacilities).forEach((facility, index) => {
    if (facility.tfm && facility.tfm.dayCountBasis) {
      facilities
        .filter(({ FACILITY }) => FACILITY['UKEF FACILITY ID'] === facility.facilitySnapshot.ukefFacilityId)
        .map(({ FACILITY }) => {
          if (FACILITY['PREMIUM TYPE']) {
            let type;

            switch (FACILITY['PREMIUM TYPE']) {
              case 1:
                type = 'In Advance';
                break;
              case 2:
                type = 'In Arrears';
                break;
              case 3:
                type = 'At Maturity';
                break;
              default:
                break;
            }

            allFacilities[index].tfm.facilitySnapshot.feeType = type;
          }
          return null;
        });
    }
  });
};

/**
* Facility data fix
* facility.facilitySnapshot.feeFrequency
*/
const feeFrequency = async () => {
  const facilities = await workflow(CONSTANTS.WORKFLOW.FILES.FACILITY);

  Object.values(allFacilities).forEach((facility, index) => {
    if (facility.tfm && facility.tfm.dayCountBasis) {
      facilities
        .filter(({ FACILITY }) => FACILITY['UKEF FACILITY ID'] === facility.facilitySnapshot.ukefFacilityId)
        .map(({ FACILITY }) => {
          if (FACILITY['PREMIUM FREQUENCY']) {
            let frequency;

            switch (FACILITY['PREMIUM FREQUENCY']) {
              case 1:
                frequency = 'Monthly';
                break;
              case 2:
                frequency = 'Quarterly';
                break;
              case 3:
                frequency = 'Semi-annually';
                break;
              case 4:
                frequency = 'Annually';
                break;
              default:
                break;
            }

            allFacilities[index].tfm.facilitySnapshot.feeFrequency = frequency;
          }
          return null;
        });
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
      await creditRating();
      await partyUrn();
      await agentCommissionRate();
      await comment();
      await ACBS();
      await ukefDecision();

      const updates = allDeals.map(async (deal) => {
        await tfmDealUpdate(deal)
          .then((r) => {
            if (r) {
              updated += 1;
              console.info('\x1b[33m%s\x1b[0m', `${updated}/${allDeals.length} deals TFM data-fixed.`, '\n');

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
          console.error('\n\x1b[31m%s\x1b[0m', `🚩 ${updated}/${allDeals.length} deals have been TFM data-fixed.\n`);
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
const datafixesTfmFacilities = async (deals) => {
  console.info('\x1b[33m%s\x1b[0m', `➕ 5. Data-fixing ${CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS} TFM facilities.`, '\n');

  try {
    if (deals && deals.length > 0) {
      /**
       * Save deals and facilities to global variable
       * for independent data fixes functions.
       */

      allDeals = deals;
      allFacilities = await getTfmFacilities();
      let updated = 0;

      if (allFacilities && allFacilities.length > 0) {
      // TFM Facilities - Data fixes
        await partyUrn(true);
        await premiumSchedule();
        await dayBasis();
        await feeType();
        await feeFrequency();
        await ACBS(true);

        // Update TFM Facilities
        const updates = allFacilities.map(async (facility) => {
          await tfmFacilityUpdate(facility)
            .then((r) => {
              if (r) {
                updated += 1;
                console.info('\x1b[33m%s\x1b[0m', `${updated}/${allFacilities.length} facilities TFM data-fixed.`, '\n');

                return Promise.resolve(true);
              }

              return Promise.reject();
            })
            .catch((e) => Promise.reject(e));
        });

        return Promise.all(updates)
          .then(() => {
            if (updated === allFacilities.length) {
              console.info('\x1b[33m%s\x1b[0m', `✅ All ${allFacilities.length} facilities have been data-fixed.`, '\n');

              return Promise.resolve(allFacilities);
            }
            console.error('\n\x1b[31m%s\x1b[0m', `🚩 ${updated}/${allFacilities.length} facilities have been TFM data-fixed.\n`);
            return Promise.reject();
          })
          .catch((e) => Promise.reject(e));
      }

      return Promise.reject(new Error('TFM Facilities void data set'));
    }

    return Promise.reject(new Error('TFM deals void data set'));
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
