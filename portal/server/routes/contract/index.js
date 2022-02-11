const express = require('express');
const api = require('../../api');
const aboutRoutes = require('./about');
const bondRoutes = require('./bond');
const eligibilityRoutes = require('./eligibility');
const loanRoutes = require('./loan');
const {
  requestParams,
  errorHref,
  postToApi,
  dealFormsCompleted,
  dealHasIncompleteTransactions,
  generateErrorSummary,
  getFlashSuccessMessage,
} = require('../../helpers');
const {
  provide, DEAL, MANDATORY_CRITERIA,
} = require('../api-data-provider');
const isDealEditable = require('./isDealEditable');
const userCanSubmitDeal = require('./userCanSubmitDeal');
const dealHasIssuedFacilitiesToSubmit = require('./dealHasIssuedFacilitiesToSubmit');
const dealWithCanIssueOrEditIssueFacilityFlags = require('./dealWithCanIssueOrEditIssueFacilityFlags');
const validateToken = require('../middleware/validate-token');

const router = express.Router();

router.use('/contract/*', validateToken);

router.get('/contract/:_id', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;
  const { user } = req.session;

  const { _id: dealId } = deal;

  const canCalculateSupplyContractValues = (submissionDetails) => {
    const { supplyContractCurrency, supplyContractConversionRateToGBP } = submissionDetails;

    const hasRelevantSupplyContractValues = (supplyContractCurrency && supplyContractCurrency.id)
                                            && ((supplyContractCurrency.id === 'GBP')
                                            || (supplyContractConversionRateToGBP));

    if (hasRelevantSupplyContractValues) {
      return true;
    }
    return false;
  };

  // flag to display a message if the deal summary (returned by API) will not account for everything
  const canFullyCalculateDealSummary = (canCalculateSupplyContractValues(deal.submissionDetails)
                                       && !dealHasIncompleteTransactions(deal));

  const confirmedRequestedCoverStartDates = req.session.confirmedRequestedCoverStartDates || {};

  const issuedBonds = deal.bondTransactions.items.filter((b) => b.facilityStage === 'Issued');
  const unconditionalLoans = deal.loanTransactions.items.filter((l) => l.facilityStage === 'Unconditional');
  const issuedTotal = issuedBonds.length + unconditionalLoans.length;

  const allRequestedCoverStartDatesConfirmed = issuedTotal === 0
    || (confirmedRequestedCoverStartDates
      && confirmedRequestedCoverStartDates[dealId]
      && confirmedRequestedCoverStartDates[dealId].length === issuedTotal);

  return res.render('contract/contract-view.njk', {
    successMessage: getFlashSuccessMessage(req),
    deal: dealWithCanIssueOrEditIssueFacilityFlags(user.roles, deal),
    user,
    dealFormsCompleted: dealFormsCompleted(deal),
    canFullyCalculateDealSummary,
    editable: isDealEditable(deal, user),
    userCanSubmit: userCanSubmitDeal(deal, user),
    dealHasIssuedFacilitiesToSubmit: dealHasIssuedFacilitiesToSubmit(deal),
    confirmedRequestedCoverStartDates: confirmedRequestedCoverStartDates[dealId] || [],
    allRequestedCoverStartDatesConfirmed: deal.submissionType === 'Automatic Inclusion Notice' || allRequestedCoverStartDatesConfirmed,
  });
});

router.get('/contract/:_id/comments', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  return res.render('contract/contract-view-comments.njk', {
    deal,
    user: req.session.user,
  });
});

router.get('/contract/:_id/submission-details', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;
  const { user } = req.session;

  return res.render('contract/contract-submission-details.njk', {
    deal,
    user: req.session.user,
    editable: isDealEditable(deal, user),
  });
});

router.get('/contract/:_id/delete', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;
  return res.render('contract/contract-delete.njk', {
    deal,
    user: req.session.user,
  });
});

router.post('/contract/:_id/delete', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;

  const updateToSend = {
    _id,
    comments,
    status: 'Abandoned',
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  const validationErrors = {
    count: data.count,
    errorList: data.errorList,
  };

  if (validationErrors.count) {
    return res.status(400).render('contract/contract-delete.njk', {
      contract: { _id },
      comments,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract abandoned.',
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View abandoned Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/ready-for-review', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  return res.render(
    'contract/contract-ready-for-review.njk',
    {
      deal,
      user: req.session.user,
    },
  );
});

router.post('/contract/:_id/ready-for-review', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;
  const { deal } = req.apiData;

  const updateToSend = {
    _id,
    comments,
    status: "Ready for Checker's approval",
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  const validationErrors = {
    count: data.count,
    errorList: data.errorList,
  };
  if (validationErrors.count) {
    return res.status(400).render('contract/contract-ready-for-review.njk', {
      deal,
      comments,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract submitted for review.',
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/edit-name', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  return res.render('contract/contract-edit-name.njk', {
    contract: deal,
    user: req.session.user,
  });
});

router.post('/contract/:_id/edit-name', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { additionalRefName } = req.body;

  const { data } = await api.updateDealName(_id, additionalRefName, userToken);

  const validationErrors = {
    count: data.count,
    errorList: data.errorList,
  };
  if (validationErrors.count) {
    return res.status(400).render('contract/contract-edit-name.njk', {
      contract: { _id },
      additionalRefName,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: `Supply Contract renamed: ${additionalRefName}`,
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View Supply Contract',
  });

  return res.redirect(`/contract/${_id}`);
});

router.get('/contract/:_id/return-to-maker', async (req, res) => {
  const { _id } = req.params;

  return res.render('contract/contract-return-to-maker.njk', {
    _id,
    user: req.session.user,
  });
});

router.post('/contract/:_id/return-to-maker', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;

  const updateToSend = {
    _id,
    comments,
    status: "Further Maker's input required",
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  const validationErrors = {
    count: data.count,
    errorList: data.errorList,
  };

  if (validationErrors.count) {
    return res.status(400).render('contract/contract-return-to-maker.njk', {
      _id,
      comments,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract returned to maker.',
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/confirm-submission', async (req, res) => {
  const { _id } = req.params;

  return res.render('contract/contract-confirm-submission.njk', {
    _id,
    user: req.session.user,
  });
});

router.post('/contract/:_id/confirm-submission', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { confirmSubmit } = req.body;

  const updateToSend = {
    _id,
    confirmSubmit,
    status: 'Submitted',
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken, req.headers.origin);

  let validationErrors;
  if (data.errorList) {
    validationErrors = {
      count: Object.keys(data.errorList).length,
      errorList: data.errorList,
    };
  } else {
    validationErrors = {
      count: 0,
      errorList: {},
    };
  }

  const formattedValidationErrors = generateErrorSummary(
    validationErrors,
    errorHref,
  );

  if (validationErrors.count) {
    return res.status(400).render('contract/contract-confirm-submission.njk', {
      _id,
      confirmSubmit,
      validationErrors: formattedValidationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract submitted to UKEF.',
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/clone', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  const {
    bankInternalRefName,
    additionalRefName,
  } = deal;

  return res.render('contract/contract-clone.njk', {
    bankInternalRefName,
    additionalRefName: `Copy of ${additionalRefName}`,
    user: req.session.user,
  });
});

router.post('/contract/:_id/clone', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const apiResponse = await postToApi(
    api.cloneDeal(_id, req.body, userToken),
    errorHref,
  );

  const { validationErrors } = apiResponse;

  const {
    bankInternalRefName,
    additionalRefName,
  } = req.body;

  if (validationErrors) {
    return res.status(400).render('contract/contract-clone.njk', {
      bankInternalRefName,
      additionalRefName,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract cloned successfully. We have cleared some values to ensure data quality. Please complete.',
    href: `/contract/${apiResponse._id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View cloned Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/clone/before-you-start', provide([MANDATORY_CRITERIA]), async (req, res) => {
  const { mandatoryCriteria } = req.apiData;
  return res.render('before-you-start/before-you-start.njk', {
    mandatoryCriteria,
    user: req.session.user,
  });
});

router.post('/contract/:_id/clone/before-you-start', async (req, res) => {
  const { _id } = requestParams(req);
  const { criteriaMet } = req.body;

  if (criteriaMet === 'true') {
    return res.redirect(`/contract/${_id}/clone`);
  }
  return res.redirect('/unable-to-proceed');
});

router.use(
  '/',
  aboutRoutes,
  loanRoutes,
  bondRoutes,
  eligibilityRoutes,
);

module.exports = router;
