const express = require('express');
const api = require('../../api');
const { getApiData, requestParams, errorHref, generateErrorSummary, constructPayload, convertUserFormDataToRequest } = require('../../helpers');
const { ALL_BANKS_ID, PRIMARY_NAV_KEY } = require('../../constants');

const router = express.Router();

const getOptionsForRenderingEditUser = async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { user } = req.session;

  const banks = await getApiData(api.banks(userToken), res);
  const userToEdit = await getApiData(api.user(_id, userToken), res);

  return {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    _id,
    banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
    displayedUser: userToEdit,
    user,
  };
};

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Renders the admin users page
 *     tags: [Portal]
 *     description: Renders the admin users page
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 */
router.get('/users', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const userList = await getApiData(api.users(userToken), res);

  const banks = await getApiData(api.banks(userToken), res);

  return res.render('admin/dashboard.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    _id,
    users: userList.users,
    banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
    user: req.session.user,
  });
});

/**
 * @openapi
 * /users/create:
 *   get:
 *     summary: Renders the admin users create page
 *     tags: [Portal]
 *     description: Renders the admin users create page
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 */
router.get('/users/create', async (req, res) => {
  const { userToken } = requestParams(req);

  const banks = await getApiData(api.banks(userToken), res);

  return res.render('admin/user-edit.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
    user: req.session.user,
    displayedUser: { roles: [] },
  });
});

/**
 * @openapi
 * /users/create:
 *   post:
 *     summary: Admin creates a new user
 *     tags: [Portal]
 *     description: Admin creates a new user
 *     responses:
 *       200:
 *         description: Ok
 *       301:
 *         description: Resource moved permanently
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 */
router.post('/users/create', async (req, res) => {
  const { bank } = req.body;

  const { userToken } = requestParams(req);
  const user = convertUserFormDataToRequest(req.body);

  // inflate the bank object
  const banks = await getApiData(api.banks(userToken), res);

  if (bank === 'all') {
    user.bank = {
      id: ALL_BANKS_ID,
      name: 'all',
      hasGefAccessOnly: false,
    };
  } else {
    const selectedBank = banks.find((financialInstitution) => financialInstitution.id === user.bank);
    user.bank = selectedBank;
  }

  const { status, data } = await api.createUser(user, userToken);

  if (status === 200) {
    return res.redirect('/admin/users/');
  }

  const formattedValidationErrors = generateErrorSummary(data.errors, errorHref);

  return res.render('admin/user-edit.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
    user: req.session.user,
    displayedUser: user,
    validationErrors: formattedValidationErrors,
  });
});

/**
 * @openapi
 * /users/edit/:_id:
 *   get:
 *     summary: Get admin updates an existing user page
 *     tags: [Portal]
 *     description: Get admin updates an existing user page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the user ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 */
router.get('/users/edit/:_id', async (req, res) => {
  const options = await getOptionsForRenderingEditUser(req, res);

  return res.render('admin/user-edit.njk', options);
});

/**
 * @openapi
 * /users/edit/:_id:
 *   post:
 *     summary: Admin updates an existing user
 *     tags: [Portal]
 *     description: Admin updates an existing user
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the user ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 */
router.post('/users/edit/:_id', async (req, res) => {
  const payloadProperties = ['firstname', 'surname', 'user-status', 'roles', 'isTrusted'];
  const payload = constructPayload(req.body, payloadProperties);
  const { _id, userToken } = requestParams(req);

  const update = convertUserFormDataToRequest(payload);

  const { status, data } = await api.updateUser(_id, update, userToken);

  if (status === 200) {
    return res.redirect('/admin/users');
  }

  const formattedValidationErrors = generateErrorSummary(data.errors, errorHref);

  const options = await getOptionsForRenderingEditUser(req, res);

  const editedUser = {
    ...options.displayedUser,
    ...update,
  };

  return res.render('admin/user-edit.njk', {
    ...options,
    displayedUser: editedUser,
    validationErrors: formattedValidationErrors,
  });
});

/**
 * @openapi
 * /users/disable/:_id:
 *   get:
 *     summary: Get disable user account confirmation page
 *     tags: [Portal]
 *     description: Get disable user account confirmation page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the user ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 */
router.get('/users/disable/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const user = await getApiData(api.user(_id, userToken), res);

  return res.render('admin/user-disable.njk', {
    _id,
    user,
  });
});

/**
 * @openapi
 * /users/enable/:_id:
 *   get:
 *     summary: Get enable user account confirmation page
 *     tags: [Portal]
 *     description: Get disable user account confirmation page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the user ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 */
router.get('/users/enable/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const user = await getApiData(api.user(_id, userToken), res);

  return res.render('admin/user-enable.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    _id,
    user,
  });
});

/**
 * @openapi
 * /users/reset-password/:_id:
 *   get:
 *     summary: Get user reset password confirmation page
 *     tags: [Portal]
 *     description: Get user reset password confirmation page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the user ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 */
router.get('/users/reset-password/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  try {
    // Get user information
    const user = await getApiData(api.user(_id, userToken), res);

    return res.render('admin/user-reset-password.njk', {
      _id,
      user,
    });
  } catch (error) {
    console.error('Error fetching user data for password reset %o', error);
    return res.render('_partials/problem-with-service.njk');
  }
});

/**
 * @openapi
 * /users/reset-password/:_id:
 *   post:
 *     summary: Post user reset password
 *     tags: [Portal]
 *     description: Post user reset password
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the user ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 */
router.post('/users/reset-password/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  try {
    // Get user information
    const user = await getApiData(api.user(_id, userToken), res);

    // Reset user password
    await api.resetPassword(user.username);

    return res.render('admin/submitted-page.njk', {
      _id,
      user,
    });
  } catch (error) {
    console.error('Error sending reset password link %o', error);

    const errorObject = {
      reset: {
        line1: 'Try again later',
        line2: 'The password reset request has not been sent',
        hrefText: 'Back to password reset',
        href: '/dashboard/deals',
      },
    };

    return res.render('_partials/problem-with-service.njk', {
      error: errorObject,
    });
  }
});

module.exports = router;
