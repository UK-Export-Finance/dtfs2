const api = require('#api');
const { generateErrorSummary } = require('#server-helpers/generateErrorSummary.helper.js');
const { errorHref } = require('#server-helpers/errorHref.helper.js');

const getUserProfile = (req, res) => {
  if (req?.session?.user) {
    return res.render('user/change-password.njk', {
      _id: req.session?.user?._id,
      user: req?.session?.user,
      requireCurrentPassword: true,
    });
  }
  return res.redirect('/');
};

const postUserProfile = async (req, res) => {
  const { userToken } = req.session;
  if (req?.session?.user) {
    const { _id } = req.session.user;
    const { status, data } = await api.updateUserPassword(_id, req.body, userToken);

    if (status === 200) {
      return res.redirect('/user/change-password');
    }

    const formattedValidationErrors = generateErrorSummary(data.errors, errorHref);

    return res.render('user/change-password.njk', {
      _id,
      user: req.session.user,
      validationErrors: formattedValidationErrors,
      requireCurrentPassword: true,
    });
  }
  const message = 'Unable to update the user details: The current user is not logged in';
  console.error(message);
  return { status: 400, message };
};

module.exports = { getUserProfile, postUserProfile };
