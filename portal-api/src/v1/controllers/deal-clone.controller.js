const DEFAULTS = require('../defaults');
const { findMandatoryCriteria } = require('./mandatoryCriteria.controller');
const { findOneDeal, createDeal } = require('./deal.controller');
const { getCloneDealErrors } = require('../validation/clone-deal');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');

const CLONE_BOND_FIELDS = [
  'type',
  'facilityStage',
  'requestedCoverStartDate',
  'coverEndDate-day',
  'coverEndDate-month',
  'coverEndDate-year',
  'value',
  'currencySameAsSupplyContractCurrency',
  'currency',
  'conversionRate',
  'conversionRateDate-day',
  'conversionRateDate-month',
  'conversionRateDate-year',
  'name',
  'ukefGuaranteeInMonths',
];

const CLONE_LOAN_FIELDS = [
  'type',
  'name',
  'value',
  'currency',
  'currencySameAsSupplyContractCurrency',
  'conversionRate',
  'conversionRateDate-day',
  'conversionRateDate-month',
  'conversionRateDate-year',
  'disbursementAmount',
  'requestedCoverStartDate',
  'coverEndDate-day',
  'coverEndDate-month',
  'coverEndDate-year',
  'ukefGuaranteeInMonths',
];

const stripTransaction = (transaction, allowedFields) => {
  const stripped = {};

  Object.keys(transaction).forEach((key) => {
    if (allowedFields.includes(key)) {
      stripped[key] = transaction[key];
    }
  });

  return stripped;
};

const getCurrentMandatoryCriteria = () => new Promise((resolve) => {
  findMandatoryCriteria(resolve);
});

exports.clone = async (req, res) => {
  await findOneDeal(req.params.id, async (existingDeal) => {
    if (!existingDeal) {
      return res.status(404).send();
    }

    const {
      bankInternalRefName,
      additionalRefName,
      cloneTransactions,
    } = req.body;

    const { _id, tfm, ...existingDealWithoutId } = existingDeal;

    const modifiedDeal = {
      ...existingDealWithoutId,
      status: DEFAULTS.DEAL.status,
      submissionType: existingDeal.submissionType,
      updatedAt: existingDeal.updatedAt,
      bankInternalRefName,
      additionalRefName,
      bank: existingDeal.bank,
      details: {
        maker: req.user,
      },
      mandatoryCriteria: await getCurrentMandatoryCriteria(),
      editedBy: [],
      comments: [],
      ukefComments: [],
      specialConditions: [],
      bondTransactions: DEFAULTS.DEAL.bondTransactions,
      loanTransactions: DEFAULTS.DEAL.loanTransactions,
      facilities: DEFAULTS.DEAL.facilities,
    };

    if (modifiedDeal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      modifiedDeal.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
    }

    const validationErrors = getCloneDealErrors(modifiedDeal, cloneTransactions);

    if (validationErrors) {
      return res.status(400).send({
        ...modifiedDeal,
        validationErrors,
      });
    }

    const {
      data: createdDeal,
    } = await createDeal(modifiedDeal, req.user);

    const createdDealId = createdDeal._id; // eslint-disable-line no-underscore-dangle

    if (cloneTransactions === 'true') {
      const hasBonds = existingDeal.bondTransactions.items.length > 0;
      const hasLoans = existingDeal.loanTransactions.items.length > 0;

      if (hasBonds || hasLoans) {
        const facilities = [
          ...existingDeal.bondTransactions.items,
          ...existingDeal.loanTransactions.items,
        ];

        const strippedFacilities = facilities.map((facility) => {
          if (facility.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
            return stripTransaction(facility, CLONE_BOND_FIELDS);
          }

          if (facility.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
            return stripTransaction(facility, CLONE_LOAN_FIELDS);
          }
          return facility;
        });

        await facilitiesController.createMultipleFacilities(
          strippedFacilities,
          createdDealId,
          req.user,
        );
      }
    }

    return res.status(200).send(createdDeal);
  });
};
