const express = require('express');
const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const api = require('../api');
const { requestParams, generateErrorSummary, errorHref, postToApi, constructPayload } = require('../helpers');
const { validateToken, validateRole } = require('./middleware');
const { provide, MANDATORY_CRITERIA } = require('./api-data-provider');
const beforeYouStartValidation = require('../validation/before-you-start');

const router = express.Router();
router.use('/before-you-start/*', validateToken);

/**
 * @openapi
 * /before-you-start:
 *   get:
 *     summary: Renders the before you start page.
 *     tags: [Portal]
 *     description: Renders the before you start page.
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *
 */
router.get('/before-you-start', [validateRole({ role: [MAKER] }), provide([MANDATORY_CRITERIA])], async (req, res) => {
  const { mandatoryCriteria } = req.apiData;
  res.render('before-you-start/before-you-start.njk', {
    mandatoryCriteria,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /before-you-start:
 *   post:
 *     summary: Check mandatory criteria and create a new deal if criteria met
 *     tags: [Portal]
 *     description: Check mandatory criteria and create a new deal if criteria met
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource moved permanently
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 */
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

/**
 * @openapi
 * /before-you-start/bank-deal:
 *   get:
 *     summary: Renders before you start bank deal page.
 *     tags: [Portal]
 *     description: Renders before you start bank deal page.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/before-you-start/bank-deal', validateRole({ role: [MAKER] }), async (req, res) => {
  res.render('before-you-start/before-you-start-bank-deal.njk', {
    user: req.session.user,
  });
});

/**
 * @openapi
 * /before-you-start/bank-deal:
 *   post:
 *     summary: Post before you start bank deal
 *     tags: [Portal]
 *     description: Post before you start bank deal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 */
router.post('/before-you-start/bank-deal', [validateRole({ role: [MAKER] }), provide([MANDATORY_CRITERIA])], async (req, res) => {
  const { userToken } = requestParams(req);

  const allowedFields = ['bankInternalRefName', 'additionalRefName'];
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

/**
 * @openapi
 * /unable-to-proceed:
 *   get:
 *     summary: Renders unable to proceed page.
 *     tags: [Portal]
 *     description: Renders unable to proceed page.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk', { user: req.session.user }));

module.exports = router;
