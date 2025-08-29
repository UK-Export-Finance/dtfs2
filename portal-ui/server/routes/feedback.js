const express = require('express');
const { generateNoUserLoggedInAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const api = require('../api');
const { generateErrorSummary } = require('../helpers');

const router = express.Router();

const errorHref = (id) => `#${id}`;

router.get('/feedback', (req, res) => res.render('feedback/feedback-form.njk'));

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

router.get('/thank-you-feedback', (req, res) => res.render('feedback/feedback-thankyou.njk'));

module.exports = router;
