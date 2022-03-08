const express = require('express');
const api = require('../api');
const { generateErrorSummary } = require('../helpers');

const router = express.Router();

const errorHref = (id) => `#${id}`;

router.get('/feedback', (req, res) =>
  res.render('feedback/feedback-form.njk'));

router.post('/feedback', async (req, res) => {
  try {
    const response = await api.createFeedback(req.body, req.session.user);
    if (response) {
      return res.render('feedback/feedback-thankyou.njk', {
        user: req.session.user,
      });
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
    feedack: req.body,
    user: req.session.user,
  });
});

module.exports = router;
