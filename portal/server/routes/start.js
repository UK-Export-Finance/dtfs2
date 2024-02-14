const express = require('express');
const api = require('../api');
const { requestParams, generateErrorSummary, errorHref, postToApi, constructPayload } = require('../helpers');
const { validateToken, validateRole } = require('./middleware');
const { provide, MANDATORY_CRITERIA } = require('./api-data-provider');
const beforeYouStartValidation = require('../validation/before-you-start');
const { ROLES: { MAKER } } = require('../constants');

const router = express.Router();
router.use('/before-you-start/*', validateToken);

router.get('/before-you-start', [validateRole({ role: [MAKER] }), provide([MANDATORY_CRITERIA])], async (req, res) => {
  const { mandatoryCriteria } = req.apiData;
  res.render('before-you-start/before-you-start.njk', {
    mandatoryCriteria,
    user: req.session.user,
  });
});

router.post('/before-you-start', [validateRole({ role: [MAKER] }), provide([MANDATORY_CRITERIA])], async (req, res) => {
  const { mandatoryCriteria } = req.apiData;

  const validationErrors = generateErrorSummary(beforeYouStartValidation(req.body), errorHref);

  if (validationErrors) {
    return res.render('before-you-start/before-you-start.njk', {
      mandatoryCriteria,
      validationErrors,
    });
  }

  if (req.body.criteriaMet === 'false') {
    return res.redirect('/unable-to-proceed');
  }

  return res.redirect('/before-you-start/bank-deal');
});

router.get('/before-you-start/bank-deal', validateRole({ role: [MAKER] }), async (req, res) => {
  res.render('before-you-start/before-you-start-bank-deal.njk', {
    user: req.session.user,
  });
});

router.post('/before-you-start/bank-deal', [validateRole({ role: [MAKER] }), provide([MANDATORY_CRITERIA])], async (req, res) => {
  const { userToken } = requestParams(req);

  const allowedFields = [
    'bankInternalRefName',
    'additionalRefName',
  ];
  const sanitizedBody = constructPayload(req.body, allowedFields);

  const newDeal = {
    ...sanitizedBody,
    mandatoryCriteria: req.apiData[MANDATORY_CRITERIA],
  };

  const apiResponse = await postToApi(api.createDeal(newDeal, userToken), errorHref);

  const { validationErrors } = apiResponse;

  if (validationErrors) {
    const { bankInternalRefName, additionalRefName } = req.body;

    return res.status(400).render('before-you-start/before-you-start-bank-deal.njk', {
      bankInternalRefName,
      additionalRefName,
      validationErrors,
      user: req.session.user,
    });
  }

  return res.redirect(`/contract/${apiResponse._id}`);
});

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk', { user: req.session.user }));

module.exports = router;
