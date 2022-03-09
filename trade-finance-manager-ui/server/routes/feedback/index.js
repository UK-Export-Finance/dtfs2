const express = require('express');

const api = require('../../api');
const generateValidationErrors = require('../../helpers/validation');

const router = express.Router();

router.get('/', (req, res) =>
  res.render('feedback/feedback-form.njk'));

router.post('/', async (req, res) => {
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
    feedbackBody.userDetails = userDetails;

    const response = await api.createFeedback(feedbackBody);
    if (response) {
      return res.render('feedback/feedback-thankyou.njk', {
        user: req.session.user,
      });
    }
  } catch (catchErr) {
    const { data } = catchErr.response;

    let validationErrors;

    // maps through errorlist
    Object.keys(data.validationErrors.errorList).forEach((errorName) => {
      // get error by its key (errorName)
      const error = data.validationErrors.errorList[errorName];
      // generate errors
      validationErrors = generateValidationErrors(errorName, error.text, data.validationErrors.count, validationErrors);
    });

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
