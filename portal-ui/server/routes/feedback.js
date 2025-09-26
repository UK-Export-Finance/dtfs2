const express = require('express');
const { generateNoUserLoggedInAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const api = require('../api');
const { generateErrorSummary } = require('../helpers');

const router = express.Router();

const errorHref = (id) => `#${id}`;

/**
 * @openapi
 * /feedback:
 *   get:
 *     summary: Renders feedback form page.
 *     tags: [Portal]
 *     description: Renders feedback form page.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/feedback', (req, res) => res.render('feedback/feedback-form.njk'));

/**
 * @openapi
 * /feedback:
 *   post:
 *     summary: Create feedback
 *     tags: [Portal]
 *     description: Create feedback
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
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
 *       500:
 *         description: Internal server error
 */
router.post('/feedback', async (req, res) => {
  const userDetails = {
    username: null,
    email: null,
  };
  let sessionUserId = null;

  try {
    // generates the user object from session if logged in, else null
    if (req.session.user) {
      const { _id, username, email } = req.session.user;
      userDetails.username = username;
      userDetails.email = email;
      sessionUserId = _id;
    }

    const feedbackBody = req.body;
    feedbackBody.submittedBy = userDetails;
    feedbackBody.auditDetails = sessionUserId ? generatePortalAuditDetails(sessionUserId) : generateNoUserLoggedInAuditDetails();

    const response = await api.createFeedback(feedbackBody);
    if (response) {
      return res.redirect('/thank-you-feedback');
    }
  } catch (catchErr) {
    const { data } = catchErr.response;

    const validationErrors = generateErrorSummary(data.validationErrors, errorHref);

    return res.render('feedback/feedback-form.njk', {
      feedback: data.feedback,
      validationErrors,
      user: req.session.user,
    });
  }

  return res.render('feedback/feedback-form.njk', {
    feedback: req.body,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /thank-you-feedback:
 *   get:
 *     summary: Renders thank you feedback page.
 *     tags: [Portal]
 *     description: Renders thank you feedback page.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/thank-you-feedback', (req, res) => res.render('feedback/feedback-thankyou.njk'));

module.exports = router;
