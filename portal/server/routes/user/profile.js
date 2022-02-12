const express = require('express');
const api = require('../../api');
const {
  getApiData,
  requestParams,
  errorHref,
  generateErrorSummary,
} = require('../../helpers');

const router = express.Router();

router.get('/:_id', async (req, res) => {
  const { userToken } = requestParams(req);

  const { _id } = req.session.user;

  const user = await getApiData(
    api.user(_id, userToken),
    res,
  );

  return res.render(
    'user/profile.njk',
    {
      _id,
      user,
    },
  );
});

router.get('/:_id/change-password', async (req, res) => {
  const { _id } = requestParams(req);

  return res.render(
    'user/change-password.njk',
    {
      _id,
      user: req.session.user,
      requireCurrentPassword: true,
    },
  );
});

router.post('/:_id/change-password', async (req, res) => {
  const { _id } = requestParams(req);

  const { status, data } = await api.updateUser(_id, req.body, req.session.userToken);

  if (status === 200) {
    return res.redirect(`/user/${_id}`);
  }

  const formattedValidationErrors = generateErrorSummary(
    data.errors,
    errorHref,
  );

  return res.render(
    'user/change-password.njk',
    {
      _id,
      user: req.session.user,
      validationErrors: formattedValidationErrors,
      requireCurrentPassword: true,
    },
  );
});

module.exports = router;
