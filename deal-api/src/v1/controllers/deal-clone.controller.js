const DEFAULTS = require('../defaults');
const { findMandatoryCriteria } = require('./mandatoryCriteria.controller');
const { findOneDeal, create: createDeal } = require('./deal.controller');
const { generateDealId } = require('../../utils/generateIds');
const { getCloneDealErrors } = require('../validation/clone-deal');
const now = require('../../now');

const CLONE_BOND_FIELDS = [
  '_id',
  'bondStage',
  'requestedCoverStartDate',
  'coverEndDate-day',
  'coverEndDate-month',
  'coverEndDate-year',
  'facilityValue',
  'currencySameAsSupplyContractCurrency',
  'currency',
  'conversionRate',
  'conversionRateDate-day',
  'conversionRateDate-month',
  'conversionRateDate-year',
  'uniqueIdentificationNumber',
  'ukefGuaranteeInMonths',
];

const CLONE_LOAN_FIELDS = [
  '_id',
  'bankReferenceNumber',
  'facilityValue',
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
  // timestamp the newly cloned transactions and treat like a new draft.
  stripped.createdDate = now();

  return stripped;
};

const getCurrentMandatoryCriteria = () => {
  return new Promise( (resolve, reject) => {
    findMandatoryCriteria( resolve );
  });
};

exports.clone = async (req, res) => {
  await findOneDeal(req.params.id, async (existingDeal) => {
    if (!existingDeal) {
      return res.status(404).send();
    }

    const {
      bankSupplyContractID,
      bankSupplyContractName,
      cloneTransactions,
    } = req.body;

    const newDealId = await generateDealId();

    const modifiedDeal = {
      ...existingDeal,
      _id: newDealId,
      comments: [],
      details: {
        bankSupplyContractID,
        bankSupplyContractName,
        dateOfLastAction: existingDeal.details.dateOfLastAction,
        submissionType: existingDeal.details.submissionType,
        maker: req.user,
        owningBank: existingDeal.details.owningBank,
      },
      editedBy: [],
      mandatoryCriteria: await getCurrentMandatoryCriteria(),
    };

    if (cloneTransactions === 'false') {
      modifiedDeal.bondTransactions = DEFAULTS.DEALS.bondTransactions;
      modifiedDeal.loanTransactions = DEFAULTS.DEALS.loanTransactions;
    } else {
      const hasBonds = modifiedDeal.bondTransactions.items.length > 0;
      const hasLoans = modifiedDeal.loanTransactions.items.length > 0;

      if (hasBonds) {
        modifiedDeal.bondTransactions.items = modifiedDeal.bondTransactions.items.map((bond) =>
          stripTransaction(bond, CLONE_BOND_FIELDS));
      }

      if (hasLoans) {
        modifiedDeal.loanTransactions.items = modifiedDeal.loanTransactions.items.map((loan) =>
          stripTransaction(loan, CLONE_LOAN_FIELDS));
      }
    }

    const validationErrors = getCloneDealErrors(modifiedDeal, cloneTransactions);

    if (validationErrors) {
      return res.status(400).send({
        ...modifiedDeal,
        validationErrors,
      });
    }

    req.body = modifiedDeal;
    return createDeal(req, res);
  });
};
