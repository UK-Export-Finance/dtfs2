const { findOneDeal, updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const loanValidationErrors = require('../validation/loan');
const { generateFacilityId } = require('../../utils/generateIds');
// const { loanStatus } = require('../section-status/loan');
const { hasValue } = require('../../utils/string');

const putLoanInDealObject = (deal, loan, otherLoans) => ({
  ...deal,
  loanTransactions: {
    items: [
      ...otherLoans,
      loan,
    ],
  },
});

exports.getLoan = async (req, res) => {
  const {
    id: dealId,
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const loan = deal.loanTransactions.items.find((b) =>
        String(b._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (loan) {
        const validationErrors = loanValidationErrors(loan);

        return res.json({
          dealId,
          loan: {
            ...loan,
            // status: loanStatus(validationErrors),
          },
          validationErrors,
        });
      }
      return res.status(404).send();
    }
    return res.status(404).send();
  });
};

exports.create = async (req, res) => {
  await findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(401).send();
    }

    const facilityId = await generateFacilityId();

    const newLoanObj = {
      _id: facilityId,
    };

    const modifiedDeal = putLoanInDealObject(deal, newLoanObj, deal.loanTransactions.items);

    const newReq = {
      params: req.params,
      body: modifiedDeal,
      user: req.user,
    };

    const updateDealResponse = await updateDeal(newReq, res);

    return res.status(200).send({
      ...updateDealResponse,
      loanId: newLoanObj._id, // eslint-disable-line no-underscore-dangle
    });
  });
};

exports.updateLoan = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const existingLoan = deal.loanTransactions.items.find((loan) =>
        String(loan._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (!existingLoan) {
        return res.status(404).send();
      }

      const allOtherLoans = deal.loanTransactions.items.filter((loan) =>
        String(loan._id) !== loanId); // eslint-disable-line no-underscore-dangle

      const modifiedLoan = {
        _id: loanId,
        ...existingLoan,
        ...req.body,
      };

      const modifiedDeal = putLoanInDealObject(deal, modifiedLoan, allOtherLoans);

      const newReq = {
        params: req.params,
        body: modifiedDeal,
        user: req.user,
      };

      const dealAfterAllUpdates = await updateDeal(newReq, res);

      const loanInDealAfterAllUpdates = dealAfterAllUpdates.loanTransactions.items.find((b) =>
        String(b._id) === loanId); // eslint-disable-line no-underscore-dangle

      const validationErrors = loanValidationErrors(loanInDealAfterAllUpdates);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          loan: loanInDealAfterAllUpdates,
        });
      }

      return res.status(200).send(loanInDealAfterAllUpdates);
    }
    return res.status(404).send();
  });
};
