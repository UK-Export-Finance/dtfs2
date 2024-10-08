const { generateNoUserLoggedInAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const api = require('../../api');
const { generateValidationErrors } = require('../../helpers/validation');

const getFeedback = (req, res) => res.render('feedback/feedback-form.njk');

// thank you page once feedback posted
const thankYouFeedback = (req, res) => res.render('feedback/feedback-thankyou.njk');

const postFeedback = async (req, res) => {
  const userDetails = {
    username: null,
    email: null,
  };
  let sessionUserId = null;

  try {
    // generates the user object from session if logged in, else null
    if (req.session.user) {
      const { username, email, _id } = req.session.user;

      userDetails.username = username;
      userDetails.email = email;
      sessionUserId = _id;
    }

    const feedbackBody = req.body;
    feedbackBody.submittedBy = userDetails;
    feedbackBody.auditDetails = sessionUserId ? generateTfmAuditDetails(sessionUserId) : generateNoUserLoggedInAuditDetails();

    const response = await api.createFeedback(feedbackBody);

    if (response) {
      return res.redirect('/thank-you-feedback');
    }
  } catch (catchErr) {
    const { data } = catchErr.response;

    let validationErrors;

    if (data?.validationErrors?.errorList) {
      // maps through errorlist
      Object.keys(data.validationErrors.errorList).forEach((errorName) => {
        // get error by its key (errorName)
        const error = data.validationErrors.errorList[errorName];
        // generate errors
        validationErrors = generateValidationErrors(errorName, error.text, data.validationErrors.count, validationErrors);
      });
    }

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
};

module.exports = {
  getFeedback,
  postFeedback,
  thankYouFeedback,
};
