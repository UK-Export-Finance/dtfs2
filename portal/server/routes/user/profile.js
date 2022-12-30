const express = require('express');
const api = require('../../api');
const {
  constructPayload,
  getApiData,
  requestParams,
  errorHref,
  generateErrorSummary,
} = require('../../helpers');

const router = express.Router();

router.get('/:_id', async (req, res) => {
  const { userToken } = requestParams(req);

  const { _id } = req.session.user;

  const user = await getApiData(api.user(_id, userToken), res);

  return res.render('user/profile.njk', {
    _id,
    user,
  });
});

// When user is logged in and would like to change the password
router.get('/:_id/change-password', async (req, res) => {
  const { _id } = requestParams(req);

  return res.render('user/change-password.njk', {
    _id,
    user: req.session.user,
    requireCurrentPassword: true,
  });
});

// When user is logged in and would like to change the password
router.post('/:_id/change-password', async (req, res) => {
  // Ensure that the user is logged in
  if (req?.session?.user) {
    let formattedValidationErrors;
    const payloadProperties = [
      'currentPassword',
      'password',
      'passwordConfirm',
    ];
    const payload = constructPayload(req.body, payloadProperties);
    const { _id } = requestParams(req);
    const { currentPassword, password, passwordConfirm } = payload;

    if (!currentPassword || !password || !passwordConfirm) {
      const error = {
        count: 0,
        errorList: {},
      };

      if (!currentPassword) {
        error.count += 1;
        error.errorList = {
          ...error.errorList,
          currentPassword: { order: '1', text: 'Current password is not correct.' },
        };
      }

      if (!password) {
        error.count += 1;
        error.errorList = {
          ...error.errorList,
          password: { order: '2', text: 'Password is not correct.' },
        };
      }

      if (!passwordConfirm) {
        error.count += 1;
        error.errorList = {
          ...error.errorList,
          passwordConfirm: { order: '3', text: 'Confirm password is not correct.' },
        };
      }

      formattedValidationErrors = generateErrorSummary(error, errorHref);
    } else {
      const { status, data } = await api.updateUser(_id, payload, req.session.userToken);

      if (status === 200) {
        return res.redirect(`/user/${_id}`);
      }
      formattedValidationErrors = generateErrorSummary(data.errors, errorHref);
    }

    return res.render('user/change-password.njk', {
      _id,
      user: req.session.user,
      validationErrors: formattedValidationErrors,
      requireCurrentPassword: true,
    });
  }
  return res.redirect('/');
});

module.exports = router;
