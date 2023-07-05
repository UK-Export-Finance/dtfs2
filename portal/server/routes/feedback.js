const express = require('express');
const api = require('../api');
const { generateErrorSummary, requestParams } = require('../helpers');

const router = express.Router();

const errorHref = (id) => `#${id}`;

router.get('/feedback', (req, res) =>
  res.render('feedback/feedback-form.njk'));

router.post('/feedback', async (req, res) => {
  const userDetails = {
    username: null,
    email: null,
  };

  try {
    // generates the user object from session if logged in, else null
    if (req.session.user) {
      const { username, email } = req.session.user;
      userDetails.username = username;
      userDetails.email = email;
    }

    const feedbackBody = req.body;
    feedbackBody.submittedBy = userDetails;

    const response = await api.createFeedback(feedbackBody);
    if (response) {
      return res.redirect('/thank-you-feedback');
    }
  } catch (catchErr) {
    const { data } = catchErr.response;

    const validationErrors = generateErrorSummary(
      data.validationErrors,
      errorHref,
    );

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

router.get('/thank-you-feedback', (req, res) =>
  res.render('feedback/feedback-thankyou.njk'));

module.exports = router;
