const express = require('express');
const {
  CURRENCY,
  ROLES: { CHECKER, MAKER },
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
} = require('@ukef/dtfs2-common');
const api = require('../../api');
const aboutRoutes = require('./about');
const bondRoutes = require('./bond');

const loanRoutes = require('./loan');
const {
  requestParams,
  errorHref,
  postToApi,
  isEveryDealFormComplete,
  isEveryFacilityInDealComplete,
  generateErrorSummary,
  getFlashSuccessMessage,
} = require('../../helpers');
const { provide, DEAL, MANDATORY_CRITERIA } = require('../api-data-provider');
const isDealEditable = require('./isDealEditable');
const userCanSubmitDeal = require('./userCanSubmitDeal');
const dealHasIssuedFacilitiesToSubmit = require('./dealHasIssuedFacilitiesToSubmit');
const dealWithCanIssueOrEditIssueFacilityFlags = require('./dealWithCanIssueOrEditIssueFacilityFlags');
const { validateToken, validateBank, validateRole } = require('../middleware');
const { PRODUCT } = require('../../constants');

const router = express.Router();

router.use('/contract/*', validateToken);

/**
 * @openapi
 * /contract/:_id:
 *   get:
 *     summary: Get the contract view page
 *     tags: [Portal]
 *     description: Get the contract view page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *
 */
router.get('/contract/:_id', [provide([DEAL]), validateBank], async (req, res) => {
  const { deal } = req.apiData;
  const { user } = req.session;
  const { _id } = req.params;

  const { _id: dealId, dealType } = deal;

  // Ensure application is `BSS/EWCS`
  if (dealType !== PRODUCT.BSS_EWCS) {
    console.error('Deal ID %s specified is not a BSS/EWCS deal', _id);
    return res.render('_partials/problem-with-service.njk');
  }

  const canCalculateSupplyContractValues = (submissionDetails) => {
    const { supplyContractCurrency, supplyContractConversionRateToGBP } = submissionDetails;

    const hasRelevantSupplyContractValues =
      supplyContractCurrency && supplyContractCurrency.id && (supplyContractCurrency.id === CURRENCY.GBP || supplyContractConversionRateToGBP);

    if (hasRelevantSupplyContractValues) {
      return true;
    }
    return false;
  };

  // flag to display a message if the deal summary (returned by API) will not account for everything
  const canFullyCalculateDealSummary = canCalculateSupplyContractValues(deal.submissionDetails) && isEveryFacilityInDealComplete(deal);

  const confirmedRequestedCoverStartDates = req.session.confirmedRequestedCoverStartDates || {};

  const issuedBonds = deal.bondTransactions.items.filter((b) => b.facilityStage === 'Issued');
  const unconditionalLoans = deal.loanTransactions.items.filter((l) => l.facilityStage === 'Unconditional');
  const issuedTotal = issuedBonds.length + unconditionalLoans.length;

  const allRequestedCoverStartDatesConfirmed =
    issuedTotal === 0 ||
    (confirmedRequestedCoverStartDates && confirmedRequestedCoverStartDates[dealId] && confirmedRequestedCoverStartDates[dealId].length === issuedTotal);

  const dealCancelledStatus = [DEAL_STATUS.CANCELLED, DEAL_STATUS.PENDING_CANCELLATION];

  return res.render('contract/contract-view.njk', {
    successMessage: getFlashSuccessMessage(req),
    deal: dealWithCanIssueOrEditIssueFacilityFlags(user.roles, deal),
    user,
    isEveryDealFormComplete: isEveryDealFormComplete(deal),
    canFullyCalculateDealSummary,
    editable: isDealEditable(deal, user),
    userCanSubmit: userCanSubmitDeal(deal, user),
    dealHasIssuedFacilitiesToSubmit: dealHasIssuedFacilitiesToSubmit(deal),
    confirmedRequestedCoverStartDates: confirmedRequestedCoverStartDates[dealId] || [],
    allRequestedCoverStartDatesConfirmed: deal.submissionType === DEAL_SUBMISSION_TYPE.AIN || allRequestedCoverStartDatesConfirmed,
    canCloneDeal: !dealCancelledStatus.includes(deal.status),
  });
});

/**
 * @openapi
 * /contract/:_id/comments:
 *   get:
 *     summary: Get the contract view comments page
 *     tags: [Portal]
 *     description: Get the contract view comments page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 */
router.get('/contract/:_id/comments', [provide([DEAL]), validateBank], async (req, res) => {
  const { deal } = req.apiData;

  return res.render('contract/contract-view-comments.njk', {
    deal,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /contract/:_id/submission-details:
 *   get:
 *     summary: Get the contract submission details page
 *     tags: [Portal]
 *     description: Get the contract submission details page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 */
router.get('/contract/:_id/submission-details', [provide([DEAL]), validateBank], async (req, res) => {
  const { deal } = req.apiData;
  const { user } = req.session;

  return res.render('contract/contract-submission-details.njk', {
    deal,
    user: req.session.user,
    editable: isDealEditable(deal, user),
  });
});

/**
 * @openapi
 * /contract/:_id/delete:
 *   get:
 *     summary: Get the contract delete page
 *     tags: [Portal]
 *     description: Get the contract delete page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 */
router.get('/contract/:_id/delete', [validateRole({ role: [MAKER] }), provide([DEAL]), validateBank], async (req, res) => {
  const { deal } = req.apiData;
  return res.render('contract/contract-delete.njk', {
    deal,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /contract/:_id/delete:
 *   post:
 *     summary: Post abandon contract
 *     tags: [Portal]
 *     description: Get the contract view page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post('/contract/:_id/delete', [validateRole({ role: [MAKER] }), validateBank], async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;

  const updateToSend = {
    _id,
    comments,
    status: 'Abandoned',
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  if (!data) {
    console.error('Invalid response received for deal %s %o', _id, data);
    return res.status(500).render('_partials/problem-with-service.njk');
  }

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
    href: `/contract/${_id}`,
    hrefText: 'View abandoned Supply Contract',
  });

  return res.redirect('/dashboard');
});

/**
 * @openapi
 * /contract/:_id/ready-for-review:
 *   get:
 *     summary: Get the contract ready for review page
 *     tags: [Portal]
 *     description: Get the contract ready for review page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 */
router.get('/contract/:_id/ready-for-review', [validateRole({ role: [MAKER] }), provide([DEAL]), validateBank], async (req, res) => {
  const { deal } = req.apiData;

  return res.render('contract/contract-ready-for-review.njk', {
    deal,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /contract/:_id/ready-for-review:
 *   post:
 *     summary: Post contract submitted for review
 *     tags: [Portal]
 *     description: Post contract submitted for review
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post('/contract/:_id/ready-for-review', [validateRole({ role: [MAKER] }), provide([DEAL]), validateBank], async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;
  const { deal } = req.apiData;

  const updateToSend = {
    _id,
    comments,
    status: "Ready for Checker's approval",
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  if (!data) {
    console.error('Invalid response received for deal %s %o', _id, data);
    return res.status(500).render('_partials/problem-with-service.njk');
  }

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
    href: `/contract/${_id}`,
    hrefText: 'View Supply Contract',
  });

  return res.redirect('/dashboard');
});

/**
 * @openapi
 * /contract/:_id/edit-name:
 *   get:
 *     summary: Get the contract edit name page
 *     tags: [Portal]
 *     description: Get the contract edit name page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 */
router.get('/contract/:_id/edit-name', [validateRole({ role: [MAKER] }), provide([DEAL]), validateBank], async (req, res) => {
  const { deal } = req.apiData;

  return res.render('contract/contract-edit-name.njk', {
    contract: deal,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /contract/:_id/edit-name:
 *   post:
 *     summary: Post contract edit name
 *     tags: [Portal]
 *     description: Post contract edit name
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post('/contract/:_id/edit-name', [validateRole({ role: [MAKER] }), validateBank], async (req, res) => {
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
    href: `/contract/${_id}`,
    hrefText: 'View Supply Contract',
  });

  return res.redirect(`/contract/${_id}`);
});

/**
 * @openapi
 * /contract/:_id/return-to-maker:
 *   get:
 *     summary: Get the contract return to maker page
 *     tags: [Portal]
 *     description: Get the contract return to maker page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 */
router.get('/contract/:_id/return-to-maker', [validateRole({ role: [CHECKER] }), validateBank], async (req, res) => {
  const { _id } = req.params;

  return res.render('contract/contract-return-to-maker.njk', {
    _id,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /contract/:_id/return-to-maker:
 *   post:
 *     summary: Post return to maker
 *     tags: [Portal]
 *     description: Post return to maker
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post('/contract/:_id/return-to-maker', [validateRole({ role: [CHECKER] }), validateBank], async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;

  const updateToSend = {
    _id,
    comments,
    status: "Further Maker's input required",
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  if (!data) {
    console.error('Invalid response received for deal %s %o', _id, data);
    return res.status(500).render('_partials/problem-with-service.njk');
  }

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
    href: `/contract/${_id}`,
    hrefText: 'View Supply Contract',
  });

  return res.redirect('/dashboard');
});

/**
 * @openapi
 * /contract/:_id/confirm-submission:
 *   get:
 *     summary: Get the confirm submission page
 *     tags: [Portal]
 *     description: Get the confirm submission page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 */
router.get('/contract/:_id/confirm-submission', [validateRole({ role: [CHECKER] }), validateBank], async (req, res) => {
  const { _id } = req.params;

  return res.render('contract/contract-confirm-submission.njk', {
    _id,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /contract/:_id/confirm-submission:
 *   post:
 *     summary: Post confirm submission
 *     tags: [Portal]
 *     description: Post confirm submission
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post('/contract/:_id/confirm-submission', [validateRole({ role: [CHECKER] }), provide([DEAL]), validateBank], async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { confirmSubmit } = req.body;

  const updateToSend = {
    _id,
    confirmSubmit,
    status: 'Submitted',
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  if (!data) {
    console.error('Invalid response received for deal %s %o', _id, data);
    return res.status(500).render('_partials/problem-with-service.njk');
  }

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

  const formattedValidationErrors = generateErrorSummary(validationErrors, errorHref);

  if (validationErrors.count) {
    return res.status(400).render('contract/contract-confirm-submission.njk', {
      _id,
      confirmSubmit,
      validationErrors: formattedValidationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract submitted to UKEF.',
    href: `/contract/${_id}`,
    hrefText: 'View Supply Contract',
  });

  return res.redirect('/dashboard');
});

/**
 * @openapi
 * /contract/:_id/clone:
 *   get:
 *     summary: Get the contract clone page
 *     tags: [Portal]
 *     description: Get the contract clone page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 */
router.get('/contract/:_id/clone', [validateRole({ role: [MAKER] }), provide([DEAL]), validateBank], async (req, res) => {
  const { deal } = req.apiData;

  const { bankInternalRefName, additionalRefName } = deal;

  return res.render('contract/contract-clone.njk', {
    bankInternalRefName,
    additionalRefName: `Copy of ${additionalRefName}`,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /contract/:_id/clone:
 *   post:
 *     summary: Post contract clone
 *     tags: [Portal]
 *     description: Post contract clone
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post('/contract/:_id/clone', [validateRole({ role: [MAKER] }), validateBank], async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const apiResponse = await postToApi(api.cloneDeal(_id, req.body, userToken), errorHref);

  const { validationErrors } = apiResponse;

  const { bankInternalRefName, additionalRefName } = req.body;

  if (validationErrors) {
    return res.status(400).render('contract/contract-clone.njk', {
      bankInternalRefName,
      additionalRefName,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract cloned successfully. We have cleared some values to ensure data quality. Please complete.',
    href: `/contract/${apiResponse._id}`,
    hrefText: 'View cloned Supply Contract',
  });

  return res.redirect('/dashboard');
});

/**
 * @openapi
 * /contract/:_id/clone/before-you-start:
 *   get:
 *     summary: Get the before you start page
 *     tags: [Portal]
 *     description: Get the before you start page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 */
router.get('/contract/:_id/clone/before-you-start', [validateRole({ role: [MAKER] }), provide([MANDATORY_CRITERIA]), validateBank], async (req, res) => {
  const { mandatoryCriteria } = req.apiData;
  return res.render('before-you-start/before-you-start.njk', {
    mandatoryCriteria,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /contract/:_id/clone/before-you-start:
 *   post:
 *     summary: Post before you start
 *     tags: [Portal]
 *     description: Post before you start
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post('/contract/:_id/clone/before-you-start', [validateRole({ role: [MAKER] }), validateBank], async (req, res) => {
  const { _id } = requestParams(req);
  const { criteriaMet } = req.body;

  if (criteriaMet === 'true') {
    return res.redirect(`/contract/${_id}/clone`);
  }
  return res.redirect('/unable-to-proceed');
});

router.use('/', aboutRoutes, loanRoutes, bondRoutes);

module.exports = router;
