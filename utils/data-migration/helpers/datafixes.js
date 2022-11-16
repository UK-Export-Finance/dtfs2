/* eslint-disable array-callback-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const axios = require('axios');
const { getUnixTime } = require('date-fns');
const { ObjectId } = require('mongodb');
const CONSTANTS = require('../constant');
const {
  getCollection,
  portalDealUpdate,
  tfmDealUpdate,
  tfmFacilityUpdate,
  portalFacilityUpdate,
} = require('./database');
const { actionsheet, workflow, sleep } = require('./io');
const { epochInSeconds, getEpoch } = require('./date');
const getFacilityPremiumSchedule = require('../../../trade-finance-manager-api/src/v1/controllers/get-facility-premium-schedule');
const mapWorkflowStatus = require('./amendment');
const siteNames = require('../tfm/json/eStore');

const { TFM_API } = process.env;
let allDeals = {};
let allFacilities = {};

/**
 * Data fixes helper functions
 */

// ******************** DATABASE *************************
/**
  * Return all the portal deals, without (default) or with filter specified.
  * @param {Object} filter Mongo filter
  * @returns {Object} Collection object
  */
const getDeals = (filter = null) => getCollection(CONSTANTS.DATABASE.TABLES.DEAL, filter);

/**
 * Return all the TFM facilities, without (default) or with filter specified.
 * @param {Object} filter Mongo filter
 * @returns {Object} Collection object
 */
const getTfmFacilities = () => getCollection(CONSTANTS.DATABASE.TABLES.TFM_FACILITIES);

// ******************** Internal API Calls *************************

const createAmendment = async (facilityId) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${TFM_API}/v1/facility/${facilityId}/amendment`,
      headers: { 'Content-Type': 'application/json' },
      data: { facilityId },
    });

    if (response.data) {
      return Promise.resolve(response.data);
    }

    return Promise.reject(new Error(response?.error));
  } catch (e) {
    console.error(`Unable to create an amendment for facility ${facilityId}:`, { e });
    return Promise.reject(new Error(e));
  }
};

const updateAmendment = async (facilityId, amendmentId, data) => {
  try {
    const response = await axios({
      method: 'PUT',
      url: `${TFM_API}/v1/facility/${facilityId}/amendment/${amendmentId}`,
      headers: { 'Content-Type': 'application/json' },
      data,
    })
      .catch((e) => new Error(e));

    if (response.data) {
      return Promise.resolve(response.data);
    }

    return Promise.reject(new Error(response?.error));
  } catch (e) {
    console.error(`Unable to update an amendment for facility ${facilityId}:`, { e });
    return Promise.reject(new Error(e));
  }
};

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
const getUkefDealIdFromObjectId = (_id) => {
  const id = allDeals
    .filter((d) => d._id.toString() === _id.toString())
    .map((d) => d.dealSnapshot.ukefDealId ?? d.dealSnapshot.details.ukefDealId);
  return id[0];
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
 * Add supporting information
 * deal.dealSnapshot.supportingInformation
 */
const supportingInformations = async () => {
  const information = await workflow(CONSTANTS.WORKFLOW.FILES.DEAL);

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.dealSnapshot) {
      // Add exporter credit rating to the deal
      information
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal) && DEAL['BANK SECURITY'].toString().trim() !== '')
        .map(({ DEAL }) => {
          const { supportingInformation } = allDeals[index].dealSnapshot;

          // If exist then skip
          if (!supportingInformation) {
            return null;
          }

          // Only if comments don't already exists
          if (!supportingInformation.securityDetails) {
            allDeals[index].dealSnapshot.supportingInformation = {
              ...supportingInformation,
              securityDetails: {
                exporter: formatString(DEAL['BANK SECURITY']),
              },
              validationErrors: {
                count: 0,
                errorList: {
                  exporterQuestionnaire: {}
                }
              }
            };
          }

          return null;
        });
    }
  });
};

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

    let internalComments = '';
    let decisionComments = '';
    let userFullName = null;
    let decision;
    let withConditions = false;
    let withoutConditions = false;
    const decisionComment = [
      'Deal Final Approval',
    ];
    const internalComment = [
      'AR - Final Approval',
      'Tier 1 Approval'
    ];

    // Concatenate decision comments
    comments
      .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal)
      && DEAL.COMMENT_TEXT
      && decisionComment.includes(DEAL.TASK_NAME))
      .forEach(({ DEAL }) => {
        decisionComments = decisionComments.concat(decisionComments, ' ', formatString(DEAL.COMMENT_TEXT));
        withConditions = DEAL.COMMENT_TEXT.toString().indexOf('Approved with Conditions') !== -1;

        if (!withConditions) {
          withoutConditions = DEAL.COMMENT_TEXT.toString().indexOf('Approved without any other conditions') !== -1
          || DEAL.COMMENT_TEXT.toString().indexOf('approved without special conditions') !== -1
          || DEAL.COMMENT_TEXT.toString().indexOf('Approved') !== -1;
        }

        if ((withConditions || withoutConditions) && DEAL.COMMENT_BY) {
          userFullName = DEAL.COMMENT_BY;
        }
      });

    // Concatenate internal comments
    comments
      .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal)
    && DEAL.COMMENT_TEXT
    && internalComment.includes(DEAL.TASK_NAME))
      .forEach(({ DEAL }) => {
        internalComments = internalComments.concat(internalComments, ' ', formatString(DEAL.COMMENT_TEXT));
      });

    comments
      .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal)
      && DEAL.COMMENT_TEXT
      && (decisionComment.includes(DEAL.TASK_NAME) || internalComment.includes(DEAL.TASK_NAME)))
      .forEach(({ DEAL }) => {
        decision = withConditions
          ? CONSTANTS.DEAL.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS
          : CONSTANTS.DEAL.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS;

        const timestamp = getEpoch(DEAL.FACILITY.COMMENT_DATE_CREATED_DATETIME);

        if (!allDeals[index].dealSnapshot.ukefDecision) {
          allDeals[index].dealSnapshot.ukefDecision = [
            {
              decisionComment,
              decision,
              timestamp,
            }
          ];
        }

        if (!allDeals[index].tfm.underwriterManagersDecision) {
          allDeals[index].tfm.underwriterManagersDecision = {
            decision,
            comments: decisionComments,
            internalComments,
            timestamp,
            userFullName,

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

const importPortalData = async () => {
  /**
    * AND condition
    * 1. Deal type : GEF
    * 2. Property exists : dataMigration
    */
  const filter = {
    $and: [{ dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF }, { dataMigration: { $exists: true } }],
  };
  const deals = await getDeals(filter);

  deals.map((deal) => {
    const { ukefDecision: decision } = deal;
    if (decision && decision[0] && decision[0].text) {
      const { text } = decision[0];

      // Set deal TFM stage as `Abandoned` if mentioned in UKEF decision
      if (text.toLowerCase().indexOf('abandoned') !== -1) {
        allDeals
          .forEach((d, i) => {
            if (allDeals[i].dealSnapshot.ukefDealId === deal.ukefDealId) {
              allDeals[i].tfm.stage = CONSTANTS.DEAL.TFM_STATUS.ABANDONED;
            }
          });
      }

      // Add UW Managers decision's from Portal to TFM
      if (text && text.toLowerCase().indexOf('abandoned') === -1) {
        allDeals
          .forEach((d, i) => {
            if (allDeals[i].dealSnapshot.ukefDealId === deal.ukefDealId) {
              allDeals[i].tfm.stage = CONSTANTS.DEAL.TFM_STATUS.CONFIRMED;
              allDeals[i].tfm.underwriterManagersDecision = {
                decision: CONSTANTS.DEAL.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
                comments: text,
                userFullName: '',
                timestamp: deal.updatedAt
              };
            }
          });
      }
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
      if (!f.tfm.acbs) {
      // Construct `acbs` object
        const acbs = {
          facilityStage: f.facilitySnapshot.hasBeenIssued ? '07' : '06',
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
 * Add eStore site name to deals with missing
 * eStore site name due to exporter name anomaly.
 * `deal.tfm.eStore.siteName` property is updated.
 */
const eStore = async () => {
  Object.values(allDeals).forEach((deal, index) => {
    // Only if Site name is blank
    siteNames.map((site) => {
      if (site[0] === Number(deal.dealSnapshot.details.ukefDealId)) {
        allDeals[index].tfm.estore.siteName = site[1];
      }
    });
  });
  return null;
};

/**
 * Migrate tasks attributes to TFM tasks (deal.tfm.tasks)
 */
const tasks = async () => {
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
  const deals = await workflow(CONSTANTS.WORKFLOW.FILES.COMMENTS);
  const facilities = await workflow(CONSTANTS.WORKFLOW.FILES.FACILITY_COMMENTS);

  Object.values(allDeals).forEach((deal, index) => {
    if (deal.tfm.activities) {
      const { activities } = deal.tfm;
      let tfmComments = [];

      // Copy existing TFM activities
      if (activities) {
        tfmComments = activities;
      }

      // Process deal level comments
      deals
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal))
        .map(({ DEAL }) => {
          if (DEAL.COMMENT_TEXT && DEAL.ASSOC_TYPE_ID === 1) {
            const { _id } = deal.dealSnapshot.maker;
            const author = DEAL.COMMENT_BY.split(' ');
            const timestamp = epochInSeconds(getEpoch(DEAL.FACILITY.COMMENT_DATE_CREATED_DATETIME));

            tfmComments.push({
              type: 'COMMENT',
              timestamp,
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

      // Process facility level comments
      facilities
        .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === dealId(deal))
        .map(({ DEAL }) => {
          if (DEAL.FACILITY.COMMENT_TEXT) {
            const { _id } = deal.dealSnapshot.maker;
            const author = DEAL.FACILITY.COMMENT_BY.split(' ');

            tfmComments.push({
              type: 'COMMENT',
              timestamp: epochInSeconds(getEpoch(DEAL.FACILITY.COMMENT_DATE_CREATED_DATETIME)),
              text: formatString(DEAL.FACILITY.COMMENT_TEXT),
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

      /**
       * Chronological sort
       *
       * Ensure latest comment always appear on the top
       * and oldest at the bottom.
       */
      tfmComments = tfmComments.sort((a, b) => b.timestamp - a.timestamp);

      allDeals[index].tfm.activities = tfmComments;
    }
  });
};

// ******************** TFM FACILITIES *************************

/**
 * Add dates to TFM facility, following properties
 * are effected:
 * 1. submittedAsIssuedDate (facility.facilitySnapshot.submittedAsIssuedDate)
 * Date when the facility is issued
 */
const dates = () => {
  Object.values(allFacilities).forEach((facility, index) => {
    if (facility.facilitySnapshot && facility.facilitySnapshot.hasBeenIssued) {
      const { facilitySnapshot, tfm } = facility;
      // BSS/EWCS
      if (tfm.premiumSchedule && tfm.premiumSchedule.length) {
        allFacilities[index].facilitySnapshot.submittedAsIssuedDate = new Date(tfm.premiumSchedule[0].created).valueOf();
      }

      // GEF
      if (facilitySnapshot.issuedDate) {
        allFacilities[index].facilitySnapshot.submittedAsIssuedDate = facilitySnapshot.issuedDate;
      }
    }
  });
};

/**
 * Converts following properties to `ObjectId`
 * 1. amendments[i].amendmentId
 * 2. amendments[i].facilityId
 * 3. amendments[i].dealId
 */
const toObjectId = () => {
  Object.values(allFacilities).forEach((facility, index) => {
    if (facility && facility.amendments) {
      const { amendments } = facility;
      if (amendments.length) {
        amendments.forEach((amendment, pointer) => {
          const modifiedAmendment = {
            ...amendment
          };

          if (modifiedAmendment.amendmentId) {
            modifiedAmendment.amendmentId = ObjectId(modifiedAmendment.amendmentId);
          }

          if (modifiedAmendment.facilityId) {
            modifiedAmendment.facilityId = ObjectId(modifiedAmendment.facilityId);
          }

          if (modifiedAmendment.dealId) {
            modifiedAmendment.dealId = ObjectId(modifiedAmendment.dealId);
          }

          allFacilities[index].amendments[pointer] = modifiedAmendment;
        });
      }
    }
  });
};

/**
 * Add Premium Schedule (deal.tfm.premiumSchedule) for pre-calculated
 * Workflow/K2 deals. This also includes PS
 * pre-calculated for Amendments.
 */
const premiumSchedule = async () => {
  const premiumSchedules = await workflow(CONSTANTS.WORKFLOW.FILES.INCOME_EXPOSURE);
  const facilities = Object.values(allFacilities);
  const acceptableFacilities = [
    CONSTANTS.FACILITY.FACILITY_TYPE.BOND,
    CONSTANTS.FACILITY.FACILITY_TYPE.LOAN
  ];
  let index = 0;

  for (const facility of facilities) {
    if (facility.tfm) {
      let premiums = [];
      let period = 1;
      // Add pre-calculated PS to the facility
      premiumSchedules
        .filter(({ DEAL }) =>
          DEAL.FACILITY['UKEF FACILITY ID'] === facility.facilitySnapshot.ukefFacilityId
        && DEAL.FACILITY.PREM_SCH
        && DEAL.FACILITY.PREM_SCH['CURRENT INDICATOR'] === 'Y')
        .map(({ DEAL }) => {
          premiums.push({
            id: period,
            facilityURN: Number(DEAL.FACILITY['UKEF FACILITY ID']).toString(),
            calculationDate: DEAL.FACILITY.PREM_SCH['CALCULATION DATE'],
            income: DEAL.FACILITY.PREM_SCH.INCOME,
            incomePerDay: DEAL.FACILITY.PREM_SCH['INCOME PER DAY'],
            exposure: Math.trunc(DEAL.FACILITY.PREM_SCH.EXPOSURE),
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

      /**
         * Facility has been issued in Portal V2 but has not been updated
         * in Workflow (PS will not exists).
         * If above is true then PS should be manually calculated by invoking
         * PS API with desired payload.
         *
         * This is only applicable to facilities which are wither `Bond` or `Loan`.
         */
      if (facility.facilitySnapshot.hasBeenIssued && !premiums.length && acceptableFacilities.includes(facility.facilitySnapshot.type)) {
        const { exposurePeriodInMonths, facilityGuaranteeDates } = facility.tfm;
        const facilityPremiumSchedule = await getFacilityPremiumSchedule(
          facility,
          exposurePeriodInMonths,
          facilityGuaranteeDates,
          true
        );
        premiums = facilityPremiumSchedule;
      }

      allFacilities[index].tfm.premiumSchedule = premiums;
    }
    index += 1;
  }
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

/**
 * Add amendments to the facility
 * facility.tfm.amendments
 */
const amendment = async () => {
  const amendments = await workflow(CONSTANTS.WORKFLOW.FILES.AMENDMENTS);
  const facilities = await workflow(CONSTANTS.WORKFLOW.FILES.FACILITY);

  for (const facility of Object.values(allFacilities)) {
    const facilityId = facility._id;
    let payload = {};
    let lastAmendment = null;

    /**
     * Filter amendments as per
     * 1. UKEF Facility ID
     * 2. Completed
     */
    const amends = amendments
      .filter(({ DEAL }) => DEAL.FACILITY['UKEF FACILITY ID'] === facility.facilitySnapshot.ukefFacilityId
      && DEAL.FACILITY.STATE === 'COMPLETE');

    // Chronological sort
    amends.sort((a, b) => new Date(a.DEAL.FACILITY.DATE_CREATED).valueOf() - new Date(b.DEAL.FACILITY.DATE_CREATED).valueOf());

    // Iterate over filtered amendments
    for (const [index, amend] of amends.entries()) {
      console.info('\x1b[33m%s\x1b[0m', `Migrating amendment ${index + 1} for Facility ${facilityId}`, '\n');

      // Store last amendment for a correct amendments summary page
      if (index) {
        lastAmendment = amends[index - 1];
      }

      const currency = facilities
        .filter(({ FACILITY }) => FACILITY['UKEF FACILITY ID'] === facility.facilitySnapshot.ukefFacilityId)
        .map(({ FACILITY }) => FACILITY['CURRENCY TYPE'])
        .reduce((c) => c);

      const { amendmentId } = await createAmendment(facilityId);
      const {
        STATE,
        ORIG_VALUE,
        VALUE,
        ORIG_EXPIRY_DATE,
        EXPIRY_DATE,
        EFFECTIVE_FROM_DATE,
        DATE_LAST_UPDATED,
        DATE_CREATED,
        PIM_APPROVAL,
        PIM_COMMENT,
        PIM_COMMENT_BY,
        PIM_DATE_CREATED_DATETIME,
        OUTCOME_COMMENTS,
        DOC_REVIEW_COMMENTS,
      } = amend.DEAL.FACILITY;

      // Construct amendment object with relevant properties
      const status = mapWorkflowStatus(STATE);
      const changeFacilityValue = VALUE ? ORIG_VALUE !== VALUE : false;
      const changeCoverEndDate = EXPIRY_DATE ? ORIG_EXPIRY_DATE !== EXPIRY_DATE : false;
      const approval = PIM_APPROVAL === 'Approved with conditions' ? 'Approved with conditions' : 'Approved without conditions';

      payload = {
        requestDate: getUnixTime(new Date(EFFECTIVE_FROM_DATE).setHours(0, 0, 0, 0)),
        createdAt: getUnixTime(new Date(DATE_CREATED).setHours(0, 0, 0, 0)),
        submittedAt: getUnixTime(new Date(DATE_LAST_UPDATED).setHours(0, 0, 0, 0)),
        updatedAt: getUnixTime(new Date(DATE_LAST_UPDATED).setHours(0, 0, 0, 0)),
        status,
        requireUkefApproval: Boolean(PIM_APPROVAL),
        changeFacilityValue,
        changeCoverEndDate,
        updateTfmLastUpdated: true,
        createTasks: true,
        submittedByPim: true,
        currency,
      };

      if (changeFacilityValue) {
        const currentValue = lastAmendment ? lastAmendment.DEAL.FACILITY.VALUE : ORIG_VALUE;

        payload = {
          ...payload,
          currentValue,
          value: VALUE,
        };
      }

      if (changeCoverEndDate) {
        const currentCoverEndDate = lastAmendment && lastAmendment.DEAL.FACILITY.EXPIRY_DATE
          ? getUnixTime(new Date(lastAmendment.DEAL.FACILITY.EXPIRY_DATE).setHours(0, 0, 0, 0))
          : getUnixTime(new Date(ORIG_EXPIRY_DATE).setHours(0, 0, 0, 0));
        payload = {
          ...payload,
          currentCoverEndDate,
          coverEndDate: getUnixTime(new Date(EXPIRY_DATE).setHours(0, 0, 0, 0)),
        };
      }

      if (payload.requireUkefApproval) {
        // Manual amendment
        payload = {
          ...payload,
          ukefDecision: {
            coverEndDate: changeCoverEndDate ? approval : null,
            value: changeFacilityValue ? approval : null,
            declined: null,
            conditions: approval === 'Approved with conditions' ? formatString(PIM_COMMENT) : '',
            comments: approval === 'Approved with conditions' ? formatString(DOC_REVIEW_COMMENTS || OUTCOME_COMMENTS) : formatString(PIM_COMMENT),
            managersDecisionEmail: true,
            managersDecisionEmailSent: true,
            submitted: true,
            submittedAt: getUnixTime(new Date(PIM_DATE_CREATED_DATETIME).setHours(0, 0, 0, 0)),
            submittedBy: {
              _id: '',
              name: PIM_COMMENT_BY,
              email: '',
              username: PIM_COMMENT_BY,
            }
          },
          bankDecision: {
            decision: CONSTANTS.AMENDMENT.AMENDMENT_BANK_DECISION.PROCEED,
            banksDecisionEmail: true,
            banksDecisionEmailSent: true,
            submitted: true,
            submittedAt: getUnixTime(new Date(PIM_DATE_CREATED_DATETIME).setHours(0, 0, 0, 0)),
            receivedDate: getUnixTime(new Date(DATE_CREATED).setHours(0, 0, 0, 0)),
            effectiveDate: getUnixTime(new Date(EFFECTIVE_FROM_DATE).setHours(0, 0, 0, 0)),
            submittedBy: {
              // _id: '',
              name: PIM_COMMENT_BY,
              email: '',
              username: PIM_COMMENT_BY,
            }
          }
        };
      } else {
        // Automatic amendment
        payload = {
          ...payload,
          effectiveDate: getUnixTime(new Date(EFFECTIVE_FROM_DATE).setHours(0, 0, 0, 0)),
          submissionDate: getUnixTime(new Date(DATE_LAST_UPDATED).setHours(0, 0, 0, 0)),
        };
      }

      // Update draft facility amendment
      await updateAmendment(facilityId, amendmentId, payload);
    }
  }
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
  const { dealType } = deals[0];

  console.info('\x1b[33m%s\x1b[0m', `➕ 2. Applying ${dealType} deals data fixes`, '\n');

  if (deals && deals.length > 0) {
    /**
     * Save deals to global variable for independent data fixes
     * functions.
     */
    allDeals = deals;
    let updated = 0;

    // Deal - Data fixes
    await banking();

    // `BSS/EWCS` only
    if (dealType === CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS) {
      eligibilityCriteria();
    }

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
 * Data fix `BSS/EWCS` TFM deals
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
      await supportingInformations();
      await eStore();
      await tasks();

      const updates = allDeals.map(async (deal) => {
        // Ensure `_id` are kept as ObjectId
        const objectIdDeal = {
          ...deal,
          dealSnapshot: {
            ...deal.dealSnapshot,
            _id: ObjectId(deal.dealSnapshot._id),
          }
        };

        objectIdDeal.dealSnapshot.facilities.map((f, i) => {
          objectIdDeal.dealSnapshot.facilities[i]._id = ObjectId(f._id);
          objectIdDeal.dealSnapshot.facilities[i].dealId = ObjectId(f.dealId);
        });

        await tfmDealUpdate(objectIdDeal)
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
 * Data fix `BSS/EWCS` TFM facilities
 * @param {Array} deals Array of TFM deals objects
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
        await amendment();
        await dates();
        await toObjectId();

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

              return Promise.resolve(allDeals);
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

// ******************** ACTION SHEETS *************************
/**
 * Updates `GEF` TFM deal from action sheet
 */
const actionSheetDeal = async () => {
  try {
    const searches = [
      ['ukefDealId', 'Deal Number', 1],
      ['exporterCreditRating', 'Credit Rating Code', 3],
      ['lossGivenDefault', 'Loss Given Default', 3],
      ['parties.exporter', 'Exporter UR Number', 1],
    ];

    actionsheet(searches)
      .then((data) => {
        allDeals
          .forEach((deal, index) => {
            data
              .filter(({ ukefDealId }) => ukefDealId === dealId(deal))
              .map((updates) => {
                // Iterate over Action sheet updates
                Object.entries(updates)
                  .map((update) => {
                    const path = update[0];
                    const value = update[1];

                    switch (path) {
                      case 'exporterCreditRating':
                        allDeals[index].tfm.exporterCreditRating = value;
                        break;
                      case 'lossGivenDefault':
                        allDeals[index].tfm.lossGivenDefault = value;
                        break;
                      case 'parties.exporter':
                        allDeals[index].tfm.parties.exporter.partyUrn = value;
                        break;
                      default:
                        break;
                    }
                  });
              });
          });
      });
  } catch (e) {
    console.error('Error parsing action sheets for deal', { e });
  }
};

/**
 * Update portal facility
 * @param {String} id Object ID
 * @param {Object} deal Updated deal object
 * @returns {Promise} `Resolve` upon success otherwise `Reject`
 */
const portalUpdateFacility = async (id, facility) => portalFacilityUpdate(id, facility)
  .then((r) => Promise.resolve(r))
  .catch((e) => Promise.reject(new Error('Error updating portal facility: ', { e })));

/**
 * Updates `BSS/EWCS` TFM facilities from action sheet
 */
const actionSheetFacility = async () => {
  try {
    const searches = [
      ['ukefFacilityId', 'Facility Number', 1],
      ['coverEndDate', 'Guarantee Expiry', 6],
      ['coverStartDate', 'Anticipated Issue', 2],
      ['coverPercentage', 'Banks Fees', 4],
    ];

    await actionsheet(searches)
      .then((data) => {
        allFacilities
          .forEach((facility, index) => {
            data
              .filter(({ ukefFacilityId }) => ukefFacilityId === facility.facilitySnapshot.ukefFacilityId)
              .map((updates) => {
                // Iterate over Action sheet updates
                Object.entries(updates)
                  .map((update) => {
                    const path = update[0];
                    const value = update[1];

                    switch (path) {
                      case 'coverEndDate':
                        allFacilities[index].facilitySnapshot.coverEndDate = value;
                        break;
                      case 'coverStartDate':
                        allFacilities[index].facilitySnapshot.coverStartDate = value;
                        break;
                      case 'coverPercentage':
                        allFacilities[index].facilitySnapshot.coverPercentage = value;
                        break;
                      default:
                        break;
                    }
                  });
              });
          });
      });
  } catch (e) {
    console.error('Error parsing action sheets for deal', { e });
  }
};

// processes facility portal action sheet updates
const actionSheetFacilityPortal = async () => {
  try {
    const searches = [
      ['ukefFacilityId', 'Facility Number', 1],
      ['coverEndDate', 'Guarantee Expiry', 6],
      ['coverStartDate', 'Anticipated Issue', 2],
      ['coverPercentage', 'Banks Fees', 4],
    ];

    await actionsheet(searches)
      .then((data) => {
        allFacilities
          .forEach((facility, index) => {
            data
              .filter(({ ukefFacilityId }) => ukefFacilityId === facility.ukefFacilityId)
              .map((updates) => {
                // Iterate over Action sheet updates
                Object.entries(updates)
                  .map((update) => {
                    const path = update[0];
                    const value = update[1];
                    switch (path) {
                      case 'coverEndDate':
                        // `Anticipated Issue` if null
                        if (value !== 'Anticipated Issue') {
                          allFacilities[index].coverEndDate = value;
                        }
                        break;
                      case 'coverStartDate':
                        if (value !== 'Anticipated Issue') {
                          allFacilities[index].coverStartDate = value;
                        }
                        break;
                      case 'coverPercentage':
                        allFacilities[index].coverPercentage = value;
                        break;
                      default:
                        break;
                    }
                  });
              });
          });
      });
  } catch (e) {
    console.error('Error parsing action sheets for facility', { e });
  }
};

/**
 *
 * @param {Array} facilities
 * @param {String} type
 * processes action sheet updates and updates allFacilities array
 * updates facilities collection with updates
 */
const datafixesFacilities = async (facilities, type) => {
  console.info('\x1b[33m%s\x1b[0m', `➕ 2. Applying ${type} portal facilities data fixes`, '\n');

  if (facilities && facilities.length > 0) {
    /**
     * Save facilities to global variable for independent data fixes
     * functions.
     */
    allFacilities = facilities;
    let updated = 0;

    // updates allFacilitiesArray
    await actionSheetFacilityPortal();

    // Update portal
    const updates = allFacilities.map(async (facility) => {
      await portalUpdateFacility(facility._id, facility)
        .then((r) => {
          if (r) {
            updated += 1;
            console.info('\x1b[33m%s\x1b[0m', `${updated}/${allFacilities.length} portal facilities data-fixed.`, '\n');

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

        console.error('\n\x1b[31m%s\x1b[0m', `🚩 ${updated}/${allFacilities.length} facilities have been data-fixed.\n`);
        return Promise.reject();
      })
      .catch((e) => Promise.reject(e));
  }

  return Promise.reject(new Error('Empty data set for facility data fixes'));
};

/**
 * Data fix `GEF` TFM deals
 * @param {Array} deals TFM deals object in an array
 * @returns {Array} deals Data fixed TFM deals object in an array
 */
const datafixTfmDealGef = async (deals) => {
  console.info('\x1b[33m%s\x1b[0m', `➕ 4. Data-fixing ${CONSTANTS.DEAL.DEAL_TYPE.GEF} TFM deals.`, '\n');

  try {
    if (deals && deals.length > 0) {
    /**
     * Save deals to global variable for independent data fixes
     * functions.
     */
      allDeals = deals;
      let updated = 0;

      // TFM Deal - Action sheet data fixes
      await actionSheetDeal();
      await ACBS();
      await importPortalData();

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
 * Data fix `GEF` TFM facilities
 * @param {Array} deals Array of TFM deals objects
 * @returns {Array} TFM facilities data fixed, returned in as array of objects.
 */
const datafixesTfmFacilitiesGef = async (deals) => {
  console.info('\x1b[33m%s\x1b[0m', `➕ 5. Data-fixing ${CONSTANTS.DEAL.DEAL_TYPE.GEF} TFM facilities.`, '\n');

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
        await actionSheetFacility();
        await ACBS(true);
        await dates();

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

      return Promise.reject(new Error('GEF TFM Facilities void data set'));
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
  datafixTfmDealGef,
  datafixesTfmFacilitiesGef,
  datafixesFacilities
};
